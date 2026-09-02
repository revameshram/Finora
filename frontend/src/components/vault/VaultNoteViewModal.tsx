import React, { useState, useEffect } from 'react';
import { VaultNote, VAULT_TAG_LABELS, VAULT_TAG_COLORS } from '../../types/vault';
import { decryptSecret } from '../../utils/vaultCrypto';
import { useToast } from '../shared/ToastContext';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface VaultNoteViewModalProps {
  note: VaultNote | null;
  vaultKey: CryptoKey;
  onClose: () => void;
}

const TOTAL_REVEAL_SECONDS = 30;

export const VaultNoteViewModal: React.FC<VaultNoteViewModalProps> = ({
  note,
  vaultKey,
  onClose,
}) => {
  const { toast } = useToast();

  const [isRevealed, setIsRevealed] = useState(true);
  const [decryptedSecret, setDecryptedSecret] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_REVEAL_SECONDS);
  const [isCopied, setIsCopied] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Decrypt on mount
  useEffect(() => {
    if (!note) return;

    setIsDecrypting(true);
    decryptSecret(note.encryptedSecretBlob, note.iv, vaultKey)
      .then((plaintext) => {
        setDecryptedSecret(plaintext);
        setIsRevealed(true);
        setSecondsRemaining(TOTAL_REVEAL_SECONDS);
      })
      .catch((err) => {
        console.error('Decryption failed', err);
        toast.error('Could not decrypt secret with active vault key');
      })
      .finally(() => setIsDecrypting(false));
  }, [note, vaultKey, toast]);

  // Timed Auto-Hide Countdown Timer (§16.10)
  useEffect(() => {
    if (!isRevealed || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsRevealed(false);
          setDecryptedSecret(null); // Purge decrypted plaintext from memory
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRevealed, secondsRemaining]);

  if (!note) return null;

  const handleCopy = () => {
    if (!decryptedSecret) return;
    navigator.clipboard.writeText(decryptedSecret);
    setIsCopied(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleManualToggle = () => {
    if (isRevealed) {
      setIsRevealed(false);
      setDecryptedSecret(null);
    } else {
      setIsDecrypting(true);
      decryptSecret(note.encryptedSecretBlob, note.iv, vaultKey)
        .then((plaintext) => {
          setDecryptedSecret(plaintext);
          setIsRevealed(true);
          setSecondsRemaining(TOTAL_REVEAL_SECONDS);
        })
        .finally(() => setIsDecrypting(false));
    }
  };

  const tagColor = VAULT_TAG_COLORS[note.tag];
  const progressPercent = Math.max(0, (secondsRemaining / TOTAL_REVEAL_SECONDS) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#B45309]">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1C1917]">{note.label}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
                >
                  {note.tag === 'CUSTOM' && note.customTagLabel
                    ? note.customTagLabel
                    : VAULT_TAG_LABELS[note.tag]}
                </span>
              </div>
              <p className="text-[11px] text-[#78716C]">
                Created {new Date(note.createdAt).toLocaleDateString()} · AES-256-GCM
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

        <div className="p-6 space-y-5">
          {/* Timed Reveal Warning & Progress Bar (§16.10) */}
          <div className="p-3.5 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1C1917]">
                <Clock className="h-3.5 w-3.5 text-[#B45309]" />
                <span>Timed Auto-Hide Security</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#B45309]">
                {isRevealed ? `${secondsRemaining}s remaining` : 'Hidden'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#E7E5E4] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  secondsRemaining > 10 ? 'bg-[#B45309]' : 'bg-[#BE123C]'
                }`}
                style={{ width: `${isRevealed ? progressPercent : 0}%` }}
              />
            </div>
          </div>

          {/* Secret Value Block */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">Secret Value</label>
              <button
                type="button"
                onClick={handleManualToggle}
                disabled={isDecrypting}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#78716C] hover:text-[#1C1917]"
              >
                {isRevealed ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Reveal</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative p-3.5 bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] font-mono text-xs">
              {isDecrypting ? (
                <div className="text-[#78716C] text-xs py-2 text-center animate-pulse">
                  Decrypting in memory...
                </div>
              ) : isRevealed && decryptedSecret ? (
                <div className="break-all font-bold text-[#1C1917] whitespace-pre-wrap select-all">
                  {decryptedSecret}
                </div>
              ) : (
                <div className="text-[#78716C] tracking-widest text-center py-2 font-mono">
                  ••••••••••••••••••••••••••••••••
                </div>
              )}
            </div>
          </div>

          {/* Context / Internal Description */}
          {note.description && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
                <FileText className="h-3.5 w-3.5 text-[#78716C]" />
                <span>Internal Description</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E7E5E4] text-xs text-[#78716C] leading-relaxed whitespace-pre-wrap">
                {note.description}
              </div>
            </div>
          )}

          {/* Security Guarantee Banner */}
          <div className="flex items-center gap-2 text-[11px] text-[#78716C] bg-[#FAFAF9] p-2 rounded-md border border-[#E7E5E4]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#15803D]" />
            <span>Ciphertext is never decrypted on Westro or Finora servers.</span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isRevealed || !decryptedSecret}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#1C1917] bg-white hover:bg-[#FAFAF9] transition-colors disabled:opacity-40"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-[#15803D]" /> : <Copy className="h-3.5 w-3.5 text-[#78716C]" />}
              <span>{isCopied ? 'Copied Secret' : 'Copy Secret'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#1C1917] text-white hover:bg-[#342D27] transition-colors shadow-xs"
            >
              Done & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultNoteViewModal;
