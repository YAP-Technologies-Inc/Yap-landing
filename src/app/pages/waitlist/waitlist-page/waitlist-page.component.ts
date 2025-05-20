import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WaitlistService, WaitlistEntry } from '../../../services/waitlist.service';
import { DynamicService } from '../../../services/dynamic.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-waitlist-page',
  templateUrl: './waitlist-page.component.html',
  styleUrls: ['./waitlist-page.component.scss'],
})
export class WaitlistPageComponent implements OnInit {
  waitlistForm: FormGroup;
  submitted = false;
  success = false;
  isSubmitting = false;
  errorMessage = '';
  seiWalletAddress = '';
  dynamicUserId = '';
  dynamicEnvironmentId = environment.dynamicEnvironmentId;

  constructor(
    private fb: FormBuilder,
    private waitlistService: WaitlistService,
    private dynamicService: DynamicService
  ) {
    this.waitlistForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      language: ['', [Validators.required]],
      seiWalletAddress: [''],
      dynamicUserId: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit() {
    // Check if we already have wallet info from local storage
    this.dynamicService.getWalletInfo().subscribe({
      next: (walletInfo) => {
        if (walletInfo) {
          console.log('Wallet info loaded from storage:', walletInfo);
          this.seiWalletAddress = walletInfo.seiWalletAddress;
          this.dynamicUserId = walletInfo.dynamicUserId;
          this.waitlistForm.patchValue({
            seiWalletAddress: walletInfo.seiWalletAddress,
            dynamicUserId: walletInfo.dynamicUserId
          });
        } else {
          // If no wallet info, the DynamicService will automatically
          // create an embedded wallet in the background
          console.log('No existing wallet info found, service will create new wallet');
        }
      },
      error: (error) => {
        console.error('Error getting wallet info:', error);
        // Fall back to local storage if dynamic service fails
        this.tryGetWalletAndUserInfo();
      }
    });
  }

  // Use type assertion to fix form control access
  get f(): any { return this.waitlistForm.controls; }

  /**
   * Handle wallet connection event from the web component
   */
  onWalletConnected(event: CustomEvent): void {
    console.log('Wallet connected event received:', event.detail);
    
    this.seiWalletAddress = event.detail.walletAddress;
    this.dynamicUserId = event.detail.userId;
    
    // Update form values
    this.waitlistForm.patchValue({
      seiWalletAddress: this.seiWalletAddress,
      dynamicUserId: this.dynamicUserId
    });
    
    // Update the Dynamic service with the new wallet info
    this.dynamicService.updateFromWebComponent(this.seiWalletAddress, this.dynamicUserId);
    
    // No need to manually store in localStorage as the service handles that
    console.log('Wallet info updated in Dynamic service');
  }

  tryGetWalletAndUserInfo() {
    // Try to get values from localStorage
    const storedWallet = localStorage.getItem('seiWalletAddress');
    const storedUserId = localStorage.getItem('dynamicUserId');
    
    if (storedWallet) {
      this.seiWalletAddress = storedWallet;
      this.waitlistForm.patchValue({seiWalletAddress: storedWallet});
    }
    
    if (storedUserId) {
      this.dynamicUserId = storedUserId;
      this.waitlistForm.patchValue({dynamicUserId: storedUserId});
    }
    
    // You could also check URL parameters here if they're passed that way
    // const urlParams = new URLSearchParams(window.location.search);
    // const walletParam = urlParams.get('wallet');
    // const userIdParam = urlParams.get('userId');
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.waitlistForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    
    // Map the form values to the API model
    const waitlistEntry: WaitlistEntry = {
      name: this.waitlistForm.value.name,
      email: this.waitlistForm.value.email,
      language_preferred: this.waitlistForm.value.language,
      acceptTerms: this.waitlistForm.value.acceptTerms,
      seiWalletAddress: this.waitlistForm.value.seiWalletAddress || this.seiWalletAddress,
      dynamicUserId: this.waitlistForm.value.dynamicUserId || this.dynamicUserId
    };

    // Submit to the API
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
  
  connectWallet() {
    // Manually trigger wallet creation (useful for testing or if automatic creation fails)
    console.log('Manual wallet creation requested');
    this.dynamicService.createEmbeddedWallet()
      .then(walletInfo => {
        if (walletInfo) {
          console.log('Wallet created manually:', walletInfo);
          this.seiWalletAddress = walletInfo.seiWalletAddress;
          this.dynamicUserId = walletInfo.dynamicUserId;
          this.waitlistForm.patchValue({
            seiWalletAddress: walletInfo.seiWalletAddress,
            dynamicUserId: walletInfo.dynamicUserId
          });
        }
      })
      .catch(error => {
        console.error('Failed to create wallet manually:', error);
        this.errorMessage = 'Failed to create wallet. Please try again later.';
      });
  }
}
