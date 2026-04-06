export interface SessionData {
  firstname: string,
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

// ============================================
// CONFIGURATION
// ============================================
const GOOGLE_DOC_ID = '1aC44YM_6m5JFm5Fr69k8PvyyNmQoJUT7-SUz9q7xM_M';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============================================
// CACHE VARIABLES
// ============================================
let cachedPromptTemplate: string | null = null;
let cacheTimestamp: number | null = null;

// ============================================
// FETCH PROMPT FROM GOOGLE DOCS
// ============================================
export async function fetchPromptFromGoogleDocs(): Promise<string> {
  try {
    const url = `https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=txt`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prompt: ${response.status}`);
    }
    
    const promptTemplate = await response.text();
    return promptTemplate;
    
  } catch (error) {
    console.error('❌ Error fetching prompt:', error);
    throw error;
  }
}

// ============================================
// GET CACHED PROMPT TEMPLATE
// ============================================
export async function getCachedPromptTemplate(): Promise<string> {
  const now = Date.now();
  
  if (cachedPromptTemplate && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cachedPromptTemplate;
  }
  cachedPromptTemplate = await fetchPromptFromGoogleDocs();
  cacheTimestamp = now;
  
  return cachedPromptTemplate;
}

// ============================================
// BUILD INTERVIEW PROMPT
// ============================================
export function buildInterviewPrompt(
  promptTemplate: string,
  jobRole: string,
  jobQualifications: string[],
  sessionData: SessionData,
  salaryBudget: string
): string {
  
  const getLatestCompany = (): string => {
    if (sessionData.workingList && sessionData.workingList.length > 0) {
      return sessionData.workingList[sessionData.workingList.length - 1]?.companyname || "your most recent company";
    }
    return "your most recent company";
  };

  let finalPrompt = promptTemplate
    .replace(/\[FIRSTNAME\]/g, sessionData.firstname || '')
    .replace(/\[MIDDLENAME\]/g, sessionData.middlename || '')
    .replace(/\[LASTNAME\]/g, sessionData.lastname || '')
    .replace(/\[JOB_ROLE\]/g, jobRole || '')
    .replace(/\[COMPANY_NAME\]/g, getLatestCompany())
    .replace(/\[EMAIL\]/g, sessionData.email || '')
    .replace(/\[CIVIL_STATUS\]/g, sessionData.civilstatus || '')
    .replace(/\[BIRTHDATE\]/g, sessionData.birthdate || '')
    .replace(/\[RELIGION\]/g, sessionData.religion || '')
    .replace(/\[BARANGAY\]/g, sessionData.barangay || '')
    .replace(/\[CITY\]/g, sessionData.cities || '')
    .replace(/\[PROVINCE\]/g, sessionData.province || '')
    .replace(/\[ZIPCODE\]/g, sessionData.zipcode || '')
    .replace(/\[CONTACT_NUMBER\]/g, sessionData.contactnumber || '')
    .replace(/\[EXPECTED_SALARY\]/g, sessionData.expectedsalary || '')
    .replace(/\[ELIGIBILITY\]/g, sessionData.eligibility || '')
    .replace(/\[COLLEGE\]/g, sessionData.college || '')
    .replace(/\[COURSE\]/g, sessionData.course || '')
    .replace(/\[YEAR_GRADUATE\]/g, sessionData.yeargraduate || '')
    .replace(/\[GRADUATE_SCHOOL\]/g, sessionData.graduateschool || 'N/A')
    .replace(/\[BOARD_EXAM\]/g, sessionData.boardexam || '')
    .replace(/\[WORK_LIST\]/g, JSON.stringify(sessionData.workingList || []))
    .replace(/\[LOCKIN_CONTRACT\]/g, sessionData.lockincontract || '')
    .replace(/\[MOTORCYCLE\]/g, sessionData.motorcycle || '')
    .replace(/\[JOB_QUALIFICATIONS\]/g, jobQualifications.join(', '))
    .replace(/\[SALARY_BUDGET\]/g, salaryBudget || '');
  return finalPrompt;
}

export async function getInterviewSystemPrompt(
  jobRole: string,
  jobQualifications: string[],
  sessionData: SessionData,
  salaryBudget: string
): Promise<string> {
  try {
    const promptTemplate = await getCachedPromptTemplate();
    const finalPrompt = buildInterviewPrompt(
      promptTemplate, 
      jobRole, 
      jobQualifications, 
      sessionData, 
      salaryBudget
    );
    return finalPrompt;
  } catch (error) {
    console.error('❌ Failed to load interview prompt:', error);
    throw new Error('Unable to load interview configuration. Please try again later.');
  }
}