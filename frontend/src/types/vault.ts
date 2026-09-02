export type VaultTag =
  | 'FINANCE'
  | 'OFFICIAL'
  | 'PERSONAL'
  | 'WORK'
  | 'SOCIAL'
  | 'BANKING'
  | 'MEDICAL'
  | 'CUSTOM';

export const VAULT_TAG_LABELS: Record<VaultTag, string> = {
  FINANCE: 'Finance & Tax',
  OFFICIAL: 'Official & Legal',
  PERSONAL: 'Personal & Family',
  WORK: 'Work & Tech',
  SOCIAL: 'Social & Web',
  BANKING: 'Banking & Cards',
  MEDICAL: 'Medical & Health',
  CUSTOM: 'Custom Tag',
};

export const VAULT_TAG_COLORS: Record<VaultTag, { bg: string; text: string; border: string }> = {
  FINANCE: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#B45309]/30' },
  OFFICIAL: { bg: 'bg-[#F1F5F9]', text: 'text-[#334155]', border: 'border-[#334155]/30' },
  PERSONAL: { bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]', border: 'border-[#7C3AED]/30' },
  WORK: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', border: 'border-[#0284C7]/30' },
  SOCIAL: { bg: 'bg-[#FCE7F3]', text: 'text-[#BE185D]', border: 'border-[#BE185D]/30' },
  BANKING: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', border: 'border-[#15803D]/30' },
  MEDICAL: { bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]', border: 'border-[#BE123C]/30' },
  CUSTOM: { bg: 'bg-[#FAFAF9]', text: 'text-[#1C1917]', border: 'border-[#E7E5E4]' },
};

export interface VaultStatus {
  initialized: boolean;
  biometricEnabled: boolean;
  deviceProtectionEnabled: boolean;
  passwordSalt: string | null;
  totalNotesCount: number;
  remainingBackupCodesCount: number;
  lockedUntil: string | null;
}

export interface CaptchaChallenge {
  captchaId: string;
  captchaSvg: string;
  expiresAtEpochMs: number;
}

export interface VaultSetupResponse {
  success: boolean;
  message: string;
  backupCodes: string[];
}

export interface VaultUnlockResponse {
  unlocked: boolean;
  message: string;
  vaultSessionToken: string;
  requiresDeviceKeyApproval: boolean;
}

export interface VaultNote {
  id: string;
  vaultProfileId: string;
  label: string;
  description?: string;
  tag: VaultTag;
  customTagLabel?: string;
  encryptedSecretBlob: string; // Ciphertext (Base64)
  iv: string;                  // IV (Base64)
  authTag?: string;
  createdAt: string;
  updatedAt: string;
}
