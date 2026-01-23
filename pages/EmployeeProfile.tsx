
import React, { useState } from 'react';
import { EmployeeProfile, EmploymentType } from '../types';
import { DEPARTMENTS, TEAMS, POSITIONS } from '../constants';
import { User, Briefcase, Building, Users, ShieldCheck, Key, Lock, Eye, EyeOff, Heart, HelpCircle } from 'lucide-react';

interface Props {
  onSubmit: (data: EmployeeProfile) => void;
  onLogin: (success: boolean) => void;
  savedProfile: EmployeeProfile | null;
}

const AuthPage: React.FC<Props> = ({ onSubmit, onLogin, savedProfile }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Signup State
  const [signupData, setSignupData] = useState<EmployeeProfile>({
    name: '',
    employmentType: EmploymentType.REGULAR,
    department: '',
    team: '',
    position: '',
    gender: 'Male',
    civilStatus: 'Single',
    soloParent: 'No',
    username: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    onSubmit(signupData);
    // Redirect to the login page after successful signup as per requirement
    setMode('login');
    alert("Account created successfully! Please log in.");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (savedProfile && loginUsername === savedProfile.username && loginPassword === savedProfile.password) {
      onLogin(true);
    } else {
      alert("Invalid username or password.");
      onLogin(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!savedProfile) {
      alert("No profile found to reset. Please sign up first.");
      setMode('signup');
      return;
    }
    
    const updatedProfile = { ...savedProfile, password: newPassword };
    onSubmit(updatedProfile);
    alert("Password updated successfully! Please log in.");
    setMode('login');
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-[#D1D5DB] outline-none transition-all bg-white text-slate-900 focus:border-[#083D77]";
  const labelClasses = "block text-sm font-semibold text-[#083D77] mb-1.5 flex items-center gap-2";
  const rowClasses = "w-full mb-6";

  if (mode === 'signup') {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#083D77] mb-3">Create Your Account</h1>
          <p className="text-slate-500">Join the Nexus HR portal by providing your personal and professional details.</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#F2F4F7] rounded-3xl border border-[#D1D5DB] p-8 md:p-12 shadow-sm">
          
          <div className={rowClasses}>
            <label className={labelClasses}><User className="w-4 h-4" /> Full Employee Name*</label>
            <input
              type="text"
              required
              className={inputClasses}
              placeholder="e.g. Jane Smith"
              value={signupData.name}
              onChange={e => setSignupData({ ...signupData, name: e.target.value })}
            />
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><ShieldCheck className="w-4 h-4" /> Employment Type*</label>
            <select
              required
              className={inputClasses}
              value={signupData.employmentType}
              onChange={e => setSignupData({ ...signupData, employmentType: e.target.value as EmploymentType })}
            >
              {Object.values(EmploymentType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Building className="w-4 h-4" /> Department*</label>
            <input
              list="dept-options"
              required
              className={inputClasses}
              placeholder="Select or enter department"
              value={signupData.department}
              onChange={e => setSignupData({ ...signupData, department: e.target.value })}
            />
            <datalist id="dept-options">
              {DEPARTMENTS.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Users className="w-4 h-4" /> Team*</label>
            <input
              list="team-options"
              required
              className={inputClasses}
              placeholder="Select or enter team"
              value={signupData.team}
              onChange={e => setSignupData({ ...signupData, team: e.target.value })}
            />
            <datalist id="team-options">
              {TEAMS.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Briefcase className="w-4 h-4" /> Position*</label>
            <input
              list="pos-options"
              required
              className={inputClasses}
              placeholder="Select or enter position"
              value={signupData.position}
              onChange={e => setSignupData({ ...signupData, position: e.target.value })}
            />
            <datalist id="pos-options">
              {POSITIONS.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><User className="w-4 h-4" /> Gender*</label>
            <select
              required
              className={inputClasses}
              value={signupData.gender}
              onChange={e => setSignupData({ ...signupData, gender: e.target.value as any })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Heart className="w-4 h-4" /> Civil Status*</label>
            <select
              required
              className={inputClasses}
              value={signupData.civilStatus}
              onChange={e => setSignupData({ ...signupData, civilStatus: e.target.value as any })}
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
              <option value="Annulled">Annulled</option>
            </select>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><HelpCircle className="w-4 h-4" /> Solo Parent*</label>
            <select
              required
              className={inputClasses}
              value={signupData.soloParent}
              onChange={e => setSignupData({ ...signupData, soloParent: e.target.value as any })}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Key className="w-4 h-4" /> Username*</label>
            <input
              type="text"
              required
              className={inputClasses}
              placeholder="Choose a unique username"
              value={signupData.username}
              onChange={e => setSignupData({ ...signupData, username: e.target.value })}
            />
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Lock className="w-4 h-4" /> Password*</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={inputClasses}
                placeholder="Secure password"
                value={signupData.password}
                onChange={e => setSignupData({ ...signupData, password: e.target.value })}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#083D77]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Lock className="w-4 h-4" /> Confirm Password*</label>
            <input
              type="password"
              required
              className={inputClasses}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-4 bg-[#083D77] text-white rounded-xl font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Sign Up & Get Started
            </button>
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <button type="button" onClick={() => setMode('login')} className="text-[#083D77] font-bold hover:underline">Log In</button>
          </p>
        </form>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="max-md mx-auto animate-fadeIn mt-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#083D77] mb-3">Reset Password</h1>
          <p className="text-slate-500">Create a new secure password for your account.</p>
        </div>

        <form onSubmit={handleResetPassword} className="bg-[#F2F4F7] rounded-3xl border border-[#D1D5DB] p-8 md:p-10 shadow-sm">
          <div className={rowClasses}>
            <label className={labelClasses}><Lock className="w-4 h-4" /> New Password*</label>
            <input
              type="password"
              required
              className={inputClasses}
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Lock className="w-4 h-4" /> Confirm New Password*</label>
            <input
              type="password"
              required
              className={inputClasses}
              placeholder="Repeat new password"
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-[#083D77] text-white rounded-xl font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Update Password
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-center text-sm text-[#083D77] font-bold mt-6 hover:underline"
          >
            Back to Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fadeIn mt-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#083D77] mb-3">Welcome Back</h1>
        <p className="text-slate-500">Enter your credentials to access the portal.</p>
      </div>

      <form onSubmit={handleLogin} className="bg-[#F2F4F7] rounded-3xl border border-[#D1D5DB] p-8 md:p-10 shadow-sm">
        <div className={rowClasses}>
          <label className={labelClasses}><Key className="w-4 h-4" /> Username</label>
          <input
            type="text"
            required
            className={inputClasses}
            placeholder="Your username"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
          />
        </div>

        <div className={rowClasses}>
          <label className={labelClasses}><Lock className="w-4 h-4" /> Password</label>
          <input
            type="password"
            required
            className={inputClasses}
            placeholder="Your password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end mb-6">
          <button 
            type="button" 
            onClick={() => setMode('forgot')}
            className="text-sm font-bold text-[#083D77] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-[#083D77] text-white rounded-xl font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Log In
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-[#083D77] font-bold hover:underline">Sign Up</button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
