export interface SessionData {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  civilstatus: string;
  birthdate: string;
  religion: string;
  barangay: string;
  cities: string;
  province: string;
  zipcode: string;
  contactnumber: string;
  expectedsalary: string;
  eligibility: string;
  college: string;
  course: string;
  yeargraduate: string;
  graduateschool: string;
  boardexam: string;
  workingList: Array<{
    companyname: string;
    position?: string;
    duration?: string;
  }>;
  lockincontract: string;
  motorcycle: string;
}

export function fetchPromptFromGoogleDocs(): Promise<string>;

export function buildInterviewPrompt(
  promptTemplate: string,
  jobRole: string,
  jobQualifications: string[],
  sessionData: SessionData,
  salaryBudget: string
): string;

export function getInterviewSystemPrompt(
  jobRole: string,
  jobQualifications: string[],
  sessionData: SessionData,
  salaryBudget: string
): Promise<string>;

export function getCachedPromptTemplate(): Promise<string>;