
export enum EmploymentType {
  REGULAR = 'Regular',
  PROBATIONARY = 'Probationary',
  PART_TIME = 'Part-time'
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum FormType {
  LEAVE = 'Leave Management Form',
  BUSINESS_TRIP = 'Official Business Trip Form',
  OVERTIME = 'Overtime Form',
  ATTENDANCE = 'Attendance Regularization Form',
  LETTER = 'Letter Request Form'
}

export interface EmployeeProfile {
  employeeId: string;
  name: string;
  employmentType: EmploymentType;
  department: string;
  team: string;
  position: string;
  username: string;
  password?: string;
  gender: 'Male' | 'Female';
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Annulled';
  soloParent: 'Yes' | 'No';
}

export interface BaseRequest {
  id: string;
  employeeId: string;
  formType: FormType;
  status: RequestStatus;
  createdAt: number;
}

export interface LeaveRequest extends BaseRequest {
  startDate: string;
  endDate: string;
  days: number;
  leaveType: string;
  remarks?: string;
}

export interface BusinessTripRequest extends BaseRequest {
  destination: string;
  departureDate: string;
  returnDate: string;
  purpose: string;
}

export interface OvertimeRequest extends BaseRequest {
  date: string;
  timeIn: string;
  timeOut: string;
  totalHours: number;
  dayType: string;
  remarks?: string;
}

export interface AttendanceRequest extends BaseRequest {
  category: string;
  fromDate: string;
  endDate: string;
  timeIn: string;
  timeOut: string;
  remarks?: string;
}

export interface LetterRequest extends BaseRequest {
  letterType: 'BIR 2316' | 'COE';
  templateName?: string;
  dateNeeded: string;
  remarks?: string;
}

export type AnyRequest = LeaveRequest | BusinessTripRequest | OvertimeRequest | AttendanceRequest | LetterRequest;
