
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.ts';
import { RequestStatus, FormType } from '../types.ts';
import { FORM_OPTIONS } from '../constants.tsx';
import { 
  UserCog, 
  Save, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit, 
  Users, 
  ClipboardList,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MockUser {
  id: string;
  email: string;
  username: string;
  role: string;
  employee_id: string;
}

interface DBRequest {
  id: string;
  user_id: string;
  employee_id: string;
  form_type: string;
  status: RequestStatus;
  data: any;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [view, setView] = useState<'requests' | 'users'>('requests');
  const [users, setUsers] = useState<MockUser[]>([]);
  const [requests, setRequests] = useState<DBRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  
  // States for user/request editing
  const [editingUserIds, setEditingUserIds] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    setLoading(true);
    if (view === 'requests') {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setRequests(data || []);
    } else {
      const { data, error } = await supabase
        .from('mock_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setUsers(data || []);
    }
    setLoading(false);
  };

  const handleUpdateUserEmpId = async (userId: string) => {
    const newId = editingUserIds[userId];
    if (!newId || newId.trim() === '') return;

    setActionLoading(`user-${userId}`);
    const { error } = await supabase
      .from('mock_users')
      .update({ employee_id: newId })
      .eq('id', userId);

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, employee_id: newId } : u));
      setEditingUserIds(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
    setActionLoading(null);
  };

  const handleRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    setActionLoading(requestId);
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) alert("Status update failed: " + error.message);
    else setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    setActionLoading(null);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this request?")) return;
    
    setActionLoading(requestId);
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId);

    if (error) alert("Delete failed: " + error.message);
    else setRequests(prev => prev.filter(r => r.id !== requestId));
    setActionLoading(null);
  };

  const handleEditRequestData = async (request: DBRequest) => {
    const field = prompt("Which field to edit? (e.g. leaveType, destination, remarks)");
    if (!field) return;
    
    const newValue = prompt(`Enter new value for ${field}:`, request.data[field] || "");
    if (newValue === null) return;

    setActionLoading(request.id);
    const newData = { ...request.data, [field]: newValue };
    const { error } = await supabase
      .from('requests')
      .update({ data: newData })
      .eq('id', request.id);

    if (error) alert("Edit failed: " + error.message);
    else setRequests(prev => prev.map(r => r.id === request.id ? { ...r, data: newData } : r));
    setActionLoading(null);
  };

  const handleAddComment = async (request: DBRequest) => {
    const comment = prompt("Add an admin comment/remark:", request.data?.adminComment || "");
    if (comment === null) return;

    setActionLoading(request.id);
    const newData = { ...request.data, adminComment: comment };
    const { error } = await supabase
      .from('requests')
      .update({ data: newData })
      .eq('id', request.id);

    if (error) alert("Failed to add comment: " + error.message);
    else setRequests(prev => prev.map(r => r.id === request.id ? { ...r, data: newData } : r));
    setActionLoading(null);
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#083D77] p-2 rounded-2xl text-white shadow-lg shadow-blue-100">
              <UserCog className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Panel</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage all organizational requests and identities from a single interface.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setView('requests')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${view === 'requests' ? 'bg-white text-[#083D77] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ClipboardList className="w-5 h-5" /> Requests
          </button>
          <button 
            onClick={() => setView('users')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${view === 'users' ? 'bg-white text-[#083D77] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-5 h-5" /> Users
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-16 h-16 animate-spin mb-6 text-[#083D77]" />
            <p className="font-bold text-slate-500">Synchronizing database state...</p>
          </div>
        ) : view === 'requests' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Type & Timestamp</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">User Context</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic">No historical data available.</td></tr>
                ) : requests.map((req) => {
                  const formOption = FORM_OPTIONS.find(o => o.id === req.form_type as FormType);
                  return (
                    <React.Fragment key={req.id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${expandedRequest === req.id ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${formOption?.color || 'bg-slate-200'} rounded-xl flex items-center justify-center text-white shrink-0`}>
                              {formOption?.icon || <ClipboardList className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{formOption?.title || req.form_type}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded">#{req.id.split('-')[0].toUpperCase()}</span>
                                <span>• {new Date(req.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${req.employee_id === 'UNASSIGNED' ? 'bg-rose-100 text-rose-700' : 'bg-[#083D77] text-white'}`}>
                              {req.employee_id || 'NO ID'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] mt-1">UID: {req.user_id}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black border uppercase tracking-wider ${
                            req.status === RequestStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-50' :
                            req.status === RequestStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-50' :
                            'bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-50'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {actionLoading === req.id ? (
                              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            ) : (
                              <>
                                <button 
                                  onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all"
                                  title="Expand Details"
                                >
                                  {expandedRequest === req.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                                <div className="h-6 w-px bg-slate-200 mx-1" />
                                <button 
                                  onClick={() => handleRequestStatus(req.id, RequestStatus.APPROVED)}
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                  title="Approve Request"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleRequestStatus(req.id, RequestStatus.REJECTED)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Reject Request"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRequest(req.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                  title="Force Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedRequest === req.id && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={4} className="px-10 py-8 border-l-4 border-[#083D77] animate-slideInDown">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <ClipboardList className="w-3.5 h-3.5" /> Payload Data
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                  <dl className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    {Object.entries(req.data).map(([key, val]) => (
                                      key !== 'adminComment' && (
                                        <div key={key}>
                                          <dt className="text-slate-400 text-[10px] font-bold uppercase mb-1">{key}</dt>
                                          <dd className="text-slate-900 font-semibold break-words">{String(val)}</dd>
                                        </div>
                                      )
                                    ))}
                                  </dl>
                                  <button 
                                    onClick={() => handleEditRequestData(req)}
                                    className="mt-6 flex items-center gap-2 text-xs font-bold text-[#083D77] hover:underline"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Edit Data Field
                                  </button>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5" /> Administrative Remarks
                                </h4>
                                <div className={`p-6 rounded-2xl border ${req.data?.adminComment ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-white border-slate-200 text-slate-400 italic'}`}>
                                  {req.data?.adminComment || "No administrative remarks recorded for this transaction."}
                                  <button 
                                    onClick={() => handleAddComment(req)}
                                    className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-tight text-[#083D77] not-italic hover:underline"
                                  >
                                    {req.data?.adminComment ? "Edit Remark" : "Add Resolution Remark"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Account Identification</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Access Control</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Personnel Assignment</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-extrabold text-slate-900">{user.username || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                      <div className="text-[10px] text-slate-300 font-mono mt-1">UUID: {user.id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${user.employee_id === 'UNASSIGNED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {user.employee_id}
                        </div>
                        <input 
                          type="text" 
                          placeholder="New ID..."
                          className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#083D77] transition-all text-xs w-full max-w-[150px]"
                          value={editingUserIds[user.id] || ''}
                          onChange={(e) => setEditingUserIds({ ...editingUserIds, [user.id]: e.target.value })}
                          disabled={actionLoading === `user-${user.id}`}
                        />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleUpdateUserEmpId(user.id)}
                        disabled={actionLoading === `user-${user.id}` || !editingUserIds[user.id]}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#083D77] text-white rounded-xl text-xs font-black uppercase tracking-tight hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-blue-100/50"
                      >
                        {actionLoading === `user-${user.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Commit ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
