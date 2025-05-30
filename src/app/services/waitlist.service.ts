import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

export interface WaitlistEntry {
  name: string;
  email: string;
  language_to_learn: string;
  acceptTerms: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Submits a waitlist entry
   */
  submitWaitlistEntry(entry: WaitlistEntry): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/wallet`, entry).pipe(
      catchError(error => {
        console.error('Error submitting waitlist entry:', error);
        throw error;
      })
    );
  }
}
