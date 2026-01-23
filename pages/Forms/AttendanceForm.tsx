
import React, { useState, useEffect } from 'react';
import { FormType, AttendanceRequest, RequestStatus, EmployeeProfile } from '../../types.ts';
import { ATTENDANCE_CATEGORIES } from '../../constants.tsx';
import { CheckCircle, Calendar, Clock, ChevronLeft, ArrowRight, AlertTriangle, Info } from 'lucide-react';

interface Props {
  onSubmit: (data: AttendanceRequest) => void;
  onCancel: () => void;
  initialData?: any;
  profile: EmployeeProfile | null;
}

const AttendanceForm: React.FC<Props> = ({ onSubmit, onCancel, initialData, profile }) => {
  const [formData, setFormData] = useState({
    category: initialData?.category || ATTENDANCE_CATEGORIES[0],
    fromDate: initialData?.fromDate || '',
    endDate: initialData?.endDate || '',
    timeIn: initialData?.timeIn || '',
    timeOut: initialData?.timeOut || '',
    remarks: initialData?.remarks || ''
  });

  const [isLate, setIsLate] = useState(false);

  // Helper for date restrictions
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const minDateStr = sevenDaysAgo.toISOString().split('T')[0];

  const exemptPositions = [
    'Executive',
    'Manager',
    'Supervisor',
    'Team Leader',
    'Assistant Team Leader'
  ];

  useEffect(() => {
    if (formData.category === 'Work from Home' && formData.timeIn) {
      const [hours, minutes] = formData.timeIn.split(':').map(Number);
      const timeInValue = hours * 60 + minutes;
      const lateThreshold = 9 * 60 + 30; // 9:30 AM
      
      const isPositionExempt = profile?.position && exemptPositions.includes(profile.position);
      
      if (timeInValue > lateThreshold && !isPositionExempt) {
        setIsLate(true);
      } else {
        setIsLate(false);
      }
    } else {
      setIsLate(false);
    }
  }, [formData.category, formData.timeIn, profile?.position]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const from = new Date(formData.fromDate);
    const end = new Date(formData.endDate);
    const minDate = new Date(minDateStr);
    const maxDate = new Date(todayStr);

    // Date Range Validations
    if (from > end) {
      alert("From Date cannot be later than End Date.");
      return;
    }

    if (from < minDate || end < minDate) {
      alert("Regularization requests cannot be submitted for dates more than 7 days prior to today.");
      return;
    }

    if (from > maxDate || end > maxDate) {
      alert("Regularization cannot be filed for future dates.");
      return;
    }

    // Time Validation
    if (formData.timeIn && formData.timeOut) {
      const [inH, inM] = formData.timeIn.split(':').map(Number);
      const [outH, outM] = formData.timeOut.split(':').map(Number);
      const inVal = inH * 60 + inM;
      const outVal = outH * 60 + outM;

      if (outVal <= inVal) {
        alert("Time Out must be later than Time In.");
        return;
      }
    }

    const request: AttendanceRequest = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: 'me',
      formType: FormType.ATTENDANCE,
      status: initialData?.status || RequestStatus.PENDING,
      createdAt: initialData?.createdAt || Date.now(),
      ...formData,
      remarks: isLate ? `[LATE RECORDED] ${formData.remarks}` : formData.remarks
    };
    onSubmit(request);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-green-500 outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2";

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <button onClick={onCancel} className="mb-6 flex items-center gap-1 text-slate-500 hover:text-green-600 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to selection
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Modern Lighter Header */}
        <div className="bg-[#F2F4F7] border-b border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-600 p-2 rounded-xl text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Attendance Regularization</h2>
          </div>
          <p className="text-slate-500">Correct your attendance logs for official duties or off-site work.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>
              <Info className="w-4 h-4 text-green-500" /> Regularization Category*
            </label>
            <select
              required
              className={inputClasses}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {ATTENDANCE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>
                <Calendar className="w-4 h-4 text-green-500" /> From Date*
              </label>
              <input
                type="date"
                required
                min={minDateStr}
                max={todayStr}
                className={`${inputClasses} cursor-pointer`}
                value={formData.fromDate}
                onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>
                <Calendar className="w-4 h-4 text-green-500" /> End Date*
              </label>
              <input
                type="date"
                required
                min={minDateStr}
                max={todayStr}
                className={`${inputClasses} cursor-pointer`}
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>
                <Clock className="w-4 h-4 text-green-500" /> Time In*
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  className={`${inputClasses} ${isLate ? 'border-amber-400 ring-amber-100 ring-2' : ''}`}
                  value={formData.timeIn}
                  onChange={e => setFormData({ ...formData, timeIn: e.target.value })}
                />
                {isLate && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" /> Considered Late (&gt; 9:30 AM)
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClasses}>
                <Clock className="w-4 h-4 text-green-500" /> Time Out*
              </label>
              <input
                type="time"
                required
                className={inputClasses}
                value={formData.timeOut}
                onChange={e => setFormData({ ...formData, timeOut: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Remarks (Optional)</label>
            <textarea
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Provide a reason for the attendance correction..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed space-y-1">
              <p><strong>Filing Window:</strong> Requests must be filed within 7 days of the actual work date. Future dates are strictly prohibited.</p>
              <p><strong>WFH Policy:</strong> Standard Time In for WFH is 7:00 AM – 9:30 AM. Non-exempt positions arriving after 9:30 AM are marked as late.</p>
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
              className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              {initialData ? 'Update Record' : 'Submit Regularization'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
