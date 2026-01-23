
import React, { useState, useEffect, useMemo } from 'react';
import { FormType, LeaveRequest, RequestStatus, EmployeeProfile, AnyRequest } from '../../types.ts';
import { Calendar, Paperclip, ChevronLeft, ArrowRight, Info, FileCheck } from 'lucide-react';

interface Props {
  onSubmit: (data: LeaveRequest) => void;
  onCancel: () => void;
  initialData?: any;
  profile: EmployeeProfile | null;
  requests: AnyRequest[];
}

const INITIAL_CREDITS = {
  'Sick Leave': 15,
  'Vacation Leave': 15,
  'Solo Parent Leave': 7
};

const LeaveForm: React.FC<Props> = ({ onSubmit, onCancel, initialData, profile, requests }) => {
  const [formData, setFormData] = useState({
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    leaveType: initialData?.leaveType || 'Sick Leave',
    remarks: initialData?.remarks || ''
  });

  const [attachment, setAttachment] = useState<File | null>(null);
  const [days, setDays] = useState(0);

  // Filter leave types based on profile
  const availableLeaveTypes = useMemo(() => {
    const types = ['Sick Leave', 'Vacation Leave', 'Leave Without Pay'];
    if (profile?.gender === 'Male') types.push('Paternity Leave');
    if (profile?.gender === 'Female') types.push('Maternity Leave');
    if (profile?.soloParent === 'Yes') types.push('Solo Parent Leave');
    return types;
  }, [profile]);

  // Calculate balances (Deducts Pending and Approved requests)
  const balances = useMemo(() => {
    const result: Record<string, number> = { ...INITIAL_CREDITS };
    
    availableLeaveTypes.forEach(type => {
      if (type in INITIAL_CREDITS) {
        const used = requests
          .filter(r => 
            r.formType === FormType.LEAVE && 
            (r as LeaveRequest).leaveType === type && 
            r.status !== RequestStatus.REJECTED && // Counts everything except rejected
            r.id !== initialData?.id // Don't count current request if editing
          )
          .reduce((sum, r) => sum + (r as LeaveRequest).days, 0);
        
        result[type] = INITIAL_CREDITS[type as keyof typeof INITIAL_CREDITS] - used;
      }
    });
    
    return result;
  }, [requests, availableLeaveTypes, initialData?.id]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDays(diffDays > 0 ? diffDays : 0);
    } else {
      setDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    // Date Validation
    if (!formData.startDate || !formData.endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    
    if (start > end) {
      alert("Start Date must not be later than End Date.");
      return;
    }

    if (days <= 0) {
      alert("Please ensure the leave duration is valid.");
      return;
    }

    // Attachment Validation: Required for Sick Leave of 2 or more days
    if (formData.leaveType === 'Sick Leave' && days >= 2 && !attachment && !initialData?.attachment) {
      alert("A Medical Certificate is required for Sick Leave applications of 2 or more consecutive days.");
      return;
    }

    // Balance Validation
    if (formData.leaveType in INITIAL_CREDITS) {
      const currentBalance = balances[formData.leaveType];
      if (days > currentBalance) {
        alert(`Insufficient leave balance for ${formData.leaveType}. Available: ${currentBalance} days.`);
        return;
      }
    }

    const request: LeaveRequest = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: 'me',
      formType: FormType.LEAVE,
      status: initialData?.status || RequestStatus.PENDING,
      createdAt: initialData?.createdAt || Date.now(),
      ...formData,
      days
    };
    onSubmit(request);
  };

  const isDeductible = formData.leaveType in INITIAL_CREDITS;
  const isMcRequired = formData.leaveType === 'Sick Leave' && days >= 2;

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <button onClick={onCancel} className="mb-6 flex items-center gap-1 text-slate-500 hover:text-[#083D77] transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to selection
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Lighter color header as per requirements */}
        <div className="bg-[#F2F4F7] border-b border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#083D77] p-2 rounded-xl text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#083D77]">Leave Management</h2>
          </div>
          <p className="text-slate-500">Apply for time off and manage your leave credits.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#083D77] outline-none transition-all cursor-pointer"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#083D77] outline-none transition-all cursor-pointer"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-600 font-medium">Leave Duration</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#083D77]">{days}</span>
                <span className="text-slate-500 text-sm">days</span>
              </div>
            </div>

            {isDeductible && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-emerald-700 font-medium">Available Credits</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-600">{balances[formData.leaveType]}</span>
                  <span className="text-emerald-500 text-sm">left</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Type of Leave</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableLeaveTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveType: type })}
                  className={`px-4 py-3 text-xs sm:text-sm rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    formData.leaveType === type 
                      ? 'bg-[#083D77] border-[#083D77] text-white font-bold shadow-md shadow-slate-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#083D77]'
                  }`}
                >
                  <span>{type}</span>
                  {type in INITIAL_CREDITS && (
                    <span className={`text-[10px] uppercase tracking-tighter ${formData.leaveType === type ? 'text-blue-100' : 'text-slate-400'}`}>
                      Bal: {balances[type]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Paperclip className={`w-4 h-4 ${isMcRequired ? 'text-rose-500' : 'text-[#083D77]'}`} /> 
              Medical Certificate {isMcRequired ? <span className="text-rose-500">* Required</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
            </label>
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isMcRequired && !attachment ? 'border-rose-200 bg-rose-50 hover:bg-rose-100/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {attachment ? <FileCheck className="w-8 h-8 text-emerald-500 mb-2" /> : <Paperclip className={`w-8 h-8 mb-2 ${isMcRequired ? 'text-rose-300' : 'text-slate-300'}`} />}
                  <p className="text-sm text-slate-600 font-medium truncate max-w-full">
                    {attachment ? attachment.name : 'Click to upload Medical Certificate'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks (Optional)</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#083D77] outline-none resize-none transition-all"
              placeholder="State the reason for your leave request..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3 border border-blue-100">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed space-y-1">
              <p><strong>Deduction:</strong> Regular employees have 15 Sick, 15 Vacation, and 7 Solo Parent credits annually. Credits are deducted upon submission of Pending/Approved requests.</p>
              <p><strong>Requirement:</strong> A Medical Certificate is mandatory for Sick Leave requests of 2 or more consecutive days.</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-[#083D77] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {initialData ? 'Update Request' : 'Submit Application'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
