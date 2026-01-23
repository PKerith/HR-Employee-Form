
import React from 'react';
import { AnyRequest, RequestStatus } from '../types.ts';
import { FORM_OPTIONS } from '../constants.tsx';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  requests: AnyRequest[];
  onEdit: (request: AnyRequest) => void;
  onDelete: (id: string) => void;
  onNewRequest: () => void;
}

const HistoryPage: React.FC<Props> = ({ requests, onEdit, onDelete, onNewRequest }) => {
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case RequestStatus.APPROVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case RequestStatus.REJECTED: return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return <Clock className="w-3 h-3" />;
      case RequestStatus.APPROVED: return <CheckCircle2 className="w-3 h-3" />;
      case RequestStatus.REJECTED: return <XCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Request History</h1>
          <p className="text-slate-500">Track and manage your submitted concerns.</p>
        </div>
        <button
          onClick={onNewRequest}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Create New Request
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No requests yet</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't submitted any requests. Start by creating a new one using the button above.</p>
            <button
              onClick={onNewRequest}
              className="text-indigo-600 font-bold hover:underline"
            >
              Get started now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type & ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => {
                  const formOption = FORM_OPTIONS.find(o => o.id === request.formType);
                  const isWithin24h = (Date.now() - request.createdAt) < 24 * 60 * 60 * 1000;
                  const canEdit = request.status === RequestStatus.PENDING && isWithin24h;

                  return (
                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${formOption?.color} rounded-xl flex items-center justify-center text-white shrink-0`}>
                            {formOption?.icon}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{request.formType}</div>
                            <div className="text-xs text-slate-400 font-mono">#{request.id.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-slate-600 max-w-xs truncate">
                          {'leaveType' in request && <span>{request.leaveType} • {request.days} days</span>}
                          {'destination' in request && <span>To {request.destination}</span>}
                          {'totalHours' in request && <span>{request.totalHours} OT hours</span>}
                          {'category' in request && <span>{request.category}</span>}
                          {'letterType' in request && <span>{request.letterType} {request.templateName ? `(${request.templateName})` : ''}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-slate-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                          <div className="text-xs">{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => onEdit(request)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Edit Request"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => onDelete(request.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Request"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-300 italic px-2">Action locked</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 bg-slate-100 p-4 rounded-2xl flex items-start gap-3">
        <ArrowUpRight className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-500 italic">
          <strong>Pro-tip:</strong> Requests can only be edited or deleted within 24 hours of submission and while they are still in 'Pending' status.
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;
