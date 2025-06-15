// Updated MongoDB Profile Schema for Enhanced Security
// Removes all server-side passphrase processing

export interface SecureProfileDocument {
  userId: string;
  email: string;
  name: string;
  initial_language_to_learn: string;
  
  // Waitlist fields
  isWaitlistUser?: boolean;
  waitlist_signup_at?: string;
  wlw?: boolean; // wallet_linked_to_wallet (has wallet)
  converted?: boolean; // waitlist user converted to full account
  
  // SECURE PASSPHRASE STORAGE (NEW APPROACH)
  // Server stores encrypted stretched passphrase but cannot decrypt it
  encryptedStretchedKey?: number[];    // AES-GCM encrypted PBKDF2 output
  encryptionSalt?: number[];           // Salt for deriving encryption key
  stretchedKeyNonce?: number[];        // AES-GCM nonce
  
  // WALLET DATA (encrypted with stretched key)
  encrypted_mnemonic?: string;         // Encrypted with stretched passphrase
  mnemonic_salt?: string;             // Salt for mnemonic encryption
  mnemonic_nonce?: string;            // Nonce for mnemonic encryption
  
  // PUBLIC WALLET ADDRESSES
  sei_wallet?: {
    address: string;
    public_key: string;
  };
  eth_wallet?: {
    address: string;
    public_key: string;
  };
  
  // METADATA
  secured_at?: string;
  createdAt: string;
  updatedAt: string;
}

// SECURITY AUDIT NOTES:
// ✅ Server cannot decrypt encryptedStretchedKey
// ✅ Server cannot derive wallet private keys  
// ✅ Server cannot access mnemonic phrases
// ✅ All sensitive operations happen client-side
// ✅ Encrypted data is reversible only by legitimate user

// REMOVED FIELDS (Enhanced Security)
// ❌ passphrase_hash (server never processes passphrases)
// ❌ encrypted_mnemonic with server-side salt (all client-side now)  
// ❌ Any server-side passphrase processing fields

export default SecureProfileDocument;
