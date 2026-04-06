import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormSubmission } from '../../Services/form-submission';

// Models
import { InformationModel } from '../../Model/Information/information.model';
import { Education } from '../../Model/Information/Education/education.model';
import { ApplicationStatus } from '../../Model/Information/ApplicationStatus/application-status.model';
import { Eligibility } from '../../Model/Information/Eligibility/eligibility.model';
import { Marriage } from '../../Model/Information/Marriage/marriage.model';
import { WorkExperience } from '../../Model/Information/WorkExperience/work-experience.model';
import { Wpm } from '../../Model/wpm/wpm';
import { IqModel } from '../../Model/iq/iq';
import { Conversation } from '../../Model/Conversation/conversation';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Sms } from '../../Services/SMS/sms';
import { Otp } from '../../Model/SmsOtp/otp.model';

@Component({
  selector: 'app-applicant-preview',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './applicant-preview.html',
  styleUrls: ['./applicant-preview.scss'],
  providers: [FormSubmission, Sms]
})
export class ApplicantPreview implements OnInit {
  applicant?: InformationModel;
  education?: Education;
  status?: ApplicationStatus;
  eligibility?: Eligibility;
  marriage?: Marriage;
  work?: WorkExperience;
  wpm?: Wpm;
  iq?: IqModel;
  conversation?: Conversation;

  loading = true;
  SmsUpdate: Otp = {
    number: '',
    status: '',
    position: '',
  }

  constructor(private formService: FormSubmission, private route: ActivatedRoute, private cdr: ChangeDetectorRef, private SMSServices : Sms) {}

  ngOnInit(): void {
    const id =  Number(this.route.snapshot.paramMap.get('id')) || 0

    forkJoin({
      applicant: this.formService.displayApplicantInfo(id),
      education: this.formService.displayApplicantEducationInfo(id),
      status: this.formService.displayApplicationStatusInfo(id),
      eligibility: this.formService.displayApplicantEligibilityInfo(id),
      marriage: this.formService.displayApplicantMarriageInfo(id),
      work: this.formService.displayApplicantExperienceInfo(id),
      wpm: this.formService.displayWpmInfo(id),
      iq: this.formService.displayIqInfo(id),
      conversation: this.formService.displayConversationInfo(id)
    }).subscribe({
      next: (res) => {
        this.applicant = res.applicant;
        this.education = res.education;
        this.status = res.status;
        this.eligibility = res.eligibility;
        this.marriage = res.marriage;
        this.work = res.work;
        this.wpm = res.wpm;
        this.iq = res.iq;
        this.conversation = res.conversation;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching applicant data:', err);
        this.loading = false;
      }
    });
  }
  sendHiredConfirmation(){
    this.SmsUpdate.number = this.applicant?.contactnumber;
    this.SmsUpdate.position = this.applicant?.desiredPosition;
    this.SmsUpdate.status = "Passed";
    this.SMSServices.sentConfirmationUpdate(this.SmsUpdate).subscribe(() => {});
  }
  sendRejectConfirmation(){
    this.SmsUpdate.number = this.applicant?.contactnumber;
    this.SmsUpdate.position = this.applicant?.desiredPosition;
    this.SmsUpdate.status = "Failed";
    this.SMSServices.sentConfirmationUpdate(this.SmsUpdate).subscribe(() => {});
  }
}
