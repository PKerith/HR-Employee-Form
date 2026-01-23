
import React, { useState, useEffect } from 'react';
import { FormType, OvertimeRequest, RequestStatus } from '../../types';
import { OT_DAY_TYPES } from '../../constants';
import { Clock, Calendar, AlertCircle, ChevronLeft, ArrowRight } from 'lucide-react';

interface Props {
  onSubmit: (data: OvertimeRequest) => void;
  onCancel: () => void;
  initialData?: any;
}

const OvertimeForm: React.FC<Props> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    timeIn: initialData?.timeIn || '',
    timeOut: initialData?.timeOut || '',
    dayType: initialData?.dayType || OT_DAY_TYPES[0],
    remarks: initialData?.remarks || ''
  });

  const [totalHours, setTotalHours] = useState(0);
  const [dutyHours, setDutyHours] = useState(0);

  // Helper for date restrictions
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const minDateStr = sevenDaysAgo.toISOString().split('T')[0];

  useEffect(() => {
    if (formData.timeIn && formData.timeOut) {
      const [inH, inM] = formData.timeIn.split(':').map(Number);
      const [outH, outM] = formData.timeOut.split(':').map(Number);
      
      let hours = outH - inH;
      let mins = outM - inM;
      
      if (mins < 0) {
        hours -= 1;
        mins += 60;
      }

      if (hours < 0) {
        hours += 24; // Handle overnight duty
      }

      const totalDuty = hours + (mins / 60);
      setDutyHours(parseFloat(totalDuty.toFixed(2)));
      
      /**
       * Requirement: Overtime can only be counted if the employee has already worked at least 10 hours.
       * Example: 7:00 AM to 5:00 PM (10 hours total) = 1 hour OT.
       * Logic: OT Hours = Total Duty Hours - 9 (Base shift of 9 hours including break).
       */
      const otCalculated = Math.max(0, totalDuty - 9);
      setTotalHours(parseFloat(otCalculated.toFixed(2)));
    } else {
      setDutyHours(0);
      setTotalHours(0);
    }
  }, [formData.timeIn, formData.timeOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields check
    if (!formData.date || !formData.timeIn || !formData.timeOut || !formData.dayType || !formData.remarks) {
      alert("All fields are required, including Remarks.");
      return;
    }

    // Date restrictions
    const selectedDate = new Date(formData.date);
    const currentDate = new Date(todayStr);
    const minDate = new Date(minDateStr);

    if (selectedDate > currentDate) {
      alert("Overtime cannot be filed for a future date.");
      return;
    }

    if (selectedDate < minDate) {
      alert("Overtime requests must be submitted within 7 days of the work date.");
      return;
    }

    // OT Calculation check
    if (dutyHours < 10) {
      alert("Overtime filing is only permitted after completing at least 10 hours of duty (OT starts after 9th hour).");
      return;
    }

    if (totalHours <= 0) {
      alert("Total OT Hours must be more than 0.");
      return;
    }

    const request: OvertimeRequest = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: 'me',
      formType: FormType.OVERTIME,
      status: initialData?.status || RequestStatus.PENDING,
      createdAt: initialData?.createdAt || Date.now(),
      ...formData,
      totalHours
    };
    onSubmit(request);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2";

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <button onClick={onCancel} className="mb-6 flex items-center gap-1 text-slate-500 hover:text-orange-600 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to selection
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Lighter header for visual consistency */}
        <div className="bg-[#F2F4F7] border-b border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Overtime Request</h2>
          </div>
          <p className="text-slate-500">Log extra hours worked. OT is calculated for duty exceeding 9 hours.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>
              <Calendar className="w-4 h-4 text-orange-500" /> Date of Overtime*
            </label>
            <input
              type="date"
              required
              max={todayStr}
              min={minDateStr}
              className={`${inputClasses} cursor-pointer`}
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>
                <Clock className="w-4 h-4 text-orange-500" /> Time In*
              </label>
              <input
                type="time"
                required
                className={inputClasses}
                value={formData.timeIn}
                onChange={e => setFormData({ ...formData, timeIn: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>
                <Clock className="w-4 h-4 text-orange-500" /> Time Out*
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Total Duty</span>
              <span className="font-bold text-slate-900">{dutyHours} hrs</span>
            </div>
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${totalHours > 0 ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 font-semibold text-orange-800">
                <AlertCircle className={`w-4 h-4 ${totalHours > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
                <span>Calculated OT</span>
              </div>
              <span className={`text-2xl font-bold ${totalHours > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                {totalHours} hrs
              </span>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Type of Day*</label>
            <div className="flex flex-wrap gap-2">
              {OT_DAY_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, dayType: type })}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                    formData.dayType === type 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-orange-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClasses}>Remarks*</label>
            <textarea
              required
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Detailed reason for the overtime requirement..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3 border border-blue-100">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed">
              <p><strong>Filing Policy:</strong> Overtime is only valid after 9 hours of total shift duration (e.g., 7am-5pm is 10 hours duty, resulting in 1 hour OT).</p>
              <p className="mt-1"><strong>Restrictions:</strong> Submission must be within 7 days of the work date. Future dates are not allowed.</p>
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
              className="flex-[2] py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              {initialData ? 'Update Request' : 'Submit Overtime'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OvertimeForm;
