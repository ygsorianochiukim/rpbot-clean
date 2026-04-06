import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Job } from '../../Model/Job/job';
import { getInterviewSystemPrompt, SessionData } from '../../../../gptPrompt/promptLoader';

@Injectable({
  providedIn: 'root'
})
export class InterviewServices {

  private apiUrl = '';
  private apiKey = '';

  constructor(private http: HttpClient) {}

  sendMessage(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    job: Job,
    command: 'start' | 'end' | 'followup' | 'ratings' | string
  ): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const sessionData: SessionData = {
      firstname: sessionStorage.getItem('firstname') || '',
      middlename: sessionStorage.getItem('middlename') || '',
      lastname: sessionStorage.getItem('lastname') || '',
      email: sessionStorage.getItem('email') || '',
      civilstatus: sessionStorage.getItem('civilstatus') || '',
      contactnumber: sessionStorage.getItem('contactnumber') || '',
      birthdate: sessionStorage.getItem('birthdate') || '',
      religion: sessionStorage.getItem('religion') || '',
      province: sessionStorage.getItem('province') || '',
      cities: sessionStorage.getItem('cities') || '',
      barangay: sessionStorage.getItem('barangay') || '',
      zipcode: sessionStorage.getItem('zipcode') || '',
      expectedsalary: sessionStorage.getItem('expectedsalary') || '',
      eligibility: sessionStorage.getItem('eligibility') || '',
      college: sessionStorage.getItem('college') || '',
      course: sessionStorage.getItem('course') || '',
      yeargraduate: sessionStorage.getItem('yeargraduate') || '',
      graduateschool: sessionStorage.getItem('graduateschool') || '',
      boardexam: sessionStorage.getItem('boardexam') || '',
      workingList: JSON.parse(sessionStorage.getItem('workingList') || '[]'),
      lockincontract: sessionStorage.getItem('lockincontract') || '',
      motorcycle: sessionStorage.getItem('motorcycle') || ''
    };

    // Determine user content based on command
    let userContent = '';
    switch (command) {
      case 'start':
        userContent = 'Start interview';
        break;
      case 'end':
        userContent = 'End interview';
        break;
      case 'ratings':
        userContent = 'Give me private ratings for this applicant';
        break;
      case 'followup':
        userContent = 'Suggest good follow-up questions';
        break;
      default:
        userContent = command;
    }

    const userMessage = { role: 'user', content: userContent };

    // Use RxJS to handle the async prompt loading
    return from(
      getInterviewSystemPrompt(
        job.role,
        job.qualifications || [],
        sessionData,
        job.salaryBudget || ''
      )
    ).pipe(
      switchMap((systemPrompt) => {
        const systemMessage = {
          role: 'system',
          content: systemPrompt
        };

        const body = {
          model: 'deepseek-chat',
          messages: [systemMessage, ...messages, userMessage],
          temperature: 0.7,
          max_tokens: 800
        };

        return this.http.post<any>(this.apiUrl, body, { headers });
      })
    );
  }
}