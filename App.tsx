
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
  const [profile, setProfile] = useState<EmployeeProfile | null>(() => {
    const saved = localStorage.getItem('employee_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [requests, setRequests] = useState<AnyRequest[]>([]);

  useEffect(() => {
    if (profile && isLoggedIn) {
      localStorage.setItem('employee_profile', JSON.stringify(profile));
      if (currentStep === 'auth') setCurrentStep('selection');
      fetchRequests();
    } else {
      setCurrentStep('auth');
    }
  }, [profile, isLoggedIn]);

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
        createdAt: row.created_at
      }));
      setRequests(formattedRequests);
    }
  };

  const [currentStep, setCurrentStep] = useState<'auth' | 'selection' | 'form' | 'history'>('auth');
  const [activeFormType, setActiveFormType] = useState<FormType | null>(null);
  const [editingRequest, setEditingRequest] = useState<AnyRequest | null>(null);

  const handleProfileSubmit = (data: EmployeeProfile) => {
    setProfile(data);
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setCurrentStep('selection');
    }
  };

  const handleFormSelect = (type: FormType) => {
    setActiveFormType(type);
    setCurrentStep('form');
  };

  const handleSubmitRequest = async (request: AnyRequest) => {
    const { id, employeeId, formType, status, createdAt, ...data } = request;
    
    const { error } = await supabase
      .from('requests')
      .upsert({
        id,
        employee_id: employeeId,
        form_type: formType,
        status,
        created_at: createdAt,
        data: data
      });

    if (error) {
      alert("Error saving to database: " + error.message);
      return;
    }

    if (editingRequest) {
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? request : r));
      setEditingRequest(null);
    } else {
      setRequests(prev => [request, ...prev]);
    }
    setCurrentStep('history');
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
        return (
          <AuthPage 
            onSubmit={handleProfileSubmit} 
            onLogin={handleLogin}
            savedProfile={profile} 
          />
        );
      case 'selection':
        return <FormSelectionPage onSelect={handleFormSelect} onViewHistory={() => setCurrentStep('history')} />;
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
      profile={isLoggedIn ? profile : null} 
      onEditProfile={() => setCurrentStep('auth')}
      onGoHome={() => isLoggedIn ? setCurrentStep('selection') : null}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;
