
import React, { useState } from 'react';
import { FormType, BusinessTripRequest, RequestStatus } from '../../types';
import { Plane, MapPin, Calendar, FileText, ChevronLeft, ArrowRight } from 'lucide-react';

interface Props {
  onSubmit: (data: BusinessTripRequest) => void;
  onCancel: () => void;
  initialData?: any;
}

const BusinessTripForm: React.FC<Props> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    destination: initialData?.destination || '',
    departureDate: initialData?.departureDate || '',
    returnDate: initialData?.returnDate || '',
    purpose: initialData?.purpose || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Required fields check (handled by HTML5 required, but for robustness)
    if (!formData.destination || !formData.departureDate || !formData.returnDate || !formData.purpose) {
      alert("All fields are required.");
      return;
    }

    const start = new Date(formData.departureDate);
    const end = new Date(formData.returnDate);

    // Date Validation
    if (start > end) {
      alert("Departure Date must not be later than Return Date.");
      return;
    }

    const request: BusinessTripRequest = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: 'me',
      formType: FormType.BUSINESS_TRIP,
      status: initialData?.status || RequestStatus.PENDING,
      createdAt: initialData?.createdAt || Date.now(),
      ...formData
    };
    onSubmit(request);
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2";

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <button onClick={onCancel} className="mb-6 flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to selection
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Lighter header for modern UI consistency */}
        <div className="bg-[#F2F4F7] border-b border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Plane className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Official Business Trip</h2>
          </div>
          <p className="text-slate-500">Log travel details for official authorization and tracking.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>
              <MapPin className="w-4 h-4 text-blue-500" /> Destination*
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Makati City, Philippines"
              className={inputClasses}
              value={formData.destination}
              onChange={e => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>
                <Calendar className="w-4 h-4 text-blue-500" /> Departure Date*
              </label>
              <input
                type="date"
                required
                className={`${inputClasses} cursor-pointer`}
                value={formData.departureDate}
                onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClasses}>
                <Calendar className="w-4 h-4 text-blue-500" /> Return Date*
              </label>
              <input
                type="date"
                required
                className={`${inputClasses} cursor-pointer`}
                value={formData.returnDate}
                onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              <FileText className="w-4 h-4 text-blue-500" /> Purpose of Trip*
            </label>
            <textarea
              required
              rows={4}
              className={`${inputClasses} resize-none`}
              placeholder="Describe the main objectives and schedule of this business trip..."
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
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
              className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {initialData ? 'Update Trip Log' : 'Submit Application'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessTripForm;
