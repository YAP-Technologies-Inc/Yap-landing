import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SecurePassphraseService, EncryptedStretchedKey, SecureWalletData } from './secure-passphrase.service';
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

export interface SecureRegistrationData {
  email: string;
  name?: string; // Optional for waitlist users
  language_to_learn?: string; // Optional for waitlist users
  
  // Encrypted stretched passphrase (server cannot decrypt)
  encryptedStretchedKey: number[];
  encryptionSalt: number[];
  stretchedKeyNonce: number[];
  
  // Wallet data (encrypted with stretched key)
  encrypted_mnemonic: string;
  mnemonic_salt: string;
  mnemonic_nonce: string;
  
  // Public wallet addresses
  sei_address: string;
  sei_public_key: string;
  eth_address: string;
  eth_public_key: string;
}

export interface RegistrationResult {
  success: boolean;
  userId: string;
  isWaitlistConversion: boolean;
  starting_points: number;
  token: string;
  refreshToken: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecureWalletRegistrationService {
  
  constructor(
    private http: HttpClient,
    private securePassphrase: SecurePassphraseService,
    private walletCrypto: WalletCryptoService
  ) {}

  /**
   * Check if user is on waitlist
   */
  async checkWaitlistStatus(email: string): Promise<WaitlistStatus> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`/api/profile/email/${email}`)
      );
      
      return {
        isWaitlistUser: response.isWaitlistUser || false,
        name: response.name,
        language_to_learn: response.initial_language_to_learn,
        userId: response.userId
      };
    } catch (error: any) {
      if (error.status === 404) {
        return { isWaitlistUser: false };
      }
      throw error;
    }
  }

  /**
   * Create wallet with secure passphrase (zero server exposure)
   */
  async createSecureWallet(
    email: string,
    passphrase: string,
    name?: string,
    language_to_learn?: string
  ): Promise<RegistrationResult> {
    
    // 1. Validate passphrase strength
    const strengthCheck = this.securePassphrase.validatePassphraseStrength(passphrase);
    if (!strengthCheck.isValid) {
      throw new Error(`Weak passphrase: ${strengthCheck.feedback.join(', ')}`);
    }

    // 2. Check waitlist status
    const waitlistStatus = await this.checkWaitlistStatus(email);
    
    // 3. Generate and stretch passphrase (client-side only)
    const userSalt = waitlistStatus.userId || email;
    const stretchedKey = await this.securePassphrase.stretchPassphrase(passphrase, userSalt);
    
    // 4. Encrypt stretched key for storage (reversible but server can't decrypt)
    const encryptedStretched = await this.securePassphrase.encryptStretchedPassphrase(
      stretchedKey, 
      email
    );
    
    // 5. Generate mnemonic and derive wallets
    const mnemonic = this.walletCrypto.generateMnemonic();
    const wallets = await this.walletCrypto.deriveWalletsFromMnemonic(mnemonic);
    
    // 6. Encrypt mnemonic with stretched key
    const encryptedMnemonic = await this.walletCrypto.encryptMnemonic(mnemonic, stretchedKey);
    
    // 7. Prepare registration data (no raw passphrase!)
    const registrationData: SecureRegistrationData = {
      email,
      name: waitlistStatus.isWaitlistUser ? waitlistStatus.name : name,
      language_to_learn: waitlistStatus.isWaitlistUser ? waitlistStatus.language_to_learn : language_to_learn,
      
      // Encrypted stretched passphrase
      encryptedStretchedKey: encryptedStretched.encryptedStretchedKey,
      encryptionSalt: encryptedStretched.encryptionSalt,
      stretchedKeyNonce: encryptedStretched.nonce,
      
      // Encrypted mnemonic
      encrypted_mnemonic: encryptedMnemonic.encryptedData,
      mnemonic_salt: encryptedMnemonic.salt,
      mnemonic_nonce: encryptedMnemonic.nonce,
      
      // Public wallet data
      sei_address: wallets.seiWallet.address,
      sei_public_key: wallets.seiWallet.publicKey,
      eth_address: wallets.evmWallet.address,
      eth_public_key: wallets.evmWallet.publicKey
    };

    // 8. Submit to backend (server never sees raw passphrase)
    return await this.submitSecureRegistration(registrationData);
  }

  /**
   * Recover wallet using secure passphrase approach
   */
  async recoverSecureWallet(email: string, passphrase: string): Promise<WalletData> {
    
    // 1. Get user profile from server
    const profile = await firstValueFrom(
      this.http.get<any>(`/api/profile/email/${email}`)
    );
    
    if (!profile.encryptedStretchedKey) {
      throw new Error('No secure wallet data found for this email');
    }
    
    // 2. Verify passphrase and decrypt stretched key
    const encryptedStretched = {
      encryptedStretchedKey: profile.encryptedStretchedKey,
      encryptionSalt: profile.encryptionSalt,
      nonce: profile.stretchedKeyNonce
    };
    
    const isValidPassphrase = await this.securePassphrase.verifyPassphrase(
      passphrase,
      email,
      encryptedStretched
    );
    
    if (!isValidPassphrase) {
      throw new Error('Invalid passphrase');
    }
    
    // 3. Decrypt stretched key
    const stretchedKey = await this.securePassphrase.decryptStretchedPassphrase(
      encryptedStretched,
      email
    );
    
    // 4. Decrypt mnemonic
    const encryptedMnemonic = {
      encryptedData: profile.encrypted_mnemonic,
      salt: profile.mnemonic_salt,
      nonce: profile.mnemonic_nonce
    };
    
    const mnemonic = await this.walletCrypto.decryptMnemonic(encryptedMnemonic, stretchedKey);
    
    // 5. Derive wallets from mnemonic
    return await this.walletCrypto.deriveWalletsFromMnemonic(mnemonic);
  }

  /**
   * Submit registration to backend (no sensitive data)
   */
  private async submitSecureRegistration(data: SecureRegistrationData): Promise<RegistrationResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<RegistrationResult>('/api/auth/wallet/secure-signup', data)
      );
      
      return response;
    } catch (error: any) {
      console.error('Secure registration failed:', error);
      throw new Error(error.error?.message || 'Registration failed');
    }
  }

  /**
   * Create waitlist signup (no wallet yet)
   */
  async createWaitlistSignup(
    email: string,
    name: string,
    language_to_learn: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<any>('/api/profile', {
          email,
          name,
          initial_language_to_learn: language_to_learn,
          isWaitlistUser: true,
          wlw: false,
          waitlist_signup_at: new Date().toISOString()
        })
      );
      
      return {
        success: true,
        message: 'Successfully joined waitlist'
      };
    } catch (error: any) {
      if (error.status === 409) {
        throw new Error('Email already registered');
      }
      throw new Error('Failed to join waitlist');
    }
  }
}
