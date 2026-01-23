import React from 'react';
import { EmployeeProfile } from '../types';
import { LayoutDashboard, UserCircle, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  profile: EmployeeProfile | null;
  onEditProfile: () => void;
  onGoHome: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, profile, onEditProfile, onGoHome, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onGoHome}>
            <div className="bg-[#083D77] p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#083D77] to-indigo-800">
              Nexus HR
            </span>
          </div>

          {profile && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900">{profile.name}</span>
                <span className="text-xs text-slate-500">{profile.position} • {profile.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onEditProfile}
                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  title="Profile"
                >
                  <UserCircle className="w-8 h-8 text-slate-400 hover:text-[#083D77] transition-colors" />
                </button>
                <button 
                  onClick={onLogout}
                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6 text-slate-400 hover:text-rose-600 transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Nexus HR Employee Concern Portal. v1.0.2 • Built for efficiency.
        </div>
      </footer>
    </div>
  );
};