import React, { useState } from 'react';
import { SchoolInfo, AdminUser } from '../types';
import { Lock, LogOut, PlusCircle, Settings, Menu, X, Search, Image as ImageIcon, ShieldCheck, GitBranch } from 'lucide-react';

interface NavbarProps {
  schoolInfo: SchoolInfo;
  adminUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenNewPost: () => void;
  onOpenLogoModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPersonnelModal?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeNav: string;
  onNavClick: (nav: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolInfo,
  adminUser,
  onOpenLogin,
  onLogout,
  onOpenNewPost,
  onOpenLogoModal,
  onOpenSettingsModal,
  onOpenPersonnelModal,
  searchQuery,
  onSearchChange,
  activeNav,
  onNavClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: '★ Featured' },
    { id: 'posts', label: 'Bulletin & Posts' },
    { id: 'statistics', label: 'Enrollment & Staff' },
    { id: 'hli', label: 'HLI' },
    { id: 'profile', label: 'School Profile' },
    { id: 'academics', label: 'Academics (K-10)' },
    { id: 'contact', label: 'Contact & Inquiries' },
  ];

  const handleLinkClick = (id: string) => {
    onNavClick(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav id="site-navigation" className="sticky top-0 z-40 w-full bg-[#f4faf5]/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeNav === item.id
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-posts-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search announcements, memos..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 focus:bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Admin Actions / Login Button */}
          <div className="hidden sm:flex items-center gap-2">
            {onOpenPersonnelModal && (
              <button
                type="button"
                id="btn-nav-pedigree-list"
                onClick={onOpenPersonnelModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer"
                title="View Faculty, School Head & PSDS Hierarchy"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden lg:inline">Faculty Pedigree</span>
              </button>
            )}

            {adminUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-nav-new-post"
                  onClick={onOpenNewPost}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>New Post</span>
                </button>
                <button
                  type="button"
                  id="btn-nav-logo"
                  onClick={onOpenLogoModal}
                  className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Upload or change school logo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="btn-nav-settings"
                  onClick={onOpenSettingsModal}
                  className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="School Profile Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="btn-nav-logout"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100"
                  title="Sign out administrator"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-nav-admin-login"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-lg transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-700" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  activeNav === item.id
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {onOpenPersonnelModal && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPersonnelModal();
                }}
                className="text-left px-3 py-2 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                <span>Faculty & Staff Pedigree Chart</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            {adminUser ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 px-2 py-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Session Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNewPost();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Create New Post</span>
                </button>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogoModal();
                    }}
                    className="px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-center"
                  >
                    Change Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSettingsModal();
                    }}
                    className="px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-center"
                  >
                    School Info
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-blue-700" />
                <span>Admin Login Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
