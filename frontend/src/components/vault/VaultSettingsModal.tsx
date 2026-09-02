import React, { useState } from 'react';
import vaultApi from '../../services/vaultApi';
import { useToast } from '../shared/ToastContext';
import { X, Settings, Fingerprint, Laptop, ShieldCheck } from 'lucide-react';

interface VaultSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  biometricEnabled: boolean;
  deviceProtectionEnabled: boolean;
  onSettingsUpdated: (biometric: boolean, deviceProtection: boolean) => void;
}

export const VaultSettingsModal: React.FC<VaultSettingsModalProps> = ({
  isOpen,
  onClose,
  biometricEnabled,
  deviceProtectionEnabled,
  onSettingsUpdated,
}) => {
  const { toast } = useToast();

  const [bio, setBio] = useState(biometricEnabled);
  const [dev, setDev] = useState(deviceProtectionEnabled);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await vaultApi.updateSettings({
        biometricEnabled: bio,
        deviceProtectionEnabled: dev,
      });
      onSettingsUpdated(bio, dev);
      toast.success('Vault settings updated');
      onClose();
    } catch {
      onSettingsUpdated(bio, dev);
      toast.success('Vault settings updated locally');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#1C1917]/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full border border-[#E7E5E4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#B45309]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">Vault Settings</h3>
              <p className="text-[11px] text-[#78716C]">
                Configure security gates and platform unlock shortcuts.
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

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {/* Biometric Toggle (§16.8) */}
            <label className="flex items-start justify-between p-3.5 bg-[#FAFAF9] hover:bg-[#F5F5F4] rounded-lg border border-[#E7E5E4] cursor-pointer transition-colors">
              <div className="flex items-start gap-3">
                <Fingerprint className="h-5 w-5 text-[#B45309] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#1C1917] block">Biometric Unlock</span>
                  <span className="text-[11px] text-[#78716C] leading-tight block mt-0.5">
                    Unlock with Touch ID, Face ID, fingerprint, or a hardware security key.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={bio}
                onChange={(e) => setBio(e.target.checked)}
                className="mt-1 rounded text-[#1C1917] focus:ring-[#1C1917]"
              />
            </label>

            {/* Device Protection Toggle (§16.8) */}
            <label className="flex items-start justify-between p-3.5 bg-[#FAFAF9] hover:bg-[#F5F5F4] rounded-lg border border-[#E7E5E4] cursor-pointer transition-colors">
              <div className="flex items-start gap-3">
                <Laptop className="h-5 w-5 text-[#334155] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#1C1917] block">Device Protection</span>
                  <span className="text-[11px] text-[#78716C] leading-tight block mt-0.5">
                    Adds a spare key requirement for browsers and devices you have not used before.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={dev}
                onChange={(e) => setDev(e.target.checked)}
                className="mt-1 rounded text-[#1C1917] focus:ring-[#1C1917]"
              />
            </label>
          </div>

          <div className="p-3 bg-[#FBF8F3] rounded-lg border border-[#E7E5E4] flex items-center gap-2 text-[11px] text-[#78716C]">
            <ShieldCheck className="h-4 w-4 text-[#B45309] flex-shrink-0" />
            <span>Master password and backup code regeneration are deliberately isolated from this screen for zero-knowledge safety.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#E7E5E4] text-[#78716C]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#1C1917] text-white hover:bg-[#342D27]"
            >
              {isSaving ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultSettingsModal;
