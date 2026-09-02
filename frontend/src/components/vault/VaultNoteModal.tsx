import React, { useState } from 'react';
import { VaultNote, VaultTag, VAULT_TAG_LABELS } from '../../types/vault';
import { encryptSecret, decryptSecret } from '../../utils/vaultCrypto';
import { useToast } from '../shared/ToastContext';
import { X, Lock, FileText, Tag as TagIcon, Key } from 'lucide-react';

interface VaultNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultKey: CryptoKey;
  editingNote: VaultNote | null;
  onSave: (noteData: {
    label: string;
    description?: string;
    tag: VaultTag;
    customTagLabel?: string;
    encryptedSecretBlob: string;
    iv: string;
  }) => Promise<void>;
}

export const VaultNoteModal: React.FC<VaultNoteModalProps> = ({
  isOpen,
  onClose,
  vaultKey,
  editingNote,
  onSave,
}) => {
  const { toast } = useToast();

  const [label, setLabel] = useState(editingNote?.label || '');
  const [description, setDescription] = useState(editingNote?.description || '');
  const [tag, setTag] = useState<VaultTag>(editingNote?.tag || 'FINANCE');
  const [customTagLabel, setCustomTagLabel] = useState(editingNote?.customTagLabel || '');
  const [secretValue, setSecretValue] = useState('');
  const [isDecryptingExisting, setIsDecryptingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingNote) {
      setLabel(editingNote.label);
      setDescription(editingNote.description || '');
      setTag(editingNote.tag);
      setCustomTagLabel(editingNote.customTagLabel || '');

      // Decrypt existing secret into input field for editing
      setIsDecryptingExisting(true);
      decryptSecret(editingNote.encryptedSecretBlob, editingNote.iv, vaultKey)
        .then((decrypted) => setSecretValue(decrypted))
        .catch(() => toast.error('Failed to decrypt existing note secret'))
        .finally(() => setIsDecryptingExisting(false));
    } else {
      setLabel('');
      setDescription('');
      setTag('FINANCE');
      setCustomTagLabel('');
      setSecretValue('');
    }
  }, [editingNote, vaultKey, toast]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !secretValue.trim()) {
      toast.error('Label and Secret Value are required');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Client-Side Encryption with WebCrypto AES-GCM-256
      const { ciphertextBase64, ivBase64 } = await encryptSecret(secretValue.trim(), vaultKey);

      // 2. Dispatch to backend
      await onSave({
        label: label.trim(),
        description: description.trim() || undefined,
        tag,
        customTagLabel: tag === 'CUSTOM' ? customTagLabel.trim() : undefined,
        encryptedSecretBlob: ciphertextBase64,
        iv: ivBase64,
      });

      onClose();
    } catch (err) {
      console.error('Encryption or save error', err);
      toast.error('Failed to encrypt or save vault note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#B45309]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">
                {editingNote ? 'Edit Encrypted Note' : 'Create Encrypted Vault Note'}
              </h3>
              <p className="text-[11px] text-[#78716C]">
                Secret payload is encrypted in-browser before leaving this device.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1C1917]">Note Label (Title) *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#78716C]" />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. HDFC Demat TPIN & Netbanking Passphrase"
                required
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1C1917]">Category Tag</label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#78716C]" />
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value as VaultTag)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                >
                  {Object.entries(VAULT_TAG_LABELS).map(([k, name]) => (
                    <option key={k} value={k}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {tag === 'CUSTOM' ? (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Custom Tag Name</label>
                <input
                  type="text"
                  value={customTagLabel}
                  onChange={(e) => setCustomTagLabel(e.target.value)}
                  placeholder="e.g. Real Estate"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1917]">Encryption Protocol</label>
                <div className="px-3 py-2 text-xs font-mono font-semibold rounded-md bg-[#FAFAF9] border border-[#E7E5E4] text-[#78716C]">
                  AES-256-GCM / PBKDF2
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1C1917]">
              Confidential Secret Payload *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#B45309]" />
              <textarea
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="Passphrases, recovery seeds, API keys, locker combinations, PINs..."
                required
                rows={3}
                disabled={isDecryptingExisting}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-md border border-[#B45309]/40 bg-[#FBF8F3] text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#B45309]"
              />
            </div>
            <p className="text-[10px] text-[#78716C]">
              This field will be encrypted in-memory before leaving this browser.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1C1917]">
              Internal Description & Context (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or non-sensitive reference context..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E5E4] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !label.trim() || !secretValue.trim()}
              className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#1C1917] text-white hover:bg-[#342D27] transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Encrypting & Saving...' : editingNote ? 'Update Encrypted Note' : 'Save Encrypted Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaultNoteModal;
