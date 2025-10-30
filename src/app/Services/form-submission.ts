import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { InformationModel } from '../Model/Information/information.model';
import { Observable } from 'rxjs';
import { ApplicationStatus } from '../Model/Information/ApplicationStatus/application-status.model';
import { Education } from '../Model/Information/Education/education.model';
import { Eligibility } from '../Model/Information/Eligibility/eligibility.model';
import { Marriage } from '../Model/Information/Marriage/marriage.model';
import { WorkExperience } from '../Model/Information/WorkExperience/work-experience.model';
import { Wpm } from '../Model/wpm/wpm';
import { IqModel } from '../Model/iq/iq';
import { Conversation } from '../Model/Conversation/conversation';
import { Lookup } from '../Model/Lookup/lookup.model';
import { PortfolioModel } from '../Model/Information/Porfolio/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class FormSubmission {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient){}

  displayApplicant():Observable<InformationModel[]>{
    return this.http.get<InformationModel[]>(`${this.apiUrl}applicant`)
  }

  displayApplicantEducation():Observable<Education[]>{
    return this.http.get<Education[]>(`${this.apiUrl}applicantEducation`)
  }

  displayApplicantionStatus():Observable<ApplicationStatus[]>{
    return this.http.get<ApplicationStatus[]>(`${this.apiUrl}applicantionStatus`)
  }

  displayApplicantEligibility():Observable<Eligibility[]>{
    return this.http.get<Eligibility[]>(`${this.apiUrl}applicantEligibility`)
  }

  displayApplicantMarriage():Observable<Marriage[]>{
    return this.http.get<Marriage[]>(`${this.apiUrl}applicantMarriage`)
  }

  displayApplicantExperience():Observable<WorkExperience[]>{
    return this.http.get<WorkExperience[]>(`${this.apiUrl}applicantExperience`)
  }

  storeInformation(post: InformationModel):Observable<InformationModel>{
    return this.http.post<InformationModel>(`${this.apiUrl}applicant`, post)
  }

  storeApplicantEducation(post: Education):Observable<Education>{
    return this.http.post<Education>(`${this.apiUrl}applicantEducation`, post)
  }

  storeApplicationStatus(post: ApplicationStatus):Observable<ApplicationStatus>{
    return this.http.post<ApplicationStatus>(`${this.apiUrl}applicantionStatus`, post)
  }

  storeEligibility(post: Eligibility):Observable<Eligibility>{
    return this.http.post<Eligibility>(`${this.apiUrl}applicantEligibility`, post)
  }

  storeMarriageInformation(post: Marriage):Observable<Marriage>{
    return this.http.post<Marriage>(`${this.apiUrl}applicantMarriage`, post)
  }

  storeExperience(post: WorkExperience):Observable<WorkExperience>{
    return this.http.post<WorkExperience>(`${this.apiUrl}applicantExperience`, post)
  }

  storeWpm(post: Wpm):Observable<Wpm>{
    return this.http.post<Wpm>(`${this.apiUrl}wpm`, post)
  }

  storeIq(post: IqModel):Observable<IqModel>{
    return this.http.post<IqModel>(`${this.apiUrl}IQ`, post)
  }

  StoreMesssage(post: Conversation):Observable<Conversation>{
    return this.http.post<Conversation>(`${this.apiUrl}conversations`, post)
  }

  lookup(post: Lookup):Observable<Lookup>{
    return this.http.post<Lookup>(`${this.apiUrl}applicant/lookup`, post)
  }

  displayApplicantInfo(id: number):Observable<InformationModel>{
    return this.http.get<InformationModel>(`${this.apiUrl}applicant/${id}`);
  }

  displayApplicantEducationInfo(id: number):Observable<Education>{
    return this.http.get<Education>(`${this.apiUrl}applicantEducation/${id}`);
  }

  displayApplicationStatusInfo(id: number):Observable<ApplicationStatus>{
    return this.http.get<ApplicationStatus>(`${this.apiUrl}applicationStatus/${id}`);
  }

  displayApplicantEligibilityInfo(id: number):Observable<Eligibility>{
    return this.http.get<Eligibility>(`${this.apiUrl}eligibility/${id}`);
  }

  displayApplicantMarriageInfo(id: number):Observable<Marriage>{
    return this.http.get<Marriage>(`${this.apiUrl}marriage/${id}`);
  }

  displayApplicantExperienceInfo(id: number):Observable<WorkExperience>{
    return this.http.get<WorkExperience>(`${this.apiUrl}workExperience/${id}`);
  }

  displayApplicantExperienceInfoAll(id: number):Observable<WorkExperience[]>{
    return this.http.get<WorkExperience[]>(`${this.apiUrl}workExperienceall/${id}`);
  }

  displayWpmInfo(id: number):Observable<Wpm>{
    return this.http.get<Wpm>(`${this.apiUrl}wpm/${id}`);
  }

  displayIqInfo(id: number):Observable<IqModel>{
    return this.http.get<IqModel>(`${this.apiUrl}iq/${id}`);
  }

  displayConversationInfo(id: number):Observable<Conversation>{
    return this.http.get<Conversation>(`${this.apiUrl}conversations/${id}`);
  }

  updateWorkExperience(id: number, data: WorkExperience): Observable<WorkExperience> {
    return this.http.put(`${this.apiUrl}applicantExperience/update/${id}`, data);
  }
  
  updateEligibility(id: number, data: Eligibility): Observable<Eligibility> {
    return this.http.put(`${this.apiUrl}applicantEligibility/update/${id}`, data);
  }
  updateEducation(id: number, data: Education): Observable<Education> {
    return this.http.put(`${this.apiUrl}applicantEducation/update/${id}`, data);
  }
  updateStatus(id: number, data: ApplicationStatus): Observable<ApplicationStatus> {
    return this.http.put(`${this.apiUrl}applicantionStatus/update/${id}`, data);
  }
  updatePorfolio(id: number, data: PortfolioModel): Observable<PortfolioModel> {
    return this.http.put(`${this.apiUrl}applicantionStatus/updateportfolio/${id}`, data);
  }
  updateMarriage(id: number, data: Marriage): Observable<Marriage> {
    return this.http.put(`${this.apiUrl}applicantMarriage/update/${id}`, data);
  }
}
