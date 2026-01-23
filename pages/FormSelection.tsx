
import React from 'react';
import { FormType } from '../types.ts';
import { FORM_OPTIONS } from '../constants.tsx';
import { ChevronRight, History } from 'lucide-react';

interface Props {
  onSelect: (type: FormType) => void;
  onViewHistory: () => void;
}

const FormSelectionPage: React.FC<Props> = ({ onSelect, onViewHistory }) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">How can we help you today?</h1>
          <p className="text-lg text-slate-500 mt-2">Select the type of request you wish to submit.</p>
        </div>
        <button 
          onClick={onViewHistory}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
        >
          <History className="w-5 h-5 text-indigo-500" /> View Request History
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FORM_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="group flex flex-col p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all relative overflow-hidden"
          >
            <div className={`w-12 h-12 ${option.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
              {option.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">{option.description}</p>
            <div className="flex items-center text-indigo-600 font-semibold text-sm mt-auto">
              Start Request <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormSelectionPage;
