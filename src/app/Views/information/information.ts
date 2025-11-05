import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule , ChevronLeft , CircleX , PlusCircle } from 'lucide-angular';
import { AddressServices } from '../../Services/Address/address';
import { CitiesModel } from '../../Model/Address/cities/cities.model';
import { InformationModel } from '../../Model/Information/information.model';
import { Eligibility } from '../../Model/Information/Eligibility/eligibility.model';
import { Education } from '../../Model/Information/Education/education.model';
import { Marriage } from '../../Model/Information/Marriage/marriage.model';
import { WorkExperience } from '../../Model/Information/WorkExperience/work-experience.model';
import { ApplicationStatus } from '../../Model/Information/ApplicationStatus/application-status.model';
import { FormSubmission } from '../../Services/form-submission';
import { AnyARecord } from 'dns';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule, LoaderComponent],
  templateUrl: './information.html',
  styleUrls: ['./information.scss'],
  providers: [AddressServices, FormSubmission]
})
export class Information implements OnInit {
  readonly back = ChevronLeft;
  readonly close = CircleX;
  readonly PlusCircle = PlusCircle;
  OthersField: boolean = false;
  selectedFile: File | null = null;
  eligibilityVisible: boolean = false;
  TechnocalSkillsVisible: boolean = false;
  activeLoader: boolean = false;
  collegeGraduate: boolean = false;
  collegeSelectorValue: boolean = true;
  marriage: boolean = false;
  marriageValue: boolean = false;
  displayForm: number = 0;
  informationID: number = 0;
  WorkExperienceFieldStatus: boolean = false;
  workingList: WorkExperience[] = [];
  educationalBackground: Education[] = [];
  marriageInformation: Marriage[] = [];
  middleNameNA: boolean = false;
  datastored:boolean = true;
  fromDate!: string;
  toDate!: string; 
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
  eligibilityOptions = {
    cs: false,
    let: false,
    board: false,
    none: false,
    others: false
  };
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
  
  technicalOptionKeys: string[] = [];
  otherSkillText: string = '';
  applicantinformation: InformationModel ={
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    civilStatus: '---Select Status---',
    contactnumber: '',
    birthdate: '',
    religion: '',
    province: '',
    cities: '',
    barangay: '',
    zipcode: 0,
    expectedSalary: 0,
    positionSelected: '',
    applicantName: '',
    blood_type: '',
    gender: '',
    nickname: '',
    desiredPosition: '',
  };
  WorkingInformation: WorkExperience ={
    previouscompensation: 0,
    companyname: '',
    workduration: '',
    reasonforleaving: '',
    position: '',
    contribution: '',
  }
  EducationalField: Education ={
    college: '',
    course: '',
    yeargraduate: 0,
    graduateschool: 0,
    boardexam: '',
  };
  MarriageField: Marriage = {
    partnerReligion: '',
    dateMarried: '',
    child: '',
    numberofchildren: 0,
    ageofchildren: '' ,
    guardianofchildren: '',
  };
  eligibilityField: Eligibility={
    eligibility: '',
  }
  displayAddress: any[] = [];
  displayCity: any[] = [];
  displayBarangay: any[] = [];

  provinceField: any;
  municipalityField: any;
  barangayField: any;

  otherEligibility: string = '';
  constructor(private AddressServices: AddressServices , private InformationServices: FormSubmission) {}

  async ngOnInit(): Promise<void> {
    this.technicalOptionKeys = Object.keys(this.technicalOptions);
    const savedForm = sessionStorage.getItem('form');
    this.displayForm = savedForm ? parseInt(savedForm, 10) : 1;
    sessionStorage.setItem('form', this.displayForm.toString());
    this.displayProvince();
    
  }
  toggleMiddleNameNA() {
    if (this.middleNameNA) {
      this.applicantinformation.middlename = 'N/A';
    } else {
      this.applicantinformation.middlename = '';
    }
  }
  collegeSelector(){
    if(this.collegeSelectorValue == false){
      this.collegeGraduate = false;
    }
    else{
      this.collegeGraduate = true;
    }
  }
  openTechnicalSkills(){
    this.TechnocalSkillsVisible = true;
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

  openEligibility(){
    this.eligibilityVisible = true;
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
    this.eligibilityVisible = false;
  }
  marriageSelector(){
    if(this.marriageValue == false){
      this.marriage = false;
    }
    else{
      this.marriage= true;
    }
  }
  previousForm(){
    this.displayForm--
    sessionStorage.setItem('form', this.displayForm.toString());
  }
  displayProvince(){
    this.AddressServices.displayProvinces().subscribe((data) => {
      this.displayAddress = data;
    });
  }
  selected() {
    this.activeLoader = true;
    this.AddressServices.displayCities(this.provinceField.name)
      .pipe(finalize(() => this.activeLoader = false))
      .subscribe({
        next: (data) => this.displayCity = data,
        error: (err) => console.error(err)
      });
  }

  citiesSelected() {
    this.activeLoader = true;
    this.AddressServices.displayBarangay(this.provinceField.name, this.municipalityField.name)
      .pipe(finalize(() => this.activeLoader = false))
      .subscribe({
        next: (data) => this.displayBarangay = data,
        error: (err) => console.error(err)
      });
  }

  nextStep() {
    this.displayForm++;
    sessionStorage.setItem('form', this.displayForm.toString());
  }
  openExperience(){
    this.WorkExperienceFieldStatus = true;
  }
  closeExperience(){
    this.WorkExperienceFieldStatus = false;
  }
  submitInformation() {

    if (this.provinceField) this.applicantinformation.province = this.provinceField.name;
    if (this.municipalityField) this.applicantinformation.cities = this.municipalityField.name;
    if (this.barangayField) this.applicantinformation.barangay = this.barangayField.name;
    const requiredFields = [
      'firstname', 'middlename', 'lastname', 'email', 'civilStatus', 
      'contactnumber', 'birthdate', 'religion', 'province', 
      'cities', 'barangay', 'positionSelected'
    ];
    for (const field of requiredFields) {
      if (!this.applicantinformation[field as keyof typeof this.applicantinformation]) {
        alert(`Please fill in your ${field}.`);
        return;
      }
    }
    this.displayForm++;
    sessionStorage.setItem('form', this.displayForm.toString());
    this.applicantinformation.applicantName = `${this.applicantinformation.firstname} ${this.applicantinformation.middlename} ${this.applicantinformation.lastname}`;
    sessionStorage.setItem('applicantPosition', this.applicantinformation.positionSelected!);
    sessionStorage.setItem('applicantName', this.applicantinformation.applicantName!);
    sessionStorage.setItem('firstname', this.applicantinformation.firstname!);
    sessionStorage.setItem('middlename', this.applicantinformation.middlename!);
    sessionStorage.setItem('lastname', this.applicantinformation.lastname!);
    sessionStorage.setItem('email', this.applicantinformation.email!);
    sessionStorage.setItem('civilstatus', this.applicantinformation.civilStatus!);
    sessionStorage.setItem('contactnumber', this.applicantinformation.contactnumber!);
    sessionStorage.setItem('birthdate', this.applicantinformation.birthdate!);
    sessionStorage.setItem('religion', this.applicantinformation.religion!);
    sessionStorage.setItem('province', this.applicantinformation.province!);
    sessionStorage.setItem('cities', this.applicantinformation.cities!);
    sessionStorage.setItem('barangay', this.applicantinformation.barangay!);
    sessionStorage.setItem('desiredPosition', this.applicantinformation.desiredPosition!);
    sessionStorage.setItem('zipcode', this.applicantinformation.zipcode?.toString() ?? '');
    sessionStorage.setItem('expectedsalary', this.applicantinformation.expectedSalary?.toString() ?? '');
    
    sessionStorage.setItem('blood_type', this.applicantinformation.blood_type?.toString() ?? '');
    sessionStorage.setItem('gender', this.applicantinformation.gender?.toString() ?? '');
    sessionStorage.setItem('nickname', this.applicantinformation.nickname?.toString() ?? '');

    alert('Information submitted successfully!');
  }

  workingExperience() {
    this.workingList.push({ ...this.WorkingInformation });
    sessionStorage.setItem('workingList', JSON.stringify(this.workingList));
    this.WorkExperienceFieldStatus = false;
  }
  EducationalInformation(){
    sessionStorage.setItem('college', this.EducationalField.college!);
    sessionStorage.setItem('course',  this.EducationalField.course!);
    sessionStorage.setItem('yeargraduate',  this.EducationalField.yeargraduate?.toString()!);
    sessionStorage.setItem('graduateschool',  this.EducationalField.graduateschool?.toString()!);
    sessionStorage.setItem('boardexam',  this.EducationalField.boardexam!);
  }
  MarriageInformation(){
    sessionStorage.setItem('partnerReligion', this.MarriageField.partnerReligion!);
    sessionStorage.setItem('dateMarried', this.MarriageField.dateMarried!);
    sessionStorage.setItem('child', this.MarriageField.child!);
    sessionStorage.setItem('numberofchildren', this.MarriageField.numberofchildren?.toString()!);
    sessionStorage.setItem('ageofchildren', this.MarriageField.ageofchildren!);
    sessionStorage.setItem('guardianofchildren', this.MarriageField.guardianofchildren!);
  }
  addEligibility() {
    const selected: string[] = [];
    if (this.eligibilityOptions.cs) selected.push('CS Passer');
    if (this.eligibilityOptions.let) selected.push('LET Passer');
    if (this.eligibilityOptions.board) selected.push('Board Exam Passer');
    if (this.eligibilityOptions.none) selected.push('None');
    if (this.otherEligibility && this.otherEligibility.trim() !== '') {
      selected.push(this.otherEligibility.trim());
    }
    if (selected.length === 0) {
      alert('Please select at least one eligibility.');
      return;
    }
    sessionStorage.setItem('eligibility', JSON.stringify(selected));
    this.displayForm++;
    sessionStorage.setItem('form', this.displayForm.toString());
  }

  applicationStatusInformation(){
    sessionStorage.setItem('pendingapplication', this.ApplicationStatusField.pendingapplication!);
    sessionStorage.setItem('lockincontract', this.ApplicationStatusField.lockincontract!);
    sessionStorage.setItem('motorcycle', this.ApplicationStatusField.motorcycle!);
    sessionStorage.setItem('license', this.ApplicationStatusField.license!);
  }
  applicationConfirmation() {
    if (confirm("Are you sure you want to save this information?")) {
      this.applicationConfirmationField();
    } else {
      alert("Save cancelled.");
    }
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // remove metadata
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
  applicationConfirmationField() {
    sessionStorage.setItem('question', this.ApplicationStatusField.question!);
    sessionStorage.setItem('technicalSkills', this.ApplicationStatusField.technicalSkills!);
    const applicant: InformationModel = {
      firstname: sessionStorage.getItem('firstname') || '',
      middlename: sessionStorage.getItem('middlename') || '',
      lastname: sessionStorage.getItem('lastname') || '',
      email: sessionStorage.getItem('email') || '',
      civilStatus: sessionStorage.getItem('civilstatus') || '',
      contactnumber: sessionStorage.getItem('contactnumber') || '',
      birthdate: sessionStorage.getItem('birthdate') || '',
      religion: sessionStorage.getItem('religion') || '',
      province: sessionStorage.getItem('province') || '',
      desiredPosition: sessionStorage.getItem('applicantPosition') || '',
      cities: sessionStorage.getItem('cities') || '',
      barangay: sessionStorage.getItem('barangay') || '',
      zipcode: Number(sessionStorage.getItem('zipcode')) || 0,
      expectedSalary: Number(sessionStorage.getItem('expectedsalary')) || 0,
      positionSelected: sessionStorage.getItem('applicantPosition') || '',
      applicantName: sessionStorage.getItem('applicantName') || '',


      blood_type: sessionStorage.getItem('blood_type') || '',
      gender: sessionStorage.getItem('gender') || '',
      nickname: sessionStorage.getItem('nickname') || '',
    };

    const eligibility: Eligibility = {
      eligibility: sessionStorage.getItem('eligibility') || '',
    };

    const education: Education = {
      college: sessionStorage.getItem('college') || '',
      course: sessionStorage.getItem('course') || '',
      yeargraduate: Number(sessionStorage.getItem('yeargraduate')) || 0,
      graduateschool: Number(sessionStorage.getItem('graduateschool')) || 0,
      boardexam: sessionStorage.getItem('boardexam') || '',
    };

    const marriage: Marriage = {
      partnerReligion: sessionStorage.getItem('partnerReligion') || '',
      dateMarried: sessionStorage.getItem('dateMarried') || '',
      child: sessionStorage.getItem('child') || '',
      numberofchildren: Number(sessionStorage.getItem('numberofchildren')) || 0,
      ageofchildren: sessionStorage.getItem('ageofchildren') || '',
      guardianofchildren: sessionStorage.getItem('guardianofchildren') || '',
    };

    const workingList: WorkExperience[] = JSON.parse(sessionStorage.getItem('workingList') || '[]');

    const applicationStatus: ApplicationStatus = {
      pendingapplication: sessionStorage.getItem('pendingapplication') || '',
      lockincontract: sessionStorage.getItem('lockincontract') || '',
      motorcycle: sessionStorage.getItem('motorcycle') || '',
      license: sessionStorage.getItem('license') || '',
      technicalSkills: sessionStorage.getItem('technicalSkills') || '',
      question: sessionStorage.getItem('question') || '',
    };
    this.InformationServices.storeInformation(applicant).subscribe((info: any) => {
      const infoId = info[1].applicant_i_information_id;
      sessionStorage.setItem('applicantID', infoId.toString())
      eligibility.applicant_i_information_id = infoId;
      education.applicant_i_information_id = infoId;
      marriage.applicant_i_information_id = infoId;
      applicationStatus.applicant_i_information_id = infoId;
      workingList.forEach(w => w.applicant_i_information_id = infoId);

      this.InformationServices.storeEligibility(eligibility).subscribe();
      this.InformationServices.storeApplicantEducation(education).subscribe();
      this.InformationServices.storeMarriageInformation(marriage).subscribe();
      if (this.selectedFile) {
        this.convertFileToBase64(this.selectedFile).then((base64String) => {
          applicationStatus.filename = this.selectedFile!.name;
          applicationStatus.file_content = base64String;
          sessionStorage.setItem('file_name' , applicationStatus.filename);

          this.InformationServices.storeApplicationStatus(applicationStatus).subscribe();
        });
      } else if (this.ApplicationStatusField.potfolio_link) {
        applicationStatus.potfolio_link = this.ApplicationStatusField.potfolio_link;
        sessionStorage.setItem('file_name' , applicationStatus.potfolio_link);
        this.InformationServices.storeApplicationStatus(applicationStatus).subscribe();
      } else {
        this.InformationServices.storeApplicationStatus(applicationStatus).subscribe();
      }

      workingList.forEach(work =>
        this.InformationServices.storeExperience(work).subscribe()
      );
    });
    sessionStorage.setItem('DataStored', 'true');
    this.datastored = false;
  }

}
