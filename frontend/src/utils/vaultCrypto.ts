/**
 * Client-Side Zero-Knowledge Encryption Engine for Finora Vault
 * Using WebCrypto API (PBKDF2-HMAC-SHA256, AES-GCM-256, 96-bit random IV)
 */

export function generateRandomSalt(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function deriveVaultKey(password: string, saltHex: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function deriveVerifierToken(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const combined = enc.encode(`${password}:${saltHex}:finora_vault_verifier`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptSecret(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(plaintext)
  );

  const ciphertextBase64 = btoa(
    String.fromCharCode(...new Uint8Array(ciphertextBuffer))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return { ciphertextBase64, ivBase64 };
}

export async function decryptSecret(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  try {
    const ciphertextBytes = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
      },
      key,
      ciphertextBytes
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    console.error('Decryption failed: invalid key or corrupted ciphertext', err);
    throw new Error('Failed to decrypt secret with current vault key');
  }
}
