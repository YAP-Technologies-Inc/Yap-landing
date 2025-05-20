import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface WalletInfo {
  seiWalletAddress: string;
  dynamicUserId: string;
}

/**
 * This service acts as a bridge between Angular components and the Dynamic SDK
 * which is implemented via a React wrapper component
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicService {
  private walletInfoSubject = new BehaviorSubject<WalletInfo | null>(null);
  
  constructor() {
    // Load wallet info from localStorage on service initialization
    this.loadFromLocalStorage();
  }
  
  /**
   * Load wallet info from localStorage if available
   */
  private loadFromLocalStorage() {
    try {
      const storedInfo = localStorage.getItem('walletInfo');
      if (storedInfo) {
        const walletInfo = JSON.parse(storedInfo);
        this.walletInfoSubject.next(walletInfo);
      }
    } catch (error) {
      console.error('Error loading wallet info from localStorage:', error);
    }
  }

  /**
   * Update wallet info from the embedded wallet creation process
   */
  updateWalletInfo(walletInfo: WalletInfo) {
    // Store in localStorage
    localStorage.setItem('walletInfo', JSON.stringify(walletInfo));
    
    // Update our subject
    this.walletInfoSubject.next(walletInfo);
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

  /**
   * This is a placeholder that signals to the component that
   * it should attempt to create an embedded wallet.
   * The actual wallet creation happens in the DynamicSdkWrapperComponent.
   */
  createEmbeddedWallet(): Observable<WalletInfo | null> {
    // If we already have wallet info, return it
    if (this.walletInfoSubject.getValue()) {
      return of(this.walletInfoSubject.getValue());
    }
    
    // Otherwise, return null - the wrapper component will handle the creation
    // and notify us via the updateWalletInfo method
    return of(null);
  }
}
