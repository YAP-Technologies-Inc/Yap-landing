import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import * as ethers from 'ethers';
import { SeiWallet, getSigningCosmWasmClient } from '@sei-js/core';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import axios from 'axios';

// Define the wallet info interface
export interface WalletInfo {
  seiWalletAddress: string;
  ethWalletAddress: string;
  userId: string;
  email?: string;
  language_preferred?: string;
  mnemonic: string;  // Required for wallet recovery
}

/**
 * Service to handle wallet creation and management for the YAP platform.
 * This implementation uses @sei-js/core and @cosmjs/proto-signing for SEI wallet creation
 * and generates an Ethereum wallet from the same mnemonic.
 */
@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletInfoSubject = new BehaviorSubject<WalletInfo | null>(null);
  private readonly SEI_CHAIN_ID = 'atlantic-2'; // Use testnet for now
  private readonly SEI_RPC_URL = 'https://sei-testnet-rpc.polkachu.com'; // Example testnet RPC
  private readonly AUTH_SERVICE_URL = environment.apiUrl;
  
  constructor() {}

  /**
   * Create a SEI wallet and a corresponding ETH wallet, and authenticate with the auth service
   */
  async createWallet(email: string, language_preferred?: string): Promise<WalletInfo | null> {
    try {
      console.log('Creating SEI and ETH wallets...');

      // Generate a random 24-word mnemonic
      const mnemonic = ethers.Wallet.createRandom().mnemonic?.phrase;
      if (!mnemonic) {
        throw new Error('Failed to generate mnemonic');
      }

      // Create SEI wallet from mnemonic using DirectSecp256k1HdWallet
      const seiWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: 'sei' // Use SEI address prefix
      });
      
      // Get the SEI wallet address
      const [seiAccount] = await seiWallet.getAccounts();
      const seiWalletAddress = seiAccount.address;

      // Generate Ethereum wallet from the same mnemonic
      const ethWallet = ethers.Wallet.fromPhrase(mnemonic);

      // Generate a user ID
      const userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create wallet info object
      const walletInfo: WalletInfo = {
        seiWalletAddress,
        ethWalletAddress: ethWallet.address,
        userId,
        email,
        language_preferred,
        mnemonic
      };

      // Authenticate with the auth service
      try {
        const response = await axios.post(`${this.AUTH_SERVICE_URL}/auth/wallet`, {
          userId: walletInfo.userId,
          walletAddress: walletInfo.seiWalletAddress,
          ethWalletAddress: walletInfo.ethWalletAddress,
          email: walletInfo.email,
          language_preferred: walletInfo.language_preferred,
          signupMethod: 'waitlist'
        });
        
        console.log('Auth service response:', response.data);
      } catch (error) {
        console.error('Failed to authenticate with auth service:', error);
        // Continue anyway since we have the wallet created
      }
      
      // Update subject
      this.walletInfoSubject.next(walletInfo);
      
      return walletInfo;
    } catch (error) {
      console.error('Error creating wallets:', error);
      return null;
    }
  }

  /**
   * Get the current wallet info as an observable
   */
  getWalletInfo(): Observable<WalletInfo | null> {
    return this.walletInfoSubject.asObservable();
  }
  
  /**
   * Get the current wallet info as a value
   */
  getCurrentWalletInfo(): WalletInfo | null {
    return this.walletInfoSubject.getValue();
  }
}
