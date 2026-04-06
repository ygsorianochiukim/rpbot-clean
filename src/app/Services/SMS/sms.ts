import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Otp } from '../../Model/SmsOtp/otp.model';

@Injectable({
  providedIn: 'root'
})
export class Sms {

  private apiUrl = `${environment.apiUrl}sms`

  constructor(private http: HttpClient) {}

  sentOtp(post: Otp): Observable<Otp>{
    return this.http.post<Otp>(`${this.apiUrl}/send-sms-otp`, post)
  }
  
  sentConfirmation(post: Otp): Observable<Otp>{
    return this.http.post<Otp>(`${this.apiUrl}/send-sms-confirmation`, post)
  }
  sentConfirmationUpdate(post: Otp): Observable<Otp>{
    return this.http.post<Otp>(`${this.apiUrl}/sendSMSConfirmationEvaluation`, post)
  }
}
