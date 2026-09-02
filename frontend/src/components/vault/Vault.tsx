import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VaultStatus, VaultNote, VaultTag, VAULT_TAG_LABELS, VAULT_TAG_COLORS } from '../../types/vault';
import vaultApi from '../../services/vaultApi';
import { deriveVaultKey } from '../../utils/vaultCrypto';
import { VaultSetupModal } from './VaultSetupModal';
import { VaultUnlockGate } from './VaultUnlockGate';
import { VaultNoteModal } from './VaultNoteModal';
import { VaultNoteViewModal } from './VaultNoteViewModal';
import { VaultSettingsModal } from './VaultSettingsModal';
import { EmptyState, OnboardingDrawer } from '../shared';
import { useToast } from '../shared/ToastContext';
import {
  ShieldCheck,
  Lock,
  Plus,
  Search,
  Settings,
  HelpCircle,
  Key,
  Trash2,
  Edit2,
  Calendar,
  Compass,
} from 'lucide-react';

const VAULT_ONBOARDING_STEPS = [
  {
    stepNumber: 1,
    title: 'Zero-Knowledge Architecture',
    description: 'All sensitive note payloads are encrypted client-side via AES-GCM-256 with keys derived from your master password.',
    tip: 'Your master password is never stored or transmitted in any recoverable form.',
  },
  {
    stepNumber: 2,
    title: 'One-Time Recovery Keys',
    description: 'Your 3 emergency backup codes are shown once at setup. Store them safely offline outside your digital notes.',
    tip: 'If you lose both your password and backup codes, vault contents are permanently unrecoverable by design.',
  },
  {
    stepNumber: 3,
    title: 'Timed Auto-Hide Reveal',
    description: 'Viewing a secret reveals the plaintext for 30 seconds with a countdown progress bar before automatically purging it from memory.',
    tip: 'Lock your vault when stepping away to keep sensitive credentials secure.',
  },
];

const VAULT_TIPS = [
  { id: 'tip_1', label: 'Use a unique master password never reused on other accounts', completed: true },
  { id: 'tip_2', label: 'Save all 3 backup codes on physical offline media', completed: true },
  { id: 'tip_3', label: 'Lock the vault whenever leaving your workstation', completed: false },
];

export const Vault: React.FC = () => {
  const { toast } = useToast();

  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Unlocked Session State (in-memory only)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);

  // Notes state
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<VaultTag | 'ALL'>('ALL');

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
  const [viewingNote, setViewingNote] = useState<VaultNote | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const data = await vaultApi.getStatus();
      setStatus(data);
      if (!data.initialized) {
        setIsSetupOpen(true);
      }
    } catch {
      // Offline fallback state
      setStatus({
        initialized: false,
        biometricEnabled: false,
        deviceProtectionEnabled: false,
        passwordSalt: null,
        totalNotesCount: 0,
        remainingBackupCodesCount: 0,
        lockedUntil: null,
      });
      setIsSetupOpen(true);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Fetch notes when unlocked
  const fetchNotes = useCallback(async () => {
    if (!isUnlocked) return;
    try {
      const data = await vaultApi.getNotes();
      setNotes(data);
    } catch {
      // Keep existing notes if offline
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      fetchNotes();
    }
  }, [isUnlocked, fetchNotes]);

  // Handle Setup Complete
  const handleSetupComplete = async (password: string, salt: string) => {
    setIsSetupOpen(false);
    const key = await deriveVaultKey(password, salt);
    setVaultKey(key);
    setIsUnlocked(true);
    setStatus((prev) =>
      prev
        ? {
            ...prev,
            initialized: true,
            passwordSalt: salt,
            remainingBackupCodesCount: 3,
          }
        : null
    );
    toast.success('Vault setup complete & unlocked');
  };

  // Handle Unlock Success
  const handleUnlockSuccess = (key: CryptoKey) => {
    setVaultKey(key);
    setIsUnlocked(true);
  };

  // Explicit Session Lock (§13.2 / §16.9)
  const handleLockVault = () => {
    setVaultKey(null);
    setIsUnlocked(false);
    setViewingNote(null);
    setEditingNote(null);
    toast.info('Vault session locked. Decryption keys cleared from memory.');
  };

  // Save Note (Create or Update)
  const handleSaveNote = async (data: {
    label: string;
    description?: string;
    tag: VaultTag;
    customTagLabel?: string;
    encryptedSecretBlob: string;
    iv: string;
  }) => {
    if (editingNote) {
      const updated = await vaultApi.updateNote(editingNote.id, data);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      toast.success('Vault note updated');
    } else {
      const created = await vaultApi.createNote(data);
      setNotes((prev) => [created, ...prev]);
      toast.success('New encrypted note saved');
    }
    setEditingNote(null);
  };

  // Delete Note
  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this encrypted vault note?')) return;
    try {
      await vaultApi.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note deleted');
    } catch {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note deleted locally');
    }
  };

  // Filtered Notes (Client-Side Search scoped to Label/Description + Tag filter)
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        !searchQuery.trim() ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.description && n.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === 'ALL' || n.tag === selectedTag;

      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center p-12 text-xs text-[#78716C]">
        Connecting to Secure Vault...
      </div>
    );
  }

  // 1. If not initialized: render setup modal
  if (status && !status.initialized) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <VaultSetupModal isOpen={isSetupOpen} onSetupComplete={handleSetupComplete} />
      </div>
    );
  }

  // 2. If locked: render two-factor unlock gate (§16.9)
  if (!isUnlocked) {
    return (
      <VaultUnlockGate
        passwordSalt={status?.passwordSalt || null}
        biometricEnabled={status?.biometricEnabled || false}
        onUnlockSuccess={handleUnlockSuccess}
      />
    );
  }

  // 3. Unlocked Vault Interface
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20 shadow-2xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-[#1C1917]">Private Vault</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/20">
                Unlocked · AES-256
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              Zero-knowledge locker · {notes.length} {notes.length === 1 ? 'secret' : 'secrets'} stored
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#78716C] bg-white hover:bg-[#FAFAF9] shadow-2xs transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#B45309]" />
            <span>Vault Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#1C1917] bg-white hover:bg-[#FAFAF9] shadow-2xs transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-[#78716C]" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#342D27] rounded-md shadow-2xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Note</span>
          </button>

          <button
            type="button"
            onClick={handleLockVault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#BE123C] bg-[#FFE4E6] hover:bg-[#FECDD3] rounded-md border border-[#BE123C]/20 shadow-2xs transition-colors"
            title="Purge decryption keys and lock vault"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Search & Tag Filter Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#78716C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search labels or descriptions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedTag('ALL')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedTag === 'ALL'
                ? 'bg-[#1C1917] text-white shadow-2xs'
                : 'bg-white text-[#78716C] border border-[#E7E5E4] hover:bg-[#FAFAF9]'
            }`}
          >
            All Notes
          </button>
          {(Object.keys(VAULT_TAG_LABELS) as VaultTag[]).map((tagKey) => (
            <button
              key={tagKey}
              type="button"
              onClick={() => setSelectedTag(tagKey)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                selectedTag === tagKey
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'bg-white text-[#78716C] border border-[#E7E5E4] hover:bg-[#FAFAF9]'
              }`}
            >
              {VAULT_TAG_LABELS[tagKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid or Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={ShieldCheck}
            headline={searchQuery || selectedTag !== 'ALL' ? 'NO MATCHING SECRETS' : 'YOUR VAULT IS EMPTY'}
            subtext={
              searchQuery || selectedTag !== 'ALL'
                ? 'Try adjusting your search query or tag filter.'
                : 'Encrypted locker for sensitive credentials, recovery phrases, PINs, and private notes.'
            }
            action={{
              label: 'Create First Note',
              onClick: () => {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              },
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const tagColor = VAULT_TAG_COLORS[note.tag];
            return (
              <div
                key={note.id}
                onClick={() => setViewingNote(note)}
                className="group bg-white rounded-xl border border-[#E7E5E4] hover:border-[#B45309]/50 hover:shadow-md transition-all p-4 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
                    >
                      {note.tag === 'CUSTOM' && note.customTagLabel
                        ? note.customTagLabel
                        : VAULT_TAG_LABELS[note.tag]}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNote(note);
                          setIsNoteModalOpen(true);
                        }}
                        className="p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAFAF9] rounded"
                        title="Edit Note"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1 text-[#78716C] hover:text-[#BE123C] hover:bg-[#FFE4E6] rounded"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1C1917] group-hover:text-[#B45309] transition-colors leading-snug line-clamp-1">
                    {note.label}
                  </h3>

                  {note.description ? (
                    <p className="text-xs text-[#78716C] mt-1 line-clamp-2 leading-relaxed">
                      {note.description}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#78716C]/60 italic mt-1">No description added</p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-[#E7E5E4] flex items-center justify-between text-[11px] text-[#78716C]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 font-bold text-[#B45309] group-hover:underline">
                    <Key className="h-3 w-3" />
                    <span>Reveal Secret</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Create/Edit Modal */}
      {isNoteModalOpen && vaultKey && (
        <VaultNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => {
            setIsNoteModalOpen(false);
            setEditingNote(null);
          }}
          vaultKey={vaultKey}
          editingNote={editingNote}
          onSave={handleSaveNote}
        />
      )}

      {/* Note View Modal (Timed 30s Reveal) */}
      {viewingNote && vaultKey && (
        <VaultNoteViewModal
          note={viewingNote}
          vaultKey={vaultKey}
          onClose={() => setViewingNote(null)}
        />
      )}

      {/* Settings Modal */}
      <VaultSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        biometricEnabled={status?.biometricEnabled || false}
        deviceProtectionEnabled={status?.deviceProtectionEnabled || false}
        onSettingsUpdated={(bio, dev) => {
          setStatus((prev) => (prev ? { ...prev, biometricEnabled: bio, deviceProtectionEnabled: dev } : null));
        }}
      />

      {/* Onboarding Drawer */}
      <OnboardingDrawer
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        moduleName="Private Vault"
        subtitle="Zero-Knowledge Encrypted Notes & Locker"
        icon={Compass}
        steps={VAULT_ONBOARDING_STEPS}
        tipsChecklist={VAULT_TIPS}
        storageKey="finora_vault_onboarding"
      />
    </div>
  );
};

export default Vault;
