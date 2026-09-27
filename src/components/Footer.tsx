import React from 'react';
import { SchoolInfo } from '../types';
import { SchoolCrest } from './SchoolCrest';
import { MapPin, Mail, Phone, Lock, Heart } from 'lucide-react';

interface FooterProps {
  schoolInfo: SchoolInfo;
  onOpenLogin: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  schoolInfo,
  onOpenLogin,
  isAdmin,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-school-footer" className="bg-[#0a192f] text-slate-300 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: School Identity */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <SchoolCrest
                customLogoUrl={schoolInfo.logoUrl}
                size="md"
                schoolName={schoolInfo.name}
                schoolId={schoolInfo.schoolId}
              />
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide font-serif">
                  {schoolInfo.name}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">
                  School ID: {schoolInfo.schoolId} • {schoolInfo.district}
                </p>
                <p className="text-xs text-slate-400">
                  {schoolInfo.division} • {schoolInfo.region}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Dedicated to delivering quality, accessible, and holistic basic education (Kindergarten to Grade 10) for every learner in Barangay Vinisitahan and Donsol West II District, Sorsogon.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                DepEd Matatag
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                K to 10 Basic Education
              </span>
            </div>
          </div>

          {/* Col 2: Campus Address & Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Official Campus
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">
                  {schoolInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${schoolInfo.email}`} className="text-slate-300 hover:text-white underline break-all">
                  {schoolInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{schoolInfo.contactNumber}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links & Admin */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              School Administration
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#posts-section" className="hover:text-amber-400 transition-colors">
                  Announcements & Circulars
                </a>
              </li>
              <li>
                <a href="#statistics-section" className="hover:text-amber-400 transition-colors">
                  Enrollment & Personnel Statistics
                </a>
              </li>
              <li>
                <a href="#school-profile-section" className="hover:text-amber-400 transition-colors">
                  DepEd BEIS Identification
                </a>
              </li>
              <li>
                <a href="#academics-section" className="hover:text-amber-400 transition-colors">
                  Integrated Curriculum (K-10)
                </a>
              </li>
              <li>
                <a href="#contact-section" className="hover:text-amber-400 transition-colors">
                  Learner Records & Inquiries
                </a>
              </li>
            </ul>

            <div className="pt-2">
              {!isAdmin && (
                <button
                  type="button"
                  id="btn-footer-admin-login"
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors py-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Administrator Sign-in</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Vinisitahan Integrated School (School ID: {schoolInfo.schoolId}). All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            <span>Donsol West II District, SDO Sorsogon</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
