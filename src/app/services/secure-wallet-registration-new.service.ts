import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SecurePassphraseService, EncryptedStretchedKey } from './secure-passphrase.service';
import { WalletCryptoService, WalletData, EncryptedMnemonic } from './wallet-crypto.service';

export interface SecureRegistrationResult {
  success: boolean;
  userId?: string;
  token?: string;
  refreshToken?: string;
  walletAddresses?: {
    seiAddress: string;
    evmAddress: string;
  };
  message: string;
  isWaitlistConversion?: boolean;
  starting_points?: number;
}

export interface WaitlistConversionData {
  email: string;
  name?: string;
  language_to_learn?: string;
  isWaitlistUser: boolean;
  waitlist_signup_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecureWalletRegistrationService {

  private readonly apiBaseUrl = 'http://localhost:3000'; // Mock server URL

  constructor(
    private http: HttpClient,
    private securePassphrase: SecurePassphraseService,
    private walletCrypto: WalletCryptoService
  ) {}

  /**
   * Create wallet with secure passphrase architecture
   * Supports both new user registration and waitlist conversion
   */
  async createSecureWallet(
    email: string,
    passphrase: string,
    name?: string,
    language_to_learn?: string
  ): Promise<SecureRegistrationResult> {
    try {
      console.log('🔐 Starting secure wallet creation for:', email);

      // 1. Validate passphrase strength
      const strengthCheck = this.securePassphrase.validatePassphraseStrength(passphrase);
      if (!strengthCheck.isValid) {
        throw new Error(`Weak passphrase: ${strengthCheck.feedback.join(', ')}`);
      }

      // 2. Stretch passphrase (client-side only)
      console.log('🔑 Stretching passphrase with PBKDF2...');
      const stretchedKey = await this.securePassphrase.stretchPassphrase(passphrase, email);

      // 3. Encrypt stretched key for server storage
      console.log('🔒 Encrypting stretched key for server storage...');
      const encryptedStretchedKey = await this.securePassphrase.encryptStretchedPassphrase(
        stretchedKey,
        email
      );

      // 4. Generate mnemonic and encrypt with stretched key
      console.log('🎲 Generating wallet mnemonic...');
      const mnemonic = this.walletCrypto.generateMnemonic();
      const encryptedMnemonic = await this.walletCrypto.encryptMnemonic(mnemonic, stretchedKey);

      // 5. Derive wallet addresses
      console.log('🏦 Deriving wallet addresses...');
      const walletData = await this.walletCrypto.deriveWalletsFromMnemonic(mnemonic);

      // 6. Submit to backend (no raw passphrase sent!)
      console.log('📡 Submitting secure wallet data to backend...');
      const registrationData = {
        email,
        name,
        language_to_learn: language_to_learn || 'spanish',
        // Encrypted stretched key data
        encryptedStretchedKey: encryptedStretchedKey.encryptedStretchedKey,
        encryptionSalt: encryptedStretchedKey.encryptionSalt,
        stretchedKeyNonce: encryptedStretchedKey.nonce,
        // Encrypted mnemonic data
        encrypted_mnemonic: encryptedMnemonic.encryptedData,
        mnemonic_salt: encryptedMnemonic.salt,
        mnemonic_nonce: encryptedMnemonic.nonce,
        // Public wallet addresses
        sei_address: walletData.seiWallet.address,
        sei_public_key: walletData.seiWallet.publicKey,
        eth_address: walletData.evmWallet.address,
        eth_public_key: walletData.evmWallet.publicKey
      };

      const result = await firstValueFrom(
        this.http.post<SecureRegistrationResult>(`${this.apiBaseUrl}/auth/secure-signup`, registrationData)
      );

      // 7. Store wallet data locally for user convenience
      await this.storeWalletLocally(email, walletData, stretchedKey);

      console.log('✅ Secure wallet creation completed successfully');
      return {
        ...result,
        walletAddresses: {
          seiAddress: walletData.seiWallet.address,
          evmAddress: walletData.evmWallet.address
        }
      };

    } catch (error: any) {
      console.error('❌ Secure wallet creation failed:', error);
      throw new Error(error.message || 'Failed to create secure wallet');
    }
  }

  /**
   * Convert waitlist user to full account with secure wallet
   */
  async convertWaitlistUser(
    email: string,
    passphrase: string,
    waitlistData?: WaitlistConversionData
  ): Promise<SecureRegistrationResult> {
    try {
      console.log('🔄 Converting waitlist user to full account:', email);

      // Check if user exists in waitlist
      const waitlistCheck = await this.checkWaitlistStatus(email);
      if (!waitlistCheck.isWaitlistUser) {
        throw new Error('User not found in waitlist or already converted');
      }

      // Use existing waitlist data or provided data
      const userData = waitlistData || waitlistCheck;

      // Create secure wallet with waitlist user data
      const result = await this.createSecureWallet(
        email,
        passphrase,
        userData.name,
        userData.language_to_learn
      );

      return {
        ...result,
        isWaitlistConversion: true,
        message: 'Waitlist user successfully converted to full account with secure wallet'
      };

    } catch (error: any) {
      console.error('❌ Waitlist conversion failed:', error);
      throw new Error(error.message || 'Failed to convert waitlist user');
    }
  }

  /**
   * Recover wallet using secure passphrase
   */
  async recoverSecureWallet(email: string, passphrase: string): Promise<{
    success: boolean;
    walletData?: WalletData;
    addresses?: {
      seiAddress: string;
      evmAddress: string;
    };
    message: string;
  }> {
    try {
      console.log('🔓 Starting secure wallet recovery for:', email);

      // 1. Get user profile from server
      const profile = await this.getUserProfile(email);
      if (!profile.encryptedStretchedKey) {
        throw new Error('No secure wallet found for this email');
      }

      // 2. Verify passphrase and decrypt stretched key
      const isValidPassphrase = await this.securePassphrase.verifyPassphrase(
        passphrase,
        email,
        {
          encryptedStretchedKey: profile.encryptedStretchedKey,
          encryptionSalt: profile.encryptionSalt,
          nonce: profile.stretchedKeyNonce
        }
      );

      if (!isValidPassphrase) {
        throw new Error('Invalid passphrase');
      }

      // 3. Decrypt stretched key
      const stretchedKey = await this.securePassphrase.decryptStretchedPassphrase(
        {
          encryptedStretchedKey: profile.encryptedStretchedKey,
          encryptionSalt: profile.encryptionSalt,
          nonce: profile.stretchedKeyNonce
        },
        email
      );

      // 4. Decrypt mnemonic
      const mnemonic = await this.walletCrypto.decryptMnemonic(
        {
          encryptedData: profile.encrypted_mnemonic,
          salt: profile.mnemonic_salt,
          nonce: profile.mnemonic_nonce
        },
        stretchedKey
      );

      // 5. Derive wallet data
      const walletData = await this.walletCrypto.deriveWalletsFromMnemonic(mnemonic);

      // 6. Store locally for convenience
      await this.storeWalletLocally(email, walletData, stretchedKey);

      console.log('✅ Secure wallet recovery completed successfully');
      return {
        success: true,
        walletData,
        addresses: {
          seiAddress: walletData.seiWallet.address,
          evmAddress: walletData.evmWallet.address
        },
        message: 'Wallet recovered successfully'
      };

    } catch (error: any) {
      console.error('❌ Secure wallet recovery failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to recover wallet'
      };
    }
  }

  /**
   * Change wallet passphrase securely
   */
  async changePassphrase(
    email: string,
    oldPassphrase: string,
    newPassphrase: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Changing wallet passphrase for:', email);

      // 1. Validate new passphrase
      const strengthCheck = this.securePassphrase.validatePassphraseStrength(newPassphrase);
      if (!strengthCheck.isValid) {
        throw new Error(`Weak new passphrase: ${strengthCheck.feedback.join(', ')}`);
      }

      // 2. Recover wallet with old passphrase
      const recoveryResult = await this.recoverSecureWallet(email, oldPassphrase);
      if (!recoveryResult.success || !recoveryResult.walletData) {
        throw new Error('Invalid old passphrase');
      }

      // 3. Re-encrypt with new passphrase
      const newResult = await this.createSecureWallet(
        email,
        newPassphrase,
        undefined, // Keep existing name
        undefined  // Keep existing language
      );

      console.log('✅ Passphrase changed successfully');
      return {
        success: true,
        message: 'Passphrase changed successfully'
      };

    } catch (error: any) {
      console.error('❌ Passphrase change failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to change passphrase'
      };
    }
  }

  /**
   * Store wallet data locally using IndexedDB
   */
  private async storeWalletLocally(
    email: string,
    walletData: WalletData,
    stretchedKey: Uint8Array
  ): Promise<void> {
    try {
      // Open IndexedDB
      const request = indexedDB.open('YAP-SecureWallets', 1);
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('wallets')) {
            db.createObjectStore('wallets', { keyPath: 'email' });
          }
        };
        
        request.onsuccess = async () => {
          const db = request.result;
          
          // Encrypt mnemonic for local storage
          const encryptedMnemonic = await this.walletCrypto.encryptMnemonic(
            walletData.mnemonic,
            stretchedKey
          );
          
          const walletRecord = {
            email,
            encryptedMnemonic,
            seiAddress: walletData.seiWallet.address,
            evmAddress: walletData.evmWallet.address,
            storedAt: new Date().toISOString()
          };
          
          const transaction = db.transaction(['wallets'], 'readwrite');
          const store = transaction.objectStore('wallets');
          store.put(walletRecord);
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
      });
    } catch (error) {
      console.warn('Failed to store wallet locally:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Check waitlist status
   */
  private async checkWaitlistStatus(email: string): Promise<WaitlistConversionData> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiBaseUrl}/profile/email/${encodeURIComponent(email)}`)
      );
      
      return {
        email: response.email,
        name: response.name,
        language_to_learn: response.initial_language_to_learn,
        isWaitlistUser: response.isWaitlistUser || false,
        waitlist_signup_at: response.waitlist_signup_at
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to check waitlist status');
    }
  }

  /**
   * Get user profile for recovery
   */
  private async getUserProfile(email: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiBaseUrl}/profile/email/${encodeURIComponent(email)}`)
      );
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('User profile not found');
      }
      throw new Error('Failed to retrieve user profile');
    }
  }

  /**
   * Test passphrase strength before registration
   */
  testPassphraseStrength(passphrase: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    return this.securePassphrase.validatePassphraseStrength(passphrase);
  }

  /**
   * Test mnemonic phrase validity
   */
  async testMnemonicPhrase(mnemonic: string): Promise<{
    isValid: boolean;
    seiAddress?: string;
    evmAddress?: string;
    error?: string;
  }> {
    return this.walletCrypto.testMnemonicRecovery(mnemonic);
  }
}
