import { Routes } from '@angular/router';
import { Home } from './Views/home/home';
import { Panel } from './Views/panel/panel';
import { Typing } from './Views/Typing/typing';
import { IqtestComponent } from './Views/IQtest/iqtest';
import { Interviewevaluation } from './Views/interviewevaluation/interviewevaluation';
import { InterviewComplete } from './Views/interview-complete/interview-complete';
import { ApplicantPreview } from './Views/applicant-preview/applicant-preview';
import { Reaply } from './Views/reaply/reaply';

export const routes: Routes = [
    {path:'',redirectTo: 'home', pathMatch: 'full'},
    {path:'home', component: Panel},
    {path:'typingTest', component: Typing},
    {path:'iqtest', component: IqtestComponent},
    {path:'evaluation', component: Interviewevaluation},
    {path:'complete', component: InterviewComplete},
    {path:'voiceInterview', component: InterviewComplete},
    {path:'applicantPreview/:id', component: ApplicantPreview},
    {path:'previewInformation/:id', component: Reaply},
];
