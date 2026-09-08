import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Information } from '../information/information';
import { Test } from '../test/test';
import { CommonModule } from '@angular/common';
import { Home } from "../home/home";
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';
import { InformationServices } from '../../Services/Information/information';
import { InterviewHandoff } from "../interview-handoff/interview-handoff";
import { Router } from '@angular/router';
import { Disclaimer } from '../disclaimer/disclaimer';
import { ApplicantPreview } from "../applicant-preview/applicant-preview";
import { Validation } from '../applicantValidation/validation';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [Information, Test, CommonModule, Home, LucideAngularModule, InterviewHandoff, Disclaimer, Validation],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  providers: []
})
export class Panel implements OnInit {
  readonly back = ChevronLeft;
  step: number = 1;
  showNext = true;
  isVisible: boolean = true;
  verifierisVisible: boolean = true;
  disclaimerVisible: boolean = true;
  reApplyUser: boolean = false;
  applicationVerifier: boolean = false;
  reInterviewID = sessionStorage.getItem('reapplyID');
  generalInterview = sessionStorage.getItem('generalInterview') || 'Pending';
  constructor(private Router: Router, private cdr: ChangeDetectorRef) {}

  get info(): string {
    const dataStored = sessionStorage.getItem('DataStored');
    return dataStored ? dataStored : 'false';
  }

  get IQtestScore(): number {
    const testScore = sessionStorage.getItem('score');
    return testScore ? parseInt(testScore, 10) : 0;
  }
  get form(): number {
    const savedForm = sessionStorage.getItem('form');
    return savedForm ? parseInt(savedForm, 10) : 0;
  }
  get verifier(): string {
    const disclaimer = sessionStorage.getItem('disclaimer');
    return disclaimer ? disclaimer : '' ;
  }
  ngOnInit(): void {
    const savedStep = sessionStorage.getItem('step');
    this.step = savedStep ? parseInt(savedStep, 10) : 1;

    const restriction = sessionStorage.getItem('Agreement');
    this.disclaimerVisible = !restriction;

    const verification = sessionStorage.getItem('Agreement');
    this.applicationVerifier = !verification;

    const employmentStatus = sessionStorage.getItem('EmployementStatus');
    this.reApplyUser = (employmentStatus === 'Re-Apply');
  }
  nextStep() {
    // Step 4 is the hand-off to the interview desk; there is nothing after it here.
    if (this.step < 4) {
      this.step++;
      sessionStorage.setItem('step', this.step.toString());
    }
    if (this.step === 2) {
      this.showNext = this.form === 7;
    } else {
      this.showNext = true;
    }
  }

  submitInfo() {
    this.step++;
    sessionStorage.setItem('step', this.step.toString());
  }
  confirmDisclaimer(){
    this.isVisible = false;
    const verification = sessionStorage.getItem('Agreement');
    this.applicationVerifier = !verification;
    this.cdr.detectChanges();
  }
  confirmVerifier(){
    this.verifierisVisible = false;
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
      sessionStorage.setItem('step', this.step.toString());
    }
  }
  reviewInformation(){
    this.Router.navigate([`previewInformation/${this.reInterviewID}`]);
  }
}
