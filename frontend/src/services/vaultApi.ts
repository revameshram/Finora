import apiClient from '../api/client';
import {
  VaultStatus,
  CaptchaChallenge,
  VaultSetupResponse,
  VaultUnlockResponse,
  VaultNote,
  VaultTag,
} from '../types/vault';

export const vaultApi = {
  getStatus: async (): Promise<VaultStatus> => {
    const res = await apiClient.get<VaultStatus>('/vault/status');
    return res.data;
  },

  setupVault: async (data: {
    masterPasswordVerifier: string;
    passwordSalt: string;
    enableBiometrics: boolean;
    enableDeviceProtection: boolean;
  }): Promise<VaultSetupResponse> => {
    const res = await apiClient.post<VaultSetupResponse>('/vault/setup', data);
    return res.data;
  },

  getCaptcha: async (): Promise<CaptchaChallenge> => {
    const res = await apiClient.get<CaptchaChallenge>('/vault/captcha');
    return res.data;
  },

  unlockVault: async (data: {
    masterPasswordVerifier: string;
    captchaId: string;
    captchaAnswer: string;
    deviceFingerprint?: string;
  }): Promise<VaultUnlockResponse> => {
    const res = await apiClient.post<VaultUnlockResponse>('/vault/unlock', data);
    return res.data;
  },

  recoverVault: async (data: {
    backupCode: string;
    newMasterPasswordVerifier: string;
    newPasswordSalt: string;
  }): Promise<void> => {
    await apiClient.post('/vault/recover', data);
  },

  updateSettings: async (data: {
    biometricEnabled?: boolean;
    deviceProtectionEnabled?: boolean;
  }): Promise<void> => {
    await apiClient.put('/vault/settings', data);
  },

  getNotes: async (params?: { search?: string; tag?: VaultTag }): Promise<VaultNote[]> => {
    const res = await apiClient.get<VaultNote[]>('/vault/notes', { params });
    return res.data;
  },

  createNote: async (data: {
    label: string;
    description?: string;
    tag: VaultTag;
    customTagLabel?: string;
    encryptedSecretBlob: string;
    iv: string;
    authTag?: string;
  }): Promise<VaultNote> => {
    const res = await apiClient.post<VaultNote>('/vault/notes', data);
    return res.data;
  },

  updateNote: async (
    id: string,
    data: {
      label?: string;
      description?: string;
      tag?: VaultTag;
      customTagLabel?: string;
      encryptedSecretBlob?: string;
      iv?: string;
      authTag?: string;
    }
  ): Promise<VaultNote> => {
    const res = await apiClient.put<VaultNote>(`/vault/notes/${id}`, data);
    return res.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/vault/notes/${id}`);
  },
};

export default vaultApi;
