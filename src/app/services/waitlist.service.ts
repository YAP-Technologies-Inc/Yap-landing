import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { DynamicService } from './dynamic.service';
import { switchMap, catchError } from 'rxjs/operators';

export interface WaitlistEntry {
  name: string;
  email: string;
  language_preferred: string;
  acceptTerms: boolean;
  seiWalletAddress?: string;
  dynamicUserId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private dynamicService: DynamicService
  ) { }

  /**
   * Submits a waitlist entry, automatically including the wallet information
   * from Dynamic.xyz if available
   */
  submitWaitlistEntry(entry: WaitlistEntry): Observable<any> {
    // Get the current wallet info
    const walletInfo = this.dynamicService.getCurrentWalletInfo();
    
    // If we have wallet info, include it in the entry
    if (walletInfo) {
      entry.seiWalletAddress = walletInfo.seiWalletAddress;
      entry.dynamicUserId = walletInfo.dynamicUserId;
    }
    
    // Submit the entry with wallet info if available
    return this.http.post(`${this.apiUrl}/auth/wallet`, entry).pipe(
      catchError(error => {
        console.error('Error submitting waitlist entry:', error);
        throw error;
      })
    );
  }
}
