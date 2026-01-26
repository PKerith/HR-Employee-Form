
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
import { Layout } from './components/Layout.tsx';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<AnyRequest[]>([]);
  const [currentStep, setCurrentStep] = useState<'auth' | 'selection' | 'form' | 'history'>('auth');
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
  }, [currentStep]);

  const handleAuthChange = (session: any) => {
    if (session?.user) {
      setIsLoggedIn(true);
      const metadata = session.user.user_metadata;
      
      // Map Supabase User Metadata back to our EmployeeProfile type
      // Using session.user.id as the employeeId linked to auth.uid()
      setProfile({
        employeeId: session.user.id,
        name: metadata.name || '',
        employmentType: metadata.employmentType || '',
        department: metadata.department || '',
        team: metadata.team || '',
        position: metadata.position || '',
        username: session.user.email || '',
        gender: metadata.gender || 'Male',
        civilStatus: metadata.civilStatus || 'Single',
        soloParent: metadata.soloParent || 'No'
      });

      fetchRequests();
      
      // Strict Redirection Flow:
      // Only transition to selection if we are on the auth page AND it's not a fresh signup
      // (The EmployeeProfile page handles the signup->logout->login requirement)
      const isSignupInProgress = localStorage.getItem('nexus_signup_active') === 'true';
      if (currentStep === 'auth' && !isSignupInProgress) {
        setCurrentStep('selection');
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
        formType: row.form_type,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
      }));
      setRequests(formattedRequests);
    }
  };

  const handleSubmitRequest = async (request: AnyRequest) => {
    // Destructure to separate specific fields from the form data
    const { id, employeeId: _unused, formType, status, createdAt, ...data } = request;
    
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || '';
    
    let error;
    if (editingRequest) {
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          employee_id: currentUserId,
          form_type: formType,
          status: status,
          data: data,
          user_id: currentUserId
        })
        .eq('id', id);
      error = updateError;
    } else {
      // Insert only specific fields. id and created_at are auto-generated.
      const { error: insertError } = await supabase
        .from('requests')
        .insert({
          employee_id: currentUserId, // Using UUID linked to auth.uid()
          form_type: formType,
          status: status,
          data: data,
          user_id: currentUserId
        });
      error = insertError;
    }

    if (error) {
      console.error("Supabase error:", error);
      alert("Error saving to database: " + error.message);
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
          alert("Error deleting from database: " + error.message);
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
      case 'selection':
        return <FormSelectionPage onSelect={(type) => { setActiveFormType(type); setCurrentStep('form'); }} onViewHistory={() => setCurrentStep('history')} />;
      case 'form':
        if (!activeFormType) return null;
        const formProps = {
          onSubmit: handleSubmitRequest,
          onCancel: () => {
            setCurrentStep('selection');
            setEditingRequest(null);
          },
          initialData: editingRequest
        };
        switch (activeFormType) {
          case FormType.LEAVE: return <LeaveForm {...formProps} profile={profile} requests={requests} />;
          case FormType.BUSINESS_TRIP: return <BusinessTripForm {...formProps} />;
          case FormType.OVERTIME: return <OvertimeForm {...formProps} />;
          case FormType.ATTENDANCE: return <AttendanceForm {...formProps} profile={profile} />;
          case FormType.LETTER: return <LetterRequestForm {...formProps} />;
          default: return null;
        }
      case 'history':
        return (
          <HistoryPage 
            requests={requests} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onNewRequest={() => setCurrentStep('selection')} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      profile={profile} 
      onEditProfile={() => setCurrentStep('auth')}
      onGoHome={() => isLoggedIn ? setCurrentStep('selection') : null}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;
