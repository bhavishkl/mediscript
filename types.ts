export interface InvestigationEntry {
  id: string;
  date: string;
  category: string;
  name: string;
  result: string;
}

export interface TreatmentEntry {
  id: string;
  name: string;
  dosage: string;
}

export interface DischargeData {
  hospitalName: string;
  logoBase64: string | null;
  patientName: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  ipNo: string;
  admissionDate: string;
  dischargeDate: string;
  finalDiagnosis: string;
  clinicalPresentation: string;
  investigations: InvestigationEntry[];
  treatmentGiven: TreatmentEntry[];
  hospitalCourse: string;
  dischargeAdvice: string;
  followUp: string;
  dischargeAgainstMedicalAdvice: boolean;
}

export const INITIAL_DATA: DischargeData = {
  hospitalName: 'ATHARVA CHEST HOSPITAL',
  logoBase64: null,
  patientName: '',
  age: '',
  gender: '',
  ipNo: '',
  admissionDate: new Date().toISOString().split('T')[0],
  dischargeDate: new Date().toISOString().split('T')[0],
  finalDiagnosis: '',
  clinicalPresentation: '',
  investigations: [],
  treatmentGiven: [],
  hospitalCourse: '',
  dischargeAdvice: '',
  followUp: '',
  dischargeAgainstMedicalAdvice: false
};