
import React, { useState } from 'react';
import { FormType, LetterRequest, RequestStatus } from '../../types';
import { COE_TEMPLATES } from '../../constants';
import { FileText, FileCheck, Calendar, ChevronLeft, ArrowRight, Info } from 'lucide-react';

interface Props {
  onSubmit: (data: LetterRequest) => void;
  onCancel: () => void;
  initialData?: any;
}

const LetterRequestForm: React.FC<Props> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    letterType: initialData?.letterType || 'COE',
    templateName: initialData?.templateName || COE_TEMPLATES[0],
    dateNeeded: initialData?.dateNeeded || '',
    remarks: initialData?.remarks || ''
  });

  // Requirement: Date needed must be at least 3 days ahead of current date
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dateNeeded) {
      alert("Please specify when you need the letter.");
      return;
    }

    const selectedDate = new Date(formData.dateNeeded);
    const requiredMinDate = new Date(minDateStr);

    if (selectedDate < requiredMinDate) {
      alert("Requests require at least a 3-day lead time for processing. Please select a later date.");
      return;
    }

    if (formData.letterType === 'COE' && !formData.templateName) {
      alert("Template name is required for COE.");
      return;
    }

    const request: LetterRequest = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: 'me',
      formType: FormType.LETTER,
      status: initialData?.status || RequestStatus.PENDING,
      createdAt: initialData?.createdAt || Date.now(),
      letterType: formData.letterType as 'BIR 2316' | 'COE',
      templateName: formData.letterType === 'COE' ? formData.templateName : undefined,
      dateNeeded: formData.dateNeeded,
      remarks: formData.remarks
    };
    onSubmit(request);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 cursor-pointer";

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <button onClick={onCancel} className="mb-6 flex items-center gap-1 text-slate-500 hover:text-purple-600 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to selection
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Modern Lighter Header consistent with other forms */}
        <div className="bg-[#F2F4F7] border-b border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 p-2 rounded-xl text-white">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Letter Request</h2>
          </div>
          <p className="text-slate-500">Request official documents for bank, visa, or loans.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>Type of Document*</label>
            <div className="grid grid-cols-2 gap-4">
              {['BIR 2316', 'COE'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, letterType: type as any })}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${
                    formData.letterType === type 
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' 
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <FileCheck className={`w-5 h-5 ${formData.letterType === type ? 'text-purple-600' : 'text-slate-300'}`} />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {formData.letterType === 'COE' && (
            <div>
              <label className={labelClasses}>Template Purpose*</label>
              <select
                required
                className={inputClasses}
                value={formData.templateName}
                onChange={e => setFormData({ ...formData, templateName: e.target.value })}
              >
                {COE_TEMPLATES.map(tmp => (
                  <option key={tmp} value={tmp}>{tmp}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="dateNeeded" className={labelClasses}>
              <Calendar className="w-5 h-5 text-purple-600" /> Date Needed*
            </label>
            <input
              id="dateNeeded"
              type="date"
              required
              min={minDateStr}
              className={`${inputClasses} cursor-pointer`}
              value={formData.dateNeeded}
              onChange={e => setFormData({ ...formData, dateNeeded: e.target.value })}
            />
            <div className="mt-2 flex items-center gap-2 p-3 bg-purple-50 rounded-lg text-xs text-purple-700 font-medium border border-purple-100">
              <Info className="w-4 h-4 shrink-0" />
              <span>HR requires a minimum 3-day lead time for processing.</span>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Additional Remarks (Optional)</label>
            <textarea
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Any specific instructions for the HR team?"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
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
              className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            >
              {initialData ? 'Update Request' : 'Submit Request'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LetterRequestForm;
