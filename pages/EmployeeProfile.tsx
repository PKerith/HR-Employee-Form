import React, { useState } from 'react';
import { EmployeeProfile, EmploymentType } from '../types.ts';
import { DEPARTMENTS, TEAMS, POSITIONS } from '../constants.tsx';
import { User, Briefcase, Building, Users, ShieldCheck, Key, Lock, Eye, EyeOff, Mail, BadgeCheck } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface Props {
  onSubmit: (data: EmployeeProfile) => void;
  onLogin: (success: boolean) => void;
  savedProfile: EmployeeProfile | null;
}

const AuthPage: React.FC<Props> = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    employmentType: EmploymentType.REGULAR,
    department: '',
    team: '',
    position: '',
    gender: 'Male' as 'Male' | 'Female',
    civilStatus: 'Single' as any,
    soloParent: 'No' as 'Yes' | 'No',
    email: '',
    username: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Corrected handleSignup
  // const handleSignup = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (signupData.password !== confirmPassword) {
  //     alert("Passwords do not match!");
  //     return;
  //   }

  //   setLoading(true);

  //   const { data, error } = await supabase.auth.signUp({
  //     email: signupData.email,
  //     password: signupData.password,
  //     options: {
  //       data: {
  //         full_name: signupData.name,
  //         username: signupData.username,
  //         employment_type: signupData.employmentType,
  //         department: signupData.department,
  //         team: signupData.team,
  //         position: signupData.position,
  //         gender: signupData.gender,
  //         civil_status: signupData.civilStatus,
  //         solo_parent: signupData.soloParent,
  //         role: 'user'
  //       }
  //     }
  //   });

  //   if (error) {
  //     alert("Signup failed: " + error.message);
  //   } else {
  //     await supabase.auth.signOut(); // optional: force logout for verification
  //     alert("Account created successfully! Please log in.");
  //     setMode('login'); // switch to login form
  //   }

  //   setLoading(false);
  // };

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (signupData.password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  setLoading(true);

try {
    // 1️⃣ Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: signupData.email,
    password: signupData.password
  });

    if (authError) {
    alert("Signup failed: " + authError.message);
    setLoading(false);
    return;
  }

  if (!authData.user?.id) {
    alert("Signun failed: User ID not returned from Auth");
    setLoading(false);
    return;
  }

  const generateEmployeeId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000 );
    return 'EMP-${randomNum}';
  };
  const employeeId = generateEmployeeId();

  // 2️⃣ Insert user into profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('app_profiles') // <-- replace with your table name if different
    .insert({
      user_id: authData.user.id,           // Must match the Auth user ID
      email: signupData.email,
      full_name: signupData.name,
      username: signupData.username,
      employment_type: signupData.employmentType,
      department: signupData.department,
      team: signupData.team,
      position: signupData.position,
      gender: signupData.gender,
      civil_status: signupData.civilStatus,
      solo_parent: signupData.soloParent,
      role: 'user',
      employee_id: employeeId
    });

  if (profileError) {
    console.error("Supabase insert error full object:", profileError);
    alert("Signup failed (DB): " + profileError.message);
    setLoading(false);
    return;
  }

  // 3️⃣ Optional: sign out new user
  await supabase.auth.signOut();

  alert("Account created successfully! Your Employee ID is ${employeeId}. Please log in.");
  setMode('login');
  setLoading(false);

} catch (err) {
  console.error("Unexpected signup error:", err);
  alert("Signup failed: Unexpected error");
  setLoading(false);
}

};


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginUsername,
      password: loginPassword,
    });

    setLoading(false);
    if (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Reset link sent to your email!");
      setMode('login');
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-[#D1D5DB] outline-none transition-all bg-white text-slate-900 focus:border-[#083D77] disabled:opacity-50";
  const labelClasses = "block text-sm font-semibold text-[#083D77] mb-1.5 flex items-center gap-2";
  const rowClasses = "w-full mb-6";

  if (mode === 'signup') {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#083D77] mb-3">Create Your Account</h1>
          <p className="text-slate-500">Join the Nexus HR portal by providing your professional details.</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#F2F4F7] rounded-3xl border border-[#D1D5DB] p-8 md:p-12 shadow-sm">
          {/* Full Name */}
          <div className={rowClasses}>
            <label className={labelClasses}><User className="w-4 h-4" /> Full Employee Name*</label>
            <input type="text" required className={inputClasses} value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} />
          </div>

          {/* Employment Type */}
          <div className={rowClasses}>
            <label className={labelClasses}><ShieldCheck className="w-4 h-4" /> Employment Type*</label>
            <select required className={inputClasses} value={signupData.employmentType} onChange={e => setSignupData({ ...signupData, employmentType: e.target.value as EmploymentType })}>
              {Object.values(EmploymentType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          {/* Department & Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className={rowClasses}>
              <label className={labelClasses}><Building className="w-4 h-4" /> Department*</label>
              <input list="dept-options" required className={inputClasses} value={signupData.department} onChange={e => setSignupData({ ...signupData, department: e.target.value })} />
              <datalist id="dept-options">{DEPARTMENTS.map(d => <option key={d} value={d} />)}</datalist>
            </div>
            <div className={rowClasses}>
              <label className={labelClasses}><Users className="w-4 h-4" /> Team*</label>
              <input list="team-options" required className={inputClasses} value={signupData.team} onChange={e => setSignupData({ ...signupData, team: e.target.value })} />
              <datalist id="team-options">{TEAMS.map(t => <option key={t} value={t} />)}</datalist>
            </div>
          </div>

          {/* Position */}
          <div className={rowClasses}>
            <label className={labelClasses}><Briefcase className="w-4 h-4" /> Position*</label>
            <input list="pos-options" required className={inputClasses} value={signupData.position} onChange={e => setSignupData({ ...signupData, position: e.target.value })} />
            <datalist id="pos-options">{POSITIONS.map(p => <option key={p} value={p} />)}</datalist>
          </div>

          {/* Gender, Civil Status, Solo Parent */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <div className={rowClasses}>
              <label className={labelClasses}>Gender*</label>
              <select required className={inputClasses} value={signupData.gender} onChange={e => setSignupData({ ...signupData, gender: e.target.value as any })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className={rowClasses}>
              <label className={labelClasses}>Civil Status*</label>
              <select required className={inputClasses} value={signupData.civilStatus} onChange={e => setSignupData({ ...signupData, civilStatus: e.target.value as any })}>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Annulled">Annulled</option>
              </select>
            </div>
            <div className={rowClasses}>
              <label className={labelClasses}>Solo Parent*</label>
              <select required className={inputClasses} value={signupData.soloParent} onChange={e => setSignupData({ ...signupData, soloParent: e.target.value as any })}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Email & Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className={rowClasses}>
              <label className={labelClasses}><Mail className="w-4 h-4" /> Email*</label>
              <input type="email" required className={inputClasses} placeholder="your@email.com" value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
            </div>
            <div className={rowClasses}>
              <label className={labelClasses}><BadgeCheck className="w-4 h-4" /> Username*</label>
              <input type="text" required className={inputClasses} placeholder="Display name" value={signupData.username} onChange={e => setSignupData({ ...signupData, username: e.target.value })} />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className={rowClasses}>
            <label className={labelClasses}><Lock className="w-4 h-4" /> Password*</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required className={inputClasses} value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#083D77]">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className={rowClasses}>
            <label className={labelClasses}><Lock className="w-4 h-4" /> Confirm Password*</label>
            <input type="password" required className={inputClasses} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full py-4 bg-[#083D77] text-white rounded-xl font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Sign Up & Get Started'}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <button type="button" onClick={() => setMode('login')} className="text-[#083D77] font-bold hover:underline">Log In</button>
          </p>
        </form>
      </div>
    );
  }

  // Forgot Password Form
  if (mode === 'forgot') {
    return (
      <div className="max-md mx-auto animate-fadeIn mt-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#083D77] mb-3">Reset Password</h1>
          <p className="text-slate-500">Enter your email to receive a reset link.</p>
        </div>

        <form onSubmit={handleResetPassword} className="bg-[#F2F4F7] rounded-3xl border border-[#D1D5DB] p-8 md:p-10 shadow-sm">
          <div className={rowClasses}>
            <label className={labelClasses}>Email Address*</label>
            <input type="email" required className={inputClasses} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-[#083D77] text-white rounded-xl font-bold text-lg shadow-xl hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm text-[#083D77] font-bold mt-6 hover:underline">Back to Log In</button>
        </form>
      </div>
    );
  }

  // Login Form
  return (
    <div className="max-w-md mx-auto animate-fadeIn mt-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#083D77] mb-3">Welcome Back</h1>
        <p className="text-slate-500">Enter your credentials to access the portal.</p>
      </div>

      <form onSubmit={handleLogin} className="bg-[#F2F4F7] rounded-3xl border border-[#D1D5DB] p-8 md:p-10 shadow-sm">
        <div className={rowClasses}>
          <label className={labelClasses}><Mail className="w-4 h-4" /> Email</label>
          <input type="email" required className={inputClasses} placeholder="your@email.com" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
        </div>

        <div className={rowClasses}>
          <label className={labelClasses}><Lock className="w-4 h-4" /> Password</label>
          <input type="password" required className={inputClasses} placeholder="Your password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
        </div>

        <div className="flex justify-end mb-6">
          <button type="button" onClick={() => setMode('forgot')} className="text-sm font-bold text-[#083D77] hover:underline">Forgot Password?</button>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-[#083D77] text-white rounded-xl font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-[#083D77] font-bold hover:underline">Sign Up</button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
