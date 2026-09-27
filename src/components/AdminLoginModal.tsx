import React, { useState } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { AdminUser } from '../types';
import { auth, googleProvider, isAuthPopupCancellation } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  adminPasswordHash: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  adminPasswordHash,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check credentials against standard or stored password
    const validUsers = ['admin', 'vinisitahan', 'vinisitahangdrive@gmail.com', 'principal', 'ict'];
    const isUserValid = validUsers.includes(cleanUser) || cleanUser.length > 0;
    
    // Strict password validation: ONLY the active administrator password is valid!
    // Old and default passwords are permanently rejected once updated.
    const isPassValid = cleanPass === adminPasswordHash;

    if (isUserValid && isPassValid) {
      const userObj: AdminUser = {
        username: cleanUser || 'admin',
        role: 'School Administrator',
        displayName: 'School Head / Administrator',
        email: 'vinisitahangdrive@gmail.com',
      };
      onLoginSuccess(userObj);
      onClose();
    } else {
      setError('Invalid Administrator Credentials. Please check username or password.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (isSigningInWithGoogle) return;
    setIsSigningInWithGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userObj: AdminUser = {
          username: result.user.email?.split('@')[0] || 'admin',
          role: 'School Administrator',
          displayName: result.user.displayName || 'School Head / Administrator',
          email: result.user.email || 'vinisitahangdrive@gmail.com',
        };
        onLoginSuccess(userObj);
        onClose();
      }
    } catch (err: unknown) {
      if (isAuthPopupCancellation(err)) {
        console.info('Admin Google Sign-in was cancelled by user.');
        setError('Sign-in was cancelled. Please try again when ready.');
      } else {
        console.error('Google Sign In failed:', err);
        const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or encountered an issue.';
        setError(msg);
      }
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  const isDefaultPassword = adminPasswordHash === 'vis502996';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-admin-login"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Top ribbon banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Administrator Portal
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Vinisitahan Integrated School (School ID: 502996)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningInWithGoogle}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningInWithGoogle ? 'Connecting to Google...' : 'Sign in with Google (School Admin)'}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Or with Admin Password
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Admin Username or Official Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. admin or vinisitahangdrive@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Security Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="input-admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter current admin password"
                className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Credentials Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700">
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isDefaultPassword ? 'Default Credentials:' : 'Active Password Set:'}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {isDefaultPassword ? (
                <>User: <code className="font-mono font-bold text-slate-800">admin</code> • Pass: <code className="font-mono font-bold text-slate-800">vis502996</code></>
              ) : (
                <>Administrator has updated the password. Only the updated password is valid across all computers.</>
              )}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="btn-submit-admin-login"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide uppercase transition-colors shadow-sm cursor-pointer"
            >
              Sign In to Admin Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
