import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SecurePassphraseService } from './secure-passphrase.service';
import { WalletCryptoService } from './wallet-crypto.service';

export interface SecureRegistrationRequest {
  email: string;
  username: string;
  encryptedStretchedKey: string;
  encryptionSalt: string;
  stretchedKeyNonce: string;
  encryptedMnemonic: string;
  mnemonicSalt: string;
  mnemonicNonce: string;
  seiAddress: string;
  ethAddress: string;
  clientMetadata?: {
    userAgent: string;
    timestamp: string;
    securityVersion: string;
  };
}

export interface SecureRegistrationResponse {
  success: boolean;
  userId: string;
  message: string;
  securityAuditId: string;
}

export interface WalletConversionRequest {
  userId: string;
  encryptedStretchedKey: string;
  encryptionSalt: string;
  stretchedKeyNonce: string;
  encryptedMnemonic: string;
  mnemonicSalt: string;
  mnemonicNonce: string;
  seiAddress: string;
  ethAddress: string;
  conversionReason: string;
}

export interface WalletConversionResponse {
  success: boolean;
  message: string;
  securityAuditId: string;
  conversionTimestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecureWalletRegistrationService {
  private readonly baseUrl = environment.apiUrl;
  private readonly authServiceUrl = `${this.baseUrl}/auth`;
  private readonly profileServiceUrl = `${this.baseUrl}/profile`;

  constructor(
    private http: HttpClient,
    private securePassphraseService: SecurePassphraseService,
    private walletCryptoService: WalletCryptoService
  ) {}

  /**
   * Register a new user with secure passphrase architecture
   */
  async registerSecureUser(
    email: string,
    username: string,
    passphrase: string,
    seedPhrase: string
  ): Promise<SecureRegistrationResponse> {
    try {
      // Generate stretched key and encryption materials
      const stretchedKey = await this.securePassphraseService.stretchPassphrase(passphrase, email);
      const encryptedStretchedKeyData = await this.securePassphraseService.encryptStretchedPassphrase(stretchedKey, email);

      // Encrypt the seed phrase using the wallet crypto service
      const encryptedMnemonic = await this.walletCryptoService.encryptMnemonic(seedPhrase, stretchedKey);

      // Generate wallet addresses from seed phrase
      const walletData = await this.walletCryptoService.deriveWalletsFromMnemonic(seedPhrase);

      const registrationData: SecureRegistrationRequest = {
        email,
        username,
        encryptedStretchedKey: encryptedStretchedKeyData.encryptedStretchedKey.join(','),
        encryptionSalt: encryptedStretchedKeyData.encryptionSalt.join(','),
        stretchedKeyNonce: encryptedStretchedKeyData.nonce.join(','),
        encryptedMnemonic: encryptedMnemonic.encryptedData,
        mnemonicSalt: encryptedMnemonic.salt,
        mnemonicNonce: encryptedMnemonic.nonce,
        seiAddress: walletData.seiWallet.address,
        ethAddress: walletData.evmWallet.address,
        clientMetadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          securityVersion: '2.0'
        }
      };

      return this.performSecureRegistration(registrationData).toPromise();
    } catch (error) {
      console.error('Secure registration failed:', error);
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert an existing user to secure passphrase architecture
   */
  async convertUserToSecureWallet(
    userId: string,
    passphrase: string,
    seedPhrase: string,
    email: string,
    conversionReason: string = 'user_upgrade'
  ): Promise<WalletConversionResponse> {
    try {
      // Generate stretched key and encryption materials
      const stretchedKey = await this.securePassphraseService.stretchPassphrase(passphrase, email);
      const encryptedStretchedKeyData = await this.securePassphraseService.encryptStretchedPassphrase(stretchedKey, email);

      // Encrypt the seed phrase using the wallet crypto service
      const encryptedMnemonic = await this.walletCryptoService.encryptMnemonic(seedPhrase, stretchedKey);

      // Generate wallet addresses from seed phrase
      const walletData = await this.walletCryptoService.deriveWalletsFromMnemonic(seedPhrase);

      const conversionData: WalletConversionRequest = {
        userId,
        encryptedStretchedKey: encryptedStretchedKeyData.encryptedStretchedKey.join(','),
        encryptionSalt: encryptedStretchedKeyData.encryptionSalt.join(','),
        stretchedKeyNonce: encryptedStretchedKeyData.nonce.join(','),
        encryptedMnemonic: encryptedMnemonic.encryptedData,
        mnemonicSalt: encryptedMnemonic.salt,
        mnemonicNonce: encryptedMnemonic.nonce,
        seiAddress: walletData.seiWallet.address,
        ethAddress: walletData.evmWallet.address,
        conversionReason
      };

      return this.performWalletConversion(conversionData).toPromise();
    } catch (error) {
      console.error('Wallet conversion failed:', error);
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Register a waitlist user with secure architecture
   */
  async registerWaitlistUserWithSecureWallet(
    waitlistToken: string,
    passphrase: string,
    seedPhrase: string,
    email: string
  ): Promise<SecureRegistrationResponse> {
    try {
      // Generate secure materials
      const stretchedKey = await this.securePassphraseService.stretchPassphrase(passphrase, email);
      const encryptedStretchedKeyData = await this.securePassphraseService.encryptStretchedPassphrase(stretchedKey, email);

      // Encrypt the seed phrase using the wallet crypto service
      const encryptedMnemonic = await this.walletCryptoService.encryptMnemonic(seedPhrase, stretchedKey);

      // Generate wallet addresses from seed phrase
      const walletData = await this.walletCryptoService.deriveWalletsFromMnemonic(seedPhrase);

      const registrationData = {
        waitlistToken,
        encryptedStretchedKey: encryptedStretchedKeyData.encryptedStretchedKey.join(','),
        encryptionSalt: encryptedStretchedKeyData.encryptionSalt.join(','),
        stretchedKeyNonce: encryptedStretchedKeyData.nonce.join(','),
        encryptedMnemonic: encryptedMnemonic.encryptedData,
        mnemonicSalt: encryptedMnemonic.salt,
        mnemonicNonce: encryptedMnemonic.nonce,
        seiAddress: walletData.seiWallet.address,
        ethAddress: walletData.evmWallet.address,
        clientMetadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          securityVersion: '2.0'
        }
      };

      return this.performWaitlistRegistration(registrationData).toPromise();
    } catch (error) {
      console.error('Waitlist registration failed:', error);
      throw new Error(`Waitlist registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simplified secure wallet registration for waitlist signup
   * Generates mnemonic internally and returns wallet data for display
   */
  async registerSecureWallet(
    email: string,
    username: string,
    passphrase: string,
    name: string,
    language: string
  ): Promise<{
    success: boolean;
    message: string;
    walletData: {
      mnemonic: string;
      seiAddress: string;
      ethAddress: string;
      encryptedMnemonic: string;
      mnemonicSalt: string;
      mnemonicNonce: string;
      userId?: string;
    }
  }> {
    try {
      console.log('🔐 Starting secure wallet registration for waitlist...');

      // Generate a new mnemonic
      const mnemonic = this.walletCryptoService.generateMnemonic();
      
      // Derive wallet addresses
      const walletData = await this.walletCryptoService.deriveWalletsFromMnemonic(mnemonic);
      
      // Generate stretched key and encryption materials
      console.log('🔑 Generating stretched key for:', email);
      const stretchedKey = await this.securePassphraseService.stretchPassphrase(passphrase, email);
      console.log('✅ Stretched key generated, length:', stretchedKey?.length || 'undefined');
      
      console.log('🔒 Encrypting stretched key...');
      const encryptedStretchedKeyData = await this.securePassphraseService.encryptStretchedPassphrase(stretchedKey, email);
      console.log('✅ Encrypted stretched key data:', {
        encryptedStretchedKey: encryptedStretchedKeyData?.encryptedStretchedKey?.length || 'undefined',
        encryptionSalt: encryptedStretchedKeyData?.encryptionSalt?.length || 'undefined',
        nonce: encryptedStretchedKeyData?.nonce?.length || 'undefined'
      });

      // Validate that we have non-empty stretched key data
      if (!encryptedStretchedKeyData?.encryptedStretchedKey?.length || 
          !encryptedStretchedKeyData?.encryptionSalt?.length || 
          !encryptedStretchedKeyData?.nonce?.length) {
        throw new Error('Failed to generate encrypted stretched key data - crypto operations may have failed');
      }

      // Encrypt the mnemonic
      console.log('🔐 Encrypting mnemonic with stretched key...');
      const encryptedMnemonic = await this.walletCryptoService.encryptMnemonic(mnemonic, stretchedKey);
      console.log('✅ Mnemonic encrypted');

      // Prepare registration data with validation
      const stretchedKeyString = encryptedStretchedKeyData.encryptedStretchedKey.join(',');
      const encryptionSaltString = encryptedStretchedKeyData.encryptionSalt.join(',');
      const stretchedKeyNonceString = encryptedStretchedKeyData.nonce.join(',');
      
      console.log('📊 Prepared data lengths:', {
        stretchedKeyString: stretchedKeyString.length,
        encryptionSaltString: encryptionSaltString.length,
        stretchedKeyNonceString: stretchedKeyNonceString.length
      });
      
      if (!stretchedKeyString || !encryptionSaltString || !stretchedKeyNonceString) {
        throw new Error('Stretched key data serialization failed - empty strings detected');
      }

      const registrationData = {
        email,
        username,
        name,
        language_to_learn: language,
        encryptedStretchedKey: stretchedKeyString,
        encryptionSalt: encryptionSaltString,
        stretchedKeyNonce: stretchedKeyNonceString,
        encrypted_mnemonic: encryptedMnemonic.encryptedData,
        mnemonic_salt: encryptedMnemonic.salt,
        mnemonic_nonce: encryptedMnemonic.nonce,
        sei_address: walletData.seiWallet.address,
        sei_public_key: walletData.seiWallet.publicKey,
        eth_address: walletData.evmWallet.address,
        eth_public_key: walletData.evmWallet.publicKey,
        clientMetadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          securityVersion: '2.0'
        }
      };

      // Register with the backend (waitlist + wallet)
      const response = await this.performSecureRegistration(registrationData as any).toPromise();

      // Store wallet data in IndexedDB for local access
      await this.storeWalletInIndexedDB(email, {
        mnemonic,
        encryptedMnemonic,
        seiAddress: walletData.seiWallet.address,
        ethAddress: walletData.evmWallet.address
      });

      return {
        success: true,
        message: 'Wallet created successfully! You\'ve been added to the waitlist.',
        walletData: {
          mnemonic,
          seiAddress: walletData.seiWallet.address,
          ethAddress: walletData.evmWallet.address,
          encryptedMnemonic: encryptedMnemonic.encryptedData,
          mnemonicSalt: encryptedMnemonic.salt,
          mnemonicNonce: encryptedMnemonic.nonce,
          userId: response.userId
        }
      };

    } catch (error: any) {
      console.error('Secure wallet registration failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to create wallet. Please try again.',
        walletData: {
          mnemonic: '',
          seiAddress: '',
          ethAddress: '',
          encryptedMnemonic: '',
          mnemonicSalt: '',
          mnemonicNonce: ''
        }
      };
    }
  }

  /**
   * Store wallet data in IndexedDB for local access
   */
  private async storeWalletInIndexedDB(
    email: string,
    walletData: {
      mnemonic: string;
      encryptedMnemonic: any;
      seiAddress: string;
      ethAddress: string;
    }
  ): Promise<void> {
    try {
      const request = indexedDB.open('YAP-Waitlist-Wallets', 1);
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('wallets')) {
            db.createObjectStore('wallets', { keyPath: 'email' });
          }
        };
        
        request.onsuccess = () => {
          const db = request.result;
          
          const walletRecord = {
            email,
            encryptedMnemonic: walletData.encryptedMnemonic,
            seiAddress: walletData.seiAddress,
            ethAddress: walletData.ethAddress,
            createdAt: new Date().toISOString(),
            source: 'waitlist_signup'
          };
          
          const transaction = db.transaction(['wallets'], 'readwrite');
          const store = transaction.objectStore('wallets');
          store.put(walletRecord);
          
          transaction.oncomplete = () => {
            console.log('✅ Wallet stored in IndexedDB');
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        };
      });
    } catch (error) {
      console.warn('Failed to store wallet in IndexedDB:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Validate passphrase strength and requirements
   */
  validatePassphrase(passphrase: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (passphrase.length < 12) {
      errors.push('Passphrase must be at least 12 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(passphrase)) {
      errors.push('Passphrase must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(passphrase)) {
      errors.push('Passphrase must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(passphrase)) {
      errors.push('Passphrase must contain at least one number');
    }
    
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(passphrase)) {
      errors.push('Passphrase must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private performSecureRegistration(data: SecureRegistrationRequest): Observable<SecureRegistrationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Security-Version': '2.0'
    });

    return this.http.post<SecureRegistrationResponse>(
      `${this.authServiceUrl}/secure-signup`,
      data,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private performWalletConversion(data: WalletConversionRequest): Observable<WalletConversionResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Security-Version': '2.0'
    });

    return this.http.post<WalletConversionResponse>(
      `${this.profileServiceUrl}/${data.userId}/wallet-conversion`,
      data,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private performWaitlistRegistration(data: any): Observable<SecureRegistrationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Security-Version': '2.0'
    });

    return this.http.post<SecureRegistrationResponse>(
      `${this.authServiceUrl}/waitlist/register-secure`,
      data,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('SecureWalletRegistrationService error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}