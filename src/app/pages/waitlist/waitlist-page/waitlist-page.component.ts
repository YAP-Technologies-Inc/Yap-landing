import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WaitlistService, WaitlistEntry } from '../../../services/waitlist.service';
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

  constructor(
    private fb: FormBuilder,
    private waitlistService: WaitlistService
  ) {
    this.waitlistForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      language: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit() {
    // No wallet info to load
  }

  // Use type assertion to fix form control access
  get f(): any { return this.waitlistForm.controls; }

  onSubmit() {
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
}
