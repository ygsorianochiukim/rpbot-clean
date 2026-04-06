import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormSubmission } from '../../Services/form-submission';
import { ActivatedRoute, Router } from '@angular/router';
import { InformationModel } from '../../Model/Information/information.model';
import { Education } from '../../Model/Information/Education/education.model';
import { ApplicationStatus } from '../../Model/Information/ApplicationStatus/application-status.model';
import { Eligibility } from '../../Model/Information/Eligibility/eligibility.model';
import { Marriage } from '../../Model/Information/Marriage/marriage.model';
import { WorkExperience } from '../../Model/Information/WorkExperience/work-experience.model';
import { Wpm } from '../../Model/wpm/wpm';
import { IqModel } from '../../Model/iq/iq';
import { Conversation } from '../../Model/Conversation/conversation';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule , SquarePen , CircleFadingPlus, CircleX , PlusCircle } from 'lucide-angular';
import { PortfolioModel } from '../../Model/Information/Porfolio/portfolio.model';

@Component({
  selector: 'app-reaply',
  imports: [CommonModule, FormsModule, HttpClientModule , LucideAngularModule],
  templateUrl: './reaply.html',
  styleUrl: './reaply.scss',
  providers: [FormSubmission]
})
export class Reaply implements OnInit {
  readonly editPen = SquarePen;
  readonly addWork = CircleFadingPlus;
  readonly CircleX = CircleX;
  readonly PlusCircle = PlusCircle;
  applicant?: InformationModel;
  education?: Education;
  status?: ApplicationStatus;
  eligibility?: Eligibility;
  marriage?: Marriage;
  wpm?: Wpm;
  iq?: IqModel;
  fromDate!: string;
  toDate!: string; 
  conversation?: Conversation;
  workingList: WorkExperience[] = [];
  applicantID: number| null = null;
  EligibilityModal: boolean = false;
  TechnocalSkillsVisible: boolean = false;
  WorkModal: boolean = false;
  MarriageModal: boolean = false;
  EducationModal: boolean = false;
  StatusModal: boolean = false;
  PortfolioModal: boolean = false;
  modifyWorkExperience: boolean = false;
  eligibilityID: number | null = null;
  marriageID: number | null = null;
  workingID: number | null = null;
  EducationID: number | null = null;
  StatusID: number | null = null;
  loading = true;
  otherEligibility: string = '';
  OthersField: boolean = false;
  WorkingInformation: WorkExperience = {
    applicant_i_information_id:0,
    previouscompensation: 0,
    companyname: '',
    workduration: '',
    reasonforleaving: '',
    position: '',
    contribution: '',
  }
  portfolioFields: PortfolioModel = {
    potfolio_link: '',
    filename: '',
    file_content: '',
  }
  eligibilityOptions = {
    cs: false,
    let: false,
    board: false,
    none: false,
    others: false
  };
  eligibilityField: Eligibility = {
    eligibility_i_id: 0,
    eligibility: '',
  }
  EducationalField: Education ={
    college: '',
    course: '',
    yeargraduate: 0,
    graduateschool: 0,
    boardexam: '',
  };
  ApplicationStatusField: ApplicationStatus ={
    pendingapplication: '',
    lockincontract: '',
    motorcycle: '',
    license: '',
    technicalSkills: '',
    question: '',
    potfolio_link: '',
    filename: '',
    file_content: '',
  }
  MarriageField: Marriage = {
    partnerReligion: '',
    dateMarried: '',
    child: '',
    numberofchildren: null,
    ageofchildren: '' ,
    guardianofchildren: '',
  };
  work?: WorkExperience[] = [];
  eligibilityList: Eligibility = {};
  educationList: Education = {};
  MarriageList: Marriage = {};
  applicationStatusList: ApplicationStatus = {};
  selectedFile: File | null = null;
  technicalOptionKeys: string[] = [];
  otherSkillText: string = '';
  technicalOptions: { [key: string]: boolean } = {
    'AUTOCAD': false,
    'SKETCH UP': false,
    'LUMION': false,
    'APPSHEET': false,
    'Welder': false,
    'Mason': false,
    'Painter': false,
    'Skimcoat': false,
    'Automotive': false,
    'Plumber': false,
    'linux server': false,
    'Technical': false,
    'Tile Setter': false,
    'Electrician': false,
    'Carpenter': false,
    'Estimator': false,
    'Survey': false,
    'Total Station': false,
    'Other': false
  };

  constructor(private router: Router, private formService: FormSubmission, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.applicantID =  Number(this.route.snapshot.paramMap.get('id')) || 0
    this.technicalOptionKeys = Object.keys(this.technicalOptions);
    this.displayWorkExperience();
    this.displayEligibility();
    this.displayEducation();
    this.displayApplicationStatus();
    this.displayMarriage();
    forkJoin({
      applicant: this.formService.displayApplicantInfo(this.applicantID),
      education: this.formService.displayApplicantEducationInfo(this.applicantID),
      status: this.formService.displayApplicationStatusInfo(this.applicantID),
      eligibility: this.formService.displayApplicantEligibilityInfo(this.applicantID),
      marriage: this.formService.displayApplicantMarriageInfo(this.applicantID),
      work: this.formService.displayApplicantExperienceInfoAll(this.applicantID),
      wpm: this.formService.displayWpmInfo(this.applicantID),
      iq: this.formService.displayIqInfo(this.applicantID),
      conversation: this.formService.displayConversationInfo(this.applicantID)
    }).subscribe({
      next: (res) => {
        this.applicant = res.applicant;
        this.education = res.education;
        this.status = res.status;
        this.eligibility = res.eligibility;
        this.marriage = res.marriage;
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
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  getSelectedTechnicalSkills(): string {
    const selected: string[] = [];
    for (const key in this.technicalOptions) {
      if (this.technicalOptions[key] && key !== 'Other') {
        selected.push(key);
      }
    }
    if (this.technicalOptions['Other'] && this.otherSkillText.trim()) {
      selected.push(this.otherSkillText.trim());
    }
    this.ApplicationStatusField.technicalSkills = selected.join(", ");
    return this.ApplicationStatusField.technicalSkills;
  }

  selectTechnicalSkills() {
    this.getSelectedTechnicalSkills();
    this.TechnocalSkillsVisible = false;
  }
  otherSelected(){
    if (this.OthersField) {
      this.OthersField = false;
    }
    else{
      this.OthersField = true;
    }
  }
  calculateDuration() {
    if (this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);

      if (to < from) {
        this.WorkingInformation.workduration = 'Invalid dates';
        return;
      }
      let months = (to.getFullYear() - from.getFullYear()) * 12;
      months -= from.getMonth();
      months += to.getMonth();
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      this.WorkingInformation.workduration = `${years > 0 ? years + ' yr(s) ' : ''}${remainingMonths} mo(s)`;
    } else {
      this.WorkingInformation.workduration = '';
    }
  }
  downloadFile(filename: string, base64Data: string) {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';

    switch (fileExtension) {
      case 'pdf': mimeType = 'application/pdf'; break;
      case 'jpg':
      case 'jpeg': mimeType = 'image/jpeg'; break;
      case 'png': mimeType = 'image/png'; break;
      case 'doc': mimeType = 'application/msword'; break;
      case 'docx': mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(link.href);
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }
  selectEligibility() {
    const selected: string[] = [];

    if (this.eligibilityOptions.cs) selected.push("CS Passer");
    if (this.eligibilityOptions.let) selected.push("LET Passer");
    if (this.eligibilityOptions.board) selected.push("Board Exam Passer");
    if (this.eligibilityOptions.none) selected.push("None");
    if (this.eligibilityOptions.others && this.otherEligibility) {
      selected.push(this.otherEligibility);
    }
    this.eligibilityField.eligibility = selected.join(", ");
    sessionStorage.setItem('eligibility', JSON.stringify(selected));
    this.formService.updateEligibility(this.eligibilityID! , this.eligibilityField).subscribe(() => {
      this.EligibilityModal = false;
      this.displayEligibility();
    });
  }

  addWorkExperience(){
    this.WorkModal = true;
  }
  closeWorking(){
    this.WorkModal = false;
    this.modifyWorkExperience = false;
  }
  modifyWork(work_i_information_id : number){
    if (work_i_information_id) {
      this.workingID = work_i_information_id;
      this.modifyWorkExperience = true;
    }
  }
  modifyEducation(){
    sessionStorage.setItem('college', this.EducationalField.college!);
    sessionStorage.setItem('course',  this.EducationalField.course!);
    sessionStorage.setItem('yeargraduate',  this.EducationalField.yeargraduate?.toString()!);
    sessionStorage.setItem('graduateschool',  this.EducationalField.graduateschool?.toString()!);
    sessionStorage.setItem('boardexam',  this.EducationalField.boardexam!);
    this.formService.updateEducation(this.EducationID! , this.EducationalField).subscribe(() => {
      this.EducationModal = false;
      this.displayEducation();
      this.cdr.detectChanges();
    });
  }
  updateStatusApplication(){
    this.formService.updateStatus(this.StatusID! , this.ApplicationStatusField).subscribe(() => {
      this.StatusModal = false;
      this.displayApplicationStatus();
      this.cdr.detectChanges();
    });
  }
  modifyMarriage(){
    sessionStorage.setItem('partnerReligion', this.MarriageField.partnerReligion!);
    sessionStorage.setItem('dateMarried', this.MarriageField.dateMarried!);
    sessionStorage.setItem('child', this.MarriageField.child!);
    sessionStorage.setItem('numberofchildren', this.MarriageField.numberofchildren?.toString()!);
    sessionStorage.setItem('ageofchildren', this.MarriageField.ageofchildren!);
    sessionStorage.setItem('guardianofchildren', this.MarriageField.guardianofchildren!);
    this.formService.updateMarriage(this.marriageID! , this.MarriageField).subscribe(() => {
      this.MarriageModal = false;
    });
  }
  displayApplicationStatus(){
    this.formService.displayApplicationStatusInfo(this.applicantID!).subscribe((data) => {
      this.applicationStatusList = data;
      this.ApplicationStatusField.license = this.applicationStatusList.license;
      this.ApplicationStatusField.lockincontract = this.applicationStatusList.lockincontract;
      this.ApplicationStatusField.motorcycle = this.applicationStatusList.motorcycle;
      this.ApplicationStatusField.pendingapplication = this.applicationStatusList.pendingapplication;
      this.ApplicationStatusField.question = this.applicationStatusList.question;
      this.ApplicationStatusField.technicalSkills = this.applicationStatusList.technicalSkills;
      this.ApplicationStatusField.file_content = this.applicationStatusList.file_content;
      this.ApplicationStatusField.filename = this.applicationStatusList.filename;
      this.ApplicationStatusField.potfolio_link = this.applicationStatusList.potfolio_link;
    })
  }
  displayWorkExperience(){
    this.formService.displayApplicantExperienceInfoAll(this.applicantID!).subscribe((data) => {
      this.work = data;
    })
  }
  displayEligibility(){
    this.formService.displayApplicantEligibilityInfo(this.applicantID!).subscribe((data) => {
      this.eligibilityList = data;
    })
  }
  displayMarriage(){
    this.formService.displayApplicantMarriageInfo(this.applicantID!).subscribe((data) => {
      this.MarriageList = data;
      this.MarriageField.partnerReligion = this.MarriageList.partnerReligion;
      this.MarriageField.ageofchildren = this.MarriageList.ageofchildren;
      this.MarriageField.child = this.MarriageList.child;
      this.MarriageField.dateMarried = this.MarriageList.dateMarried;
      this.MarriageField.guardianofchildren = this.MarriageList.guardianofchildren;
      this.MarriageField.numberofchildren = this.MarriageList.numberofchildren;
    })
  }
  displayEducation(){
    this.formService.displayApplicantEducationInfo(this.applicantID!).subscribe((data) => {
      this.educationList = data;
      this.EducationalField.college = this.educationList.college;
      this.EducationalField.course = this.educationList.course;
      this.EducationalField.yeargraduate = this.educationList.yeargraduate;
      this.EducationalField.graduateschool = this.educationList.graduateschool;
      this.EducationalField.boardexam = this.educationList.boardexam;
    })
  }
  
  UpdateFormExperience(){
    this.formService.updateWorkExperience(this.workingID!, this.WorkingInformation).subscribe(() => {
      this.modifyWorkExperience = false;
      this.displayWorkExperience();
      this.cdr.detectChanges();
    });
  }
  async updatePotfolio() {
    if (this.selectedFile) {
      const base64String = await this.convertFileToBase64(this.selectedFile);
      this.portfolioFields.filename = this.selectedFile.name;
      this.portfolioFields.file_content = base64String;
    }
    this.formService.updatePorfolio(this.StatusID!, this.portfolioFields).subscribe({
      next: () => {
        this.PortfolioModal = false;
        this.displayApplicationStatus();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Portfolio update failed:', err);
      }
    });
  }


  updateEligibility(eligibility_i_id: number){
    if (eligibility_i_id) {
      this.eligibilityID = eligibility_i_id;
      this.EligibilityModal=true;
    }
  }
  updateMarriage(marriage_i_information_id: number){
    if (marriage_i_information_id) {
      this.marriageID = marriage_i_information_id;
      this.MarriageModal=true;
    }
  }
  updateStatus(applicant_i_status_id: number){
    if (applicant_i_status_id) {
      this.StatusID = applicant_i_status_id;
      this.StatusModal = true;
    }
  }
  updateEducation(education_i_information_id: number){
    if (education_i_information_id) {
      this.EducationModal = true;
      this.EducationID = education_i_information_id;
    }
  }
  updatePortfolio(applicant_i_status_id: number){
    if (applicant_i_status_id) {
      this.PortfolioModal = true;
      this.StatusID = applicant_i_status_id;
    }
  }
  closeEligibility(){
    this.EligibilityModal = false;
  }
  closeEducation(){
    this.EducationModal = false;
  }
  closeMarriage(){
    this.MarriageModal = false;
  }
  closeStatus(){
    this.StatusModal = false;
  }
  closePortfolio(){
    this.PortfolioModal = false;
  }
  continueInterview(){
    this.router.navigate(['/home']);
  }
  workingExperience(){
    this.WorkingInformation.applicant_i_information_id = this.applicantID!;
    sessionStorage.setItem('workingList', JSON.stringify(this.work));
    this.formService.storeExperience(this.WorkingInformation).subscribe(() => {
      this.WorkModal = false;
      this.displayWorkExperience();
      this.cdr.detectChanges();
    });
  }
  openTechnicalSkills(){
    this.TechnocalSkillsVisible = true;
  }

}
