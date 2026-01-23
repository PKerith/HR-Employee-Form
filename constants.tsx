
import React from 'react';
import { 
  Calendar, 
  Plane, 
  Clock, 
  CheckCircle, 
  FileText,
  User,
  Briefcase,
  Users,
  Building2,
  Trophy
} from 'lucide-react';
import { FormType } from './types.ts';

export const DEPARTMENTS = ['HR', 'Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'Legal'];
export const POSITIONS = ['Manager', 'Lead', 'Senior Associate', 'Associate', 'Intern', 'Specialist'];
export const TEAMS = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

export const LEAVE_TYPES = [
  'Sick Leave',
  'Vacation Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Bereavement Leave',
  'Leave Without Pay'
];

export const OT_DAY_TYPES = [
  'Regular Workday',
  'Rest Day',
  'Special Non-Working Holiday',
  'Regular Holiday'
];

export const ATTENDANCE_CATEGORIES = [
  'Branch Visit',
  'Business Meeting',
  'Field Work',
  'School Visit',
  'Seminar',
  'Training',
  'Technical Assistance',
  'Work from Home'
];

export const COE_TEMPLATES = [
  'Pag-Ibig Multipurpose Loan',
  'Bank Loan/Housing',
  'Credit Card Application',
  'Travel Order',
  'Employee Reference (with compensation)',
  'Employee Reference (without compensation)',
  'Visa Application'
];

export const FORM_OPTIONS = [
  { 
    id: FormType.LEAVE, 
    title: FormType.LEAVE, 
    icon: <Calendar className="w-6 h-6" />, 
    color: 'bg-blue-500',
    description: 'Request time off for vacation or sickness.'
  },
  { 
    id: FormType.BUSINESS_TRIP, 
    title: FormType.BUSINESS_TRIP, 
    icon: <Plane className="w-6 h-6" />, 
    color: 'bg-indigo-500',
    description: 'Coordinate official travel and authorizations.'
  },
  { 
    id: FormType.OVERTIME, 
    title: FormType.OVERTIME, 
    icon: <Clock className="w-6 h-6" />, 
    color: 'bg-orange-500',
    description: 'Log extra hours worked beyond regular schedule.'
  },
  { 
    id: FormType.ATTENDANCE, 
    title: FormType.ATTENDANCE, 
    icon: <CheckCircle className="w-6 h-6" />, 
    color: 'bg-green-500',
    description: 'Adjust attendance logs for off-site duties.'
  },
  { 
    id: FormType.LETTER, 
    title: FormType.LETTER, 
    icon: <FileText className="w-6 h-6" />, 
    color: 'bg-purple-500',
    description: 'Request COE, BIR 2316, or reference letters.'
  }
];
