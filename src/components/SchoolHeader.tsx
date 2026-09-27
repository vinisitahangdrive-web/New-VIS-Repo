import React from 'react';
import { SchoolInfo } from '../types';
import { SchoolCrest } from './SchoolCrest';
import { MapPin, Mail, Phone, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface SchoolHeaderProps {
  schoolInfo: SchoolInfo;
  isAdmin: boolean;
  onOpenLogoModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenGmail?: (to?: string, subject?: string) => void;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  schoolInfo,
  isAdmin,
  onOpenLogoModal,
  onOpenSettingsModal,
  onOpenGmail,
}) => {
  return (
    <header id="main-school-header" className="w-full bg-white/95 backdrop-blur-xs border-b-2 border-amber-500/30 shadow-xs">
      {/* DepEd Official Top Ribbon */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0f2454] to-slate-950 text-slate-200 text-xs py-1.5 px-4 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[11px] sm:text-xs text-slate-300 font-medium">
            <span className="text-amber-400 font-semibold tracking-wider uppercase">Republic of the Philippines</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>Department of Education</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>Region V (Bicol)</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="text-slate-300">{schoolInfo.division}</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="text-amber-300 font-medium">{schoolInfo.district}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DepEd Basic Education Information System (BEIS)</span>
            </div>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] border border-amber-400/30">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Admin Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6 text-center md:text-left">
          
          {/* Logo with Admin quick-action overlay */}
          <div className="relative group shrink-0">
            <SchoolCrest
              customLogoUrl={schoolInfo.logoUrl}
              size="lg"
              schoolName={schoolInfo.name}
              schoolId={schoolInfo.schoolId}
            />

            {isAdmin && (
              <button
                type="button"
                id="btn-quick-change-logo"
                onClick={onOpenLogoModal}
                className="absolute inset-0 rounded-full bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium p-1 cursor-pointer"
                title="Click to change or upload school logo"
              >
                <Sparkles className="w-4 h-4 text-amber-300 mb-0.5" />
                Change Logo
              </button>
            )}
          </div>

          {/* School Titles and Official Credentials */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-950/10 text-[#0f2454] border border-blue-900/25">
                School ID: {schoolInfo.schoolId}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-950 border border-amber-500/35">
                <Award className="w-3 h-3 text-amber-600" />
                {schoolInfo.district}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-800/10 text-emerald-900 border border-emerald-700/25">
                Integrated (K - Grade 10)
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f2454] tracking-tight" style={{ fontFamily: "'Cinzel', serif, Georgia" }}>
                {schoolInfo.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-0.5 italic">
                "{schoolInfo.motto}"
              </p>
            </div>

            {/* Geographical & Contact Summary */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{schoolInfo.address}</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {onOpenGmail ? (
                  <button
                    type="button"
                    onClick={() => onOpenGmail(schoolInfo.email, `Inquiry to ${schoolInfo.name}`)}
                    className="hover:underline text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                    title="Compose email via official School Gmail Desk"
                  >
                    <span>{schoolInfo.email}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold border border-red-200">Gmail</span>
                  </button>
                ) : (
                  <a href={`mailto:${schoolInfo.email}`} className="hover:underline text-blue-700">
                    {schoolInfo.email}
                  </a>
                )}
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{schoolInfo.contactNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Admin Actions Box */}
          {isAdmin && (
            <div className="hidden lg:flex flex-col items-end justify-center gap-2 pl-4 border-l border-slate-200 shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin Controls
              </span>
              <div className="flex flex-col gap-1.5 w-full">
                <button
                  type="button"
                  id="btn-header-edit-logo"
                  onClick={onOpenLogoModal}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>Upload / Set Logo</span>
                  <span className="text-blue-500 font-bold">✎</span>
                </button>
                <button
                  type="button"
                  id="btn-header-edit-info"
                  onClick={onOpenSettingsModal}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>School Details</span>
                  <span className="text-slate-500 font-bold">⚙</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Marquee / Announcement Ticker */}
      {schoolInfo.announcementTicker && (
        <div className="bg-[#0f2454] text-white border-t border-amber-500/40 text-xs py-2 px-4 overflow-hidden shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="shrink-0 flex items-center gap-1.5 font-bold tracking-wider uppercase text-[11px] bg-amber-400 text-[#0f2454] px-2 py-0.5 rounded shadow-xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              ADVISORY
            </div>
            <div className="overflow-hidden whitespace-nowrap w-full">
              <p className="inline-block font-medium text-amber-50 tracking-wide animate-marquee">
                {schoolInfo.announcementTicker}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
