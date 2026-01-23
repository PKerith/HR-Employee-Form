
import React, { useState, useEffect } from 'react';
import { EmployeeProfile, FormType, AnyRequest, RequestStatus } from './types';
import AuthPage from './pages/EmployeeProfile';
import FormSelectionPage from './pages/FormSelection';
import LeaveForm from './pages/Forms/LeaveForm';
import BusinessTripForm from './pages/Forms/BusinessTripForm';
import OvertimeForm from './pages/Forms/OvertimeForm';
import AttendanceForm from './pages/Forms/AttendanceForm';
import LetterRequestForm from './pages/Forms/LetterRequestForm';
import HistoryPage from './pages/History';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(() => {
    const saved = localStorage.getItem('employee_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [requests, setRequests] = useState<AnyRequest[]>(() => {
    const saved = localStorage.getItem('employee_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentStep, setCurrentStep] = useState<'auth' | 'selection' | 'form' | 'history'>('auth');
  const [activeFormType, setActiveFormType] = useState<FormType | null>(null);
  const [editingRequest, setEditingRequest] = useState<AnyRequest | null>(null);

  useEffect(() => {
    if (profile && isLoggedIn) {
      localStorage.setItem('employee_profile', JSON.stringify(profile));
      if (currentStep === 'auth') setCurrentStep('selection');
    } else {
      setCurrentStep('auth');
    }
  }, [profile, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('employee_requests', JSON.stringify(requests));
  }, [requests]);

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

  const handleSubmitRequest = (request: AnyRequest) => {
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

  const handleDelete = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const timePassed = Date.now() - request.createdAt;
    const isWithin24h = timePassed < 24 * 60 * 60 * 1000;

    if (request.status === RequestStatus.PENDING && isWithin24h) {
      if (window.confirm("Are you sure you want to delete this request?")) {
        setRequests(prev => prev.filter(r => r.id !== id));
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
