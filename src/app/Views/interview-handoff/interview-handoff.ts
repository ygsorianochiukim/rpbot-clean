import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormSubmission } from '../../Services/form-submission';

/**
 * The hand-off to the interview.
 *
 * The interview itself no longer runs in this portal. When the applicant is
 * ready, this saves their exam results, asks the API for their one-time
 * interview link on the Approvals desk, and sends them there. The result
 * comes back to the portal later as passed or failed, and the applicant is
 * texted — nothing about the interview is decided in this browser any more.
 */
@Component({
  selector: 'app-interview-handoff',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './interview-handoff.html',
  styleUrl: './interview-handoff.scss',
  providers: [FormSubmission],
})
export class InterviewHandoff {
  busy = false;
  error = '';
  applicantName = sessionStorage.getItem('applicantName') ?? 'Applicant';
  applicantPosition = sessionStorage.getItem('applicantPosition') ?? '';

  constructor(private api: FormSubmission, private cdr: ChangeDetectorRef) {}

  private get applicantId(): number {
    return Number(sessionStorage.getItem('applicantID')) || 0;
  }

  /** The exam results used to be saved only after the interview. They are
   *  saved here instead, once, so the interviewer and the MD can see them. */
  private saveExamResults(): Observable<unknown> {
    const id = this.applicantId;
    if (sessionStorage.getItem('examsStored') === 'true') return of(null);

    // The IQ page stores either a JSON {correct,total} or a bare number.
    let iqScore = 0;
    try {
      const raw = sessionStorage.getItem('score') || '0';
      const parsed = JSON.parse(raw);
      iqScore = typeof parsed === 'object' && parsed ? Number(parsed.correct) || 0 : Number(parsed) || 0;
    } catch {
      iqScore = Number(sessionStorage.getItem('score')) || 0;
    }

    const swallow = (what: string) => catchError((e) => { console.warn(`Could not save ${what}`, e); return of(null); });
    return forkJoin([
      this.api.storeIq({ applicant_i_information_id: id, score: iqScore }).pipe(swallow('IQ result')),
      this.api.storeWpm({
        applicant_i_information_id: id,
        wpm: Number(sessionStorage.getItem('wpm')) || 0,
        accuracy: Number(sessionStorage.getItem('accuracy')) || 0,
      }).pipe(swallow('typing result')),
    ]);
  }

  startInterview() {
    if (this.busy) return;
    if (!this.applicantId) {
      this.error = 'We could not find your application. Please go back and submit your information first.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    this.saveExamResults().subscribe({
      next: () => {
        sessionStorage.setItem('examsStored', 'true');
        this.api.openInterview(this.applicantId).subscribe({
          next: (res) => {
            if (!res?.url) {
              this.fail('The interview desk did not answer with a link. Please try again.');
              return;
            }
            sessionStorage.setItem('interviewUrl', res.url);
            sessionStorage.setItem('generalInterview', 'Started');
            window.location.href = res.url;
          },
          error: (e) => this.fail(e?.error?.message || 'Could not open your interview. Please try again in a moment.'),
        });
      },
      error: () => this.fail('Could not save your exam results. Please try again.'),
    });
  }

  private fail(message: string) {
    this.busy = false;
    this.error = message;
    this.cdr.detectChanges();
  }
}
