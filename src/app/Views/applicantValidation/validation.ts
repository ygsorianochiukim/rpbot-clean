import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { FormSubmission } from '../../Services/form-submission';
import { Lookup } from '../../Model/Lookup/lookup.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './validation.html',
  styleUrl: './validation.scss',
  providers: [FormSubmission]
})
export class Validation implements OnInit {
  @Input() isVisible: boolean = true;
  @Output() confirmVerifier = new EventEmitter<void>();

  employmentStatus: string = '';
  disclaimerConfirmation: boolean = false;
  LookupField: Lookup = {
    fname: '',
    lname: '',
    bdate: '',
    number: null
  }
  applicantID: any;

  constructor(private LookupServices : FormSubmission){}
  ngOnInit() {
    const savedStatus = sessionStorage.getItem('EmployementStatus');
    if (savedStatus) {
      this.employmentStatus = savedStatus;
      this.isVisible = false;
      this.confirmVerifier.emit();
    }
  }

  confirm() {
    sessionStorage.setItem('EmployementStatus', this.employmentStatus);

    if (this.employmentStatus === 'New Applicant') {
      this.isVisible = false;
      this.confirmVerifier.emit();
    } 
    else if (this.employmentStatus === 'Re-Apply') {
      if (this.LookupField.fname && this.LookupField.lname && this.LookupField.bdate && this.LookupField.number) {
        sessionStorage.setItem('fname', this.LookupField.fname);
        sessionStorage.setItem('lname', this.LookupField.lname);
        sessionStorage.setItem('bdate', this.LookupField.bdate);
        sessionStorage.setItem('number', this.LookupField.number.toString());

        this.isVisible = false;
        this.confirmVerifier.emit();

        this.LookupServices.lookup(this.LookupField).subscribe((data) => {
          this.applicantID = data;

          if (this.applicantID.status === 'found' && this.applicantID.applicant) {
            const a = this.applicantID.applicant;
            sessionStorage.setItem("reapplyID", a.applicant_i_information_id);
            sessionStorage.setItem("applicantID", a.applicant_i_information_id);
            sessionStorage.setItem("firstname", a.firstname || "");
            sessionStorage.setItem("middlename", a.middlename || "");
            sessionStorage.setItem("lastname", a.lastname || "");
            sessionStorage.setItem("applicantName", (a.firstname + ' ' + a.middlename + ' '  + a.lastname) || "");
            sessionStorage.setItem("applicantPosition", a.desiredPosition || "");
            sessionStorage.setItem("email", a.email || "");
            sessionStorage.setItem("civilstatus", a.civilStatus || "");
            sessionStorage.setItem("contactnumber", a.contactnumber || "");
            sessionStorage.setItem("birthdate", a.birthdate || "");
            sessionStorage.setItem("religion", a.religion || "");
            sessionStorage.setItem("province", a.province || "");
            sessionStorage.setItem("cities", a.cities || "");
            sessionStorage.setItem("barangay", a.barangay || "");
            sessionStorage.setItem("zipcode", a.zipcode?.toString() || "");
            sessionStorage.setItem("expectedsalary", a.expectedSalary?.toString() || "");
            sessionStorage.setItem("gender", a.gender || "");
            sessionStorage.setItem("blood_type", a.blood_type || "");
            sessionStorage.setItem("nickname", a.nickname || "");
            sessionStorage.setItem("desiredPosition", a.desiredPosition || "");
            if (a.education) {
              sessionStorage.setItem("college", a.education.college || "");
              sessionStorage.setItem("course", a.education.course || "");
              sessionStorage.setItem("yeargraduate", a.education.yeargraduate?.toString() || "");
              sessionStorage.setItem("graduateschool", a.education.graduateschool?.toString() || "");
              sessionStorage.setItem("boardexam", a.education.boardexam || "");
            }
            if (a.eligibility) {
              sessionStorage.setItem("eligibility", a.eligibility.eligibility || "");
            }
            if (a.marriage) {
              sessionStorage.setItem("partnerReligion", a.marriage.partnerReligion || "");
              sessionStorage.setItem("dateMarried", a.marriage.dateMarried || "");
              sessionStorage.setItem("numberofchildren", a.marriage.numberofchildren?.toString() || "");
              sessionStorage.setItem("guardianofchildren", a.marriage.guardianofchildren || "");
            }
            if (a.work && Array.isArray(a.work)) {
              sessionStorage.setItem("workingList", JSON.stringify(a.work));
              const lastWork = a.work[a.work.length - 1];
              if (lastWork) {
                sessionStorage.setItem("contribution", lastWork.contribution || "");
              }
            }
            if (a.status) {
              sessionStorage.setItem("pendingapplication", a.status.pendingapplication || "");
              sessionStorage.setItem("lockincontract", a.status.lockincontract || "");
              sessionStorage.setItem("motorcycle", a.status.motorcycle || "");
              sessionStorage.setItem("license", a.status.license || "");
              sessionStorage.setItem("technicalSkills", a.status.technicalSkills || "");
              sessionStorage.setItem("question", a.status.question || "");
              sessionStorage.setItem("potfolio_link", a.status.potfolio_link || "");
              sessionStorage.setItem("filename", a.status.filename || "");
              sessionStorage.setItem("file_content", a.status.file_content || "");
            }
            sessionStorage.setItem('step', '3');
            location.reload();
          } 
          else {
            alert("Applicant not found.");
          }
        });
      } else {
        alert('Please complete all fields.');
      }
    }
  }


  reset() {
    this.employmentStatus = '';
    this.LookupField.fname = '';
    this.LookupField.lname = '';
    this.LookupField.bdate = '';
    this.LookupField.number = null;
  }
}
