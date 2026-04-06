import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailServices } from '../../Services/Email/email-services';
import { HttpClientModule } from '@angular/common/http';
import { FormSubmission } from '../../Services/form-submission';
import { IqModel } from '../../Model/iq/iq';
import { Wpm } from '../../Model/wpm/wpm';
import { Conversation } from '../../Model/Conversation/conversation';
import { Otp } from '../../Model/SmsOtp/otp.model';
import { Sms } from '../../Services/SMS/sms';


@Component({
  selector: 'app-interviewevaluation',
  imports: [HttpClientModule],
  templateUrl: './interviewevaluation.html',
  styleUrl: './interviewevaluation.scss',
  providers:[EmailServices, FormSubmission, Sms]
})
export class Interviewevaluation implements OnInit {
  constructor(private Router: Router, private EmailServices: EmailServices, private FormRegistrationServices : FormSubmission , private SMSServices : Sms) {}


  SMSData: Otp = {
    number: '',
    status: '',
    language: '',
    position: '',
  }
  EmailFields: any;
  IQForm: IqModel ={
    applicant_i_information_id: Number(sessionStorage.getItem('applicantID')) || 0,
    score: Number(sessionStorage.getItem('score')) || 0,
  }
  WPMForm: Wpm ={
    applicant_i_information_id: Number(sessionStorage.getItem('applicantID')) || 0,
    wpm: Number(sessionStorage.getItem('wpm')) || 0,
    accuracy:  Number(sessionStorage.getItem('accuracy')) || 0,
  }
  MessageFields: Conversation = {
    applicant_i_information_id: Number(sessionStorage.getItem('applicantID')) || 0,
    messages: JSON.parse(sessionStorage.getItem('interviewMessages') || '[]'),
    care: 0,
    ambition: 0,
    influence: 0,
    skillsDevelopment: 0,
    technicalSkills: 0,
    discipline: 0,
    commentary: '',
  };
  ngOnInit(): void {
    const raw = sessionStorage.getItem('evaluationRatings');
    const ratings = JSON.parse(raw!);
    this.EmailFields = {
      name: 'Yvert Glynn Soriano',
      email: ['sorianoyvert90@gmail.com', 'hrd_ho_maker@chiukim.com' , 'hrd_ho_checker@chiukim.com'],
      // email: ['sorianoyvert90@gmail.com'],
      message: ratings.commentary,
      care: ratings.care,
      discipline: ratings.discipline,
      ambition: ratings.ambition,
      influence: ratings.influence,
      skillsDevelopment: ratings.skillsDevelopment,
      technicalSkills: ratings.technicalSkills,
      wpm: sessionStorage.getItem('wpm') || null,
      accuracy: sessionStorage.getItem('accuracy') || null,
      score: sessionStorage.getItem('score') || null,
      applicant: sessionStorage.getItem('applicantName') || null,
      applicantID: sessionStorage.getItem('applicantID') || null,
    };

    this.MessageFields.care = this.EmailFields.care;
    this.MessageFields.discipline = this.EmailFields.discipline;
    this.MessageFields.ambition = this.EmailFields.ambition;
    this.MessageFields.influence = this.EmailFields.influence;
    this.MessageFields.skillsDevelopment = this.EmailFields.skillsDevelopment;
    this.MessageFields.technicalSkills = this.EmailFields.technicalSkills;
    this.MessageFields.commentary = this.EmailFields.message;
    const messages = sessionStorage.getItem('interviewMessages');
    if (messages) {
      const parsed = JSON.parse(messages); 

      const validLanguages = ["english", "tagalog", "ilonggo"];
      const langEntry = parsed.find((m: any) => 
        m.role === 'user' &&
        validLanguages.some(lang => m.content.toLowerCase().includes(lang))
      );
      if (langEntry) {
        const lowerContent = langEntry.content.toLowerCase();
        const detected = validLanguages.find(lang => lowerContent.includes(lang));

        this.SMSData.language = detected ?? "english";
      } else {
        this.SMSData.language = "english";
      }
    }
    this.SMSData.position =  sessionStorage.getItem('applicantPosition')!;
    this.SMSData.number = sessionStorage.getItem('contactnumber')!;
    if (this.MessageFields.ambition! <= 2 ||this.MessageFields.care! <= 2 ||this.MessageFields.discipline! <= 2 ||this.MessageFields.influence! <= 2 ||this.MessageFields.skillsDevelopment! <= 2 ||this.MessageFields.technicalSkills! <= 2 ) {
      this.SMSData.status = 'Failed'
    }
    else{
      this.SMSData.status = 'Passed'
    }
    this.SMSData.number = sessionStorage.getItem('contactnumber')!;
    setTimeout(() => {
      this.FormRegistrationServices.storeIq(this.IQForm).subscribe(()=> {});
      this.FormRegistrationServices.storeWpm(this.WPMForm).subscribe(()=> {});
      this.FormRegistrationServices.StoreMesssage(this.MessageFields).subscribe(() => {});
      this.SMSServices.sentConfirmation(this.SMSData).subscribe(() => {});
      this.EmailServices.sendEmail(this.EmailFields).subscribe(() => {
      });
      this.Router.navigate(['/complete']);
    }, 5000);
  }
}
