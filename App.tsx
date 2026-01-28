
import React, { useState, useEffect } from 'react';
import { EmployeeProfile, FormType, AnyRequest, RequestStatus } from './types.ts';
import AuthPage from './pages/EmployeeProfile.tsx';
import FormSelectionPage from './pages/FormSelection.tsx';
import LeaveForm from './pages/Forms/LeaveForm.tsx';
import BusinessTripForm from './pages/Forms/BusinessTripForm.tsx';
import OvertimeForm from './pages/Forms/OvertimeForm.tsx';
import AttendanceForm from './pages/Forms/AttendanceForm.tsx';
import LetterRequestForm from './pages/Forms/LetterRequestForm.tsx';
import HistoryPage from './pages/History.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { Layout } from './components/Layout.tsx';
import { supabase } from './lib/supabase.ts';

/**
 * Main Application Component
 * Handles routing between authentication, user dashboard, forms, history, and admin dashboard.
 */
const App: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<AnyRequest[]>([]);
  const [currentStep, setCurrentStep] = useState<'auth' | 'user-dashboard' | 'form' | 'history' | 'admin'>('auth');
  const [activeFormType, setActiveFormType] = useState<FormType | null>(null);
  const [editingRequest, setEditingRequest] = useState<AnyRequest | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthChange(session);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = async (session: any) => {
    // Explicitly remove signup flag to prevent stale redirection loops
    localStorage.removeItem('nexus_signup_active');

    if (session?.user) {
      // Fetch user profile from app_profiles by user_id
      const { data: profileData, error } = await supabase
        .from('app_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error || !profileData) {
        // Fallback for new users or if trigger hasn't finished
        console.warn("Profile not found in app_profiles, checking metadata fallback");
        const metadata = session.user.user_metadata;
        
        if (!metadata?.username) {
          alert("User profile not found. Please contact administration.");
          await supabase.auth.signOut();
          return;
        }

        const fallbackProfile: EmployeeProfile = {
          employeeId: 'PENDING',
          name: metadata.full_name || '',
          employmentType: metadata.employment_type || '',
          department: metadata.department || '',
          team: metadata.team || '',
          position: metadata.position || '',
          username: metadata.username || '',
          gender: metadata.gender || 'Male',
          civilStatus: metadata.civil_status || 'Single',
          soloParent: metadata.solo_parent || 'No',
          role: 'user'
        };
        setProfile(fallbackProfile);
      } else {
        // Normalize role: trim and lowercase
        const userRole = (profileData.role || 'user').trim().toLowerCase();

        const currentProfile: EmployeeProfile = {
          employeeId: profileData.employee_id || 'UNASSIGNED',
          name: profileData.full_name || profileData.username || '',
          employmentType: profileData.employment_type || '',
          department: profileData.department || '',
          team: profileData.team || '',
          position: profileData.position || '',
          username: profileData.username || '',
          gender: profileData.gender || 'Male',
          civilStatus: profileData.civil_status || 'Single',
          soloParent: profileData.solo_parent || 'No',
          role: userRole as 'admin' | 'user'
        };

        setProfile(currentProfile);
      }

      setIsLoggedIn(true);
      fetchRequests();

      // Determine initial redirect based on role
      const role = profileData?.role || (session.user.user_metadata?.role || 'user').toLowerCase();
      if (role.trim().toLowerCase() === 'admin') {
        setCurrentStep('admin');
      } else {
        setCurrentStep('user-dashboard');
      }
    } else {
      setIsLoggedIn(false);
      setProfile(null);
      setCurrentStep('auth');
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
    } else if (data) {
      const formattedRequests = data.map(row => ({
        ...row.data,
        id: row.id,
        employeeId: row.employee_id,
        formType: row.form_type as FormType,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
      }));
      setRequests(formattedRequests as any);
    }
  };

  const handleSubmitRequest = async (request: AnyRequest) => {
    const { id, employeeId: _unused, formType, status, createdAt, ...data } = request;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const actualEmployeeId = profile?.employeeId || 'UNASSIGNED';
    
    let error;
    if (editingRequest) {
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          user_id: user.id,
          employee_id: actualEmployeeId,
          form_type: formType,
          status: status,
          data: data
        })
        .eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          employee_id: actualEmployeeId,
          form_type: formType,
          status: status,
          data: data
        });
      error = insertError;
    }

    if (error) {
      console.error("Supabase error:", error);
      alert("Error saving request: " + error.message);
      return;
    }

    await fetchRequests();
    setEditingRequest(null);
    setCurrentStep('history');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleEdit = (request: AnyRequest) => {
    const timePassed = Date.now() - request.createdAt;
    const isWithin24h = timePassed < 24 * 60 * 60 * 1000;
    
    if (request.status === RequestStatus.PENDING && isWithin24h) {
      setEditingRequest(request);
      setActiveFormType(request.formType);
      setCurrentStep('form');
    } else {
      alert("This request cannot be edited anymore.");
    }
  };

  const handleDelete = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const timePassed = Date.now() - request.createdAt;
    const isWithin24h = timePassed < 24 * 60 * 60 * 1000;

    if (request.status === RequestStatus.PENDING && isWithin24h) {
      if (window.confirm("Are you sure you want to delete this request?")) {
        const { error } = await supabase.from('requests').delete().eq('id', id);
        if (error) {
          alert("Error deleting request: " + error.message);
        } else {
          setRequests(prev => prev.filter(r => r.id !== id));
        }
      }
    } else {
      alert("This request cannot be deleted anymore.");
    }
  };

  const renderCurrentPage = () => {
    switch (currentStep) {
      case 'auth':
        return <AuthPage onSubmit={() => {}} onLogin={() => {}} savedProfile={profile} />;
      case 'user-dashboard':
        return (
          <FormSelectionPage 
            onSelect={(type) => { setActiveFormType(type); setCurrentStep('form'); }} 
            onViewHistory={() => setCurrentStep('history')} 
          />
        );
      case 'form':
        if (!activeFormType) return null;
        const formProps = {
          onSubmit: handleSubmitRequest,
          onCancel: () => {
            setCurrentStep('user-dashboard');
            setEditingRequest(null);
          },
          initialData: editingRequest
        };
        switch (activeFormType) {
          case FormType.LEAVE:
            return <LeaveForm {...formProps} profile={profile} requests={requests} />;
          case FormType.BUSINESS_TRIP:
            return <BusinessTripForm {...formProps} />;
          case FormType.OVERTIME:
            return <OvertimeForm {...formProps} />;
          case FormType.ATTENDANCE:
            return <AttendanceForm {...formProps} profile={profile} />;
          case FormType.LETTER:
            return <LetterRequestForm {...formProps} />;
          default:
            return null;
        }
      case 'history':
        return (
          <HistoryPage 
            requests={requests} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onNewRequest={() => setCurrentStep('user-dashboard')} 
          />
        );
      case 'admin':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <Layout 
      profile={profile} 
      onEditProfile={() => setCurrentStep('auth')} 
      onGoHome={() => setCurrentStep(profile?.role === 'admin' ? 'admin' : 'user-dashboard')}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;
