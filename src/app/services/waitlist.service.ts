import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WaitlistEntry {
  name: string;
  email: string;
  language_preferred: string;
  acceptTerms: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WaitlistService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  submitWaitlistEntry(entry: WaitlistEntry): Observable<any> {
    return this.http.post(`${this.apiUrl}/waitlist/register`, entry);
  }
}
