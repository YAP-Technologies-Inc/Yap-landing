import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WaitlistService, WaitlistEntry } from '../../../services/waitlist.service';
import { SecureWalletRegistrationService, SecureRegistrationRequest } from '../../../services/secure-wallet-registration.service';
import { WalletCryptoService } from '../../../services/wallet-crypto.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface WaitlistWalletInfo {
  mnemonic: string;
  seiAddress: string;
  ethAddress: string;
  encryptedMnemonic: string;
  mnemonicSalt: string;
  mnemonicNonce: string;
}

@Component({
  selector: 'app-waitlist-page',
  templateUrl: './waitlist-page.component.html',
  styleUrls: ['./waitlist-page.component.scss'],
})
export class WaitlistPageComponent implements OnInit {
  // Flow selection
  selectedFlow: 'simple' | 'wallet' | null = null;
  
  // Forms
  waitlistForm: FormGroup;
  walletForm: FormGroup;
  
  // UI states
  submitted = false;
  success = false;
  isSubmitting = false;
  errorMessage = '';
  
  // Wallet creation states
  isCreatingWallet = false;
  walletCreated = false;
  walletInfo: WaitlistWalletInfo | null = null;
  showRecoveryPhrase = false;
  recoveryPhraseConfirmed = false;

  constructor(
    private fb: FormBuilder,
    private waitlistService: WaitlistService,
    private secureWalletService: SecureWalletRegistrationService,
    private walletCryptoService: WalletCryptoService
  ) {
    // Simple waitlist form
    this.waitlistForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      language: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

    // Wallet waitlist form (includes passphrase)
    this.walletForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      language: ['', [Validators.required]],
      passphrase: ['', [Validators.required, Validators.minLength(8)]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit() {
    // Check for any existing wallet data in IndexedDB
    this.checkExistingWalletData();
  }

  // Form getters for both forms
  get simpleForm(): any { return this.waitlistForm.controls; }
  get walletFormControls(): any { return this.walletForm.controls; }

  // Flow selection methods
  selectSimpleFlow() {
    this.selectedFlow = 'simple';
  }

  selectWalletFlow() {
    this.selectedFlow = 'wallet';
  }

  resetFlow() {
    this.selectedFlow = null;
    this.success = false;
    this.errorMessage = '';
    this.submitted = false;
    this.walletCreated = false;
    this.walletInfo = null;
    this.showRecoveryPhrase = false;
    this.recoveryPhraseConfirmed = false;
  }

  // Check for existing wallet data in IndexedDB
  private async checkExistingWalletData() {
    // This would check IndexedDB for any existing wallet data
    // For now, just a placeholder
  }

  // Simple waitlist submission
  onSubmitSimple() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.waitlistForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const waitlistEntry: WaitlistEntry = {
      name: this.waitlistForm.value.name,
      email: this.waitlistForm.value.email,
      language_to_learn: this.waitlistForm.value.language,
      acceptTerms: this.waitlistForm.value.acceptTerms
    };

    this.waitlistService.submitWaitlistEntry(waitlistEntry)
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.success = true;
          this.waitlistForm.reset();
          this.submitted = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'An error occurred. Please try again later.';
        }
      });
  }

  // Wallet waitlist submission with wallet creation
  async onSubmitWallet() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.walletForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.isCreatingWallet = true;

    try {
      const formData = this.walletForm.value;
      
      // Register with secure wallet creation using the landing page service
      const result = await this.secureWalletService.registerSecureWallet(
        formData.email,
        formData.username,
        formData.passphrase,
        formData.name,
        formData.language
      );

      if (result.success) {
        // Store wallet info for display
        this.walletInfo = {
          mnemonic: result.walletData.mnemonic,
          seiAddress: result.walletData.seiAddress,
          ethAddress: result.walletData.ethAddress,
          encryptedMnemonic: result.walletData.encryptedMnemonic,
          mnemonicSalt: result.walletData.mnemonicSalt,
          mnemonicNonce: result.walletData.mnemonicNonce
        };

        this.walletCreated = true;
        this.success = true;
        this.submitted = false;
      } else {
        throw new Error(result.message || 'Wallet creation failed');
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during wallet creation. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.isCreatingWallet = false;
    }
  }

  // Toggle recovery phrase visibility
  toggleRecoveryPhrase() {
    this.showRecoveryPhrase = !this.showRecoveryPhrase;
  }

  // Confirm recovery phrase was written down
  confirmRecoveryPhrase() {
    this.recoveryPhraseConfirmed = true;
  }

  // Copy recovery phrase to clipboard
  async copyRecoveryPhrase() {
    if (this.walletInfo?.mnemonic) {
      try {
        await navigator.clipboard.writeText(this.walletInfo.mnemonic);
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to copy recovery phrase:', error);
      }
    }
  }

  // Copy address to clipboard
  async copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }
}
