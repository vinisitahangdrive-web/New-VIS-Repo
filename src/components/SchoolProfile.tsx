import React from 'react';
import { SchoolInfo, FacilityItem, PersonnelMember } from '../types';
import { DEFAULT_FACILITIES } from '../data/initialData';
import { SchoolCrest } from './SchoolCrest';
import { PersonnelAvatar } from './PersonnelAvatar';
import { 
  Building2, 
  Award, 
  Heart, 
  Shield, 
  BookOpen, 
  Compass, 
  CheckCircle, 
  Users, 
  GitBranch, 
  ChevronRight, 
  Upload, 
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Microscope,
  Monitor,
  Trophy,
  Sprout,
  GraduationCap,
  Music,
  Palette,
  Wrench,
  Layers,
  RotateCcw,
  Cloud,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface SchoolProfileProps {
  schoolInfo: SchoolInfo;
  onOpenPersonnelModal: () => void;
  personnelCount: number;
  adminOfficerName?: string;
  isAdmin?: boolean;
  personnelList?: PersonnelMember[];
  facilities?: FacilityItem[];
  onAddFacility?: () => void;
  onEditFacility?: (facility: FacilityItem) => void;
  onDeleteFacility?: (facility: FacilityItem) => void;
  onResetFacilities?: () => void;
}

const getFacilityIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Microscope': return Microscope;
    case 'Monitor': return Monitor;
    case 'Trophy': return Trophy;
    case 'BookOpen': return BookOpen;
    case 'Sprout': return Sprout;
    case 'GraduationCap': return GraduationCap;
    case 'Music': return Music;
    case 'Palette': return Palette;
    case 'Wrench': return Wrench;
    case 'Layers': return Layers;
    case 'Users': return Users;
    case 'Building2':
    default:
      return Building2;
  }
};

export const SchoolProfile: React.FC<SchoolProfileProps> = ({ 
  schoolInfo, 
  onOpenPersonnelModal,
  personnelCount,
  adminOfficerName,
  isAdmin = false,
  personnelList,
  facilities = DEFAULT_FACILITIES,
  onAddFacility,
  onEditFacility,
  onDeleteFacility,
  onResetFacilities,
}) => {
  // Derive live hierarchy officers for real-time user view
  const psdsMember = personnelList?.find((m) => m.id === 'personnel-psds' || m.category === 'district');
  const districtAOs = personnelList?.filter((m) => 
    m.category === 'district_admin_officer' || 
    (m.reportsToId === 'personnel-psds' && (m.category === 'admin_officer' || m.position.toLowerCase().includes('district') || m.position.toLowerCase().includes('admin')))
  ) || [];
  const principalMember = personnelList?.find((m) => m.id === 'personnel-principal' || m.category === 'administration');
  const schoolAOs = personnelList?.filter((m) => 
    m.category === 'admin_officer' && (!m.reportsToId || m.reportsToId !== 'personnel-psds') && !m.position.toLowerCase().includes('district')
  ) || [];
  const primarySchoolAO = schoolAOs[0] || personnelList?.find((m) => m.id === 'personnel-admin-officer');

  return (
    <section id="school-profile-section" className="py-12 bg-[#f0f6f1]/60 border-y border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/10 text-[#0f2454] border border-blue-900/25">
            <Building2 className="w-3.5 h-3.5 text-[#1e3a8a]" />
            Institutional Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2454] tracking-tight">
            About Vinisitahan Integrated School
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            A pillar of public primary and secondary basic education nestled in Barangay Vinisitahan, municipality of Donsol, Sorsogon. Proudly under the governance of Donsol West II District.
          </p>
        </div>

        {/* Prominent Faculty & Staff Pedigree Feature Card */}
        <div 
          id="faculty-pedigree-feature"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a192f] via-[#0f2454] to-[#0a192f] text-white shadow-xl border-t-2 border-amber-400/80 p-6 sm:p-8"
        >
          {/* Subtle background graphic pattern */}
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden lg:flex items-center pr-10">
            <GitBranch className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Donsol West II District Personnel Registry
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Database Auto-Updated
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Faculty, Administrative & Non-Teaching Hierarchy
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Explore the complete pedigree chart of educators and administrative leaders of Vinisitahan Integrated School — featuring the Public Schools District Supervisor (PSDS), District Administrative Officer, School Head, School Administrative Officer, Elementary & Junior High School faculty, and Non-Teaching support staff.
              </p>

              {/* Quick stats pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-blue-200">
                <span className="px-2.5 py-1 rounded-lg bg-blue-800/80 border border-blue-700/60 font-medium">
                  🏫 PSDS: <strong className="text-white">{psdsMember?.name?.split(',')[0] || "Dr. Salvacion B. Alcantara"}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-800/80 border border-blue-700/60 font-medium">
                  🏛️ District Admin: <strong className="text-white">{districtAOs[0]?.name?.split(',')[0] || "Maria Cristina L. Valenzuela"}{districtAOs.length > 1 ? ` (+${districtAOs.length - 1})` : ''}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-800/80 border border-blue-700/60 font-medium">
                  🎓 School Head: <strong className="text-white">{principalMember?.name?.split(',')[0] || schoolInfo.schoolHead}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-800/80 border border-blue-700/60 font-medium">
                  📋 School Admin: <strong className="text-white">{primarySchoolAO?.name?.split(',')[0] || adminOfficerName || "Glenda M. Escober"}{schoolAOs.length > 1 ? ` (+${schoolAOs.length - 1})` : ''}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-800/80 border border-blue-700/60 font-medium">
                  👥 Total Registry: <strong className="text-white">{personnelCount} Personnel</strong>
                </span>
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                id="btn-view-faculty-pedigree"
                onClick={onOpenPersonnelModal}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <GitBranch className="w-5 h-5 text-slate-900" />
                <span>View Full Pedigree Chart</span>
                <ChevronRight className="w-4 h-4 text-slate-900" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  id="btn-admin-manage-pedigree"
                  onClick={onOpenPersonnelModal}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/20 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Admin: Add, Edit & Delete Personnel</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Hierarchy Quick-Look Cards (Auto-Synced with Cloud Database for all users) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-blue-700" />
                  <span>Key Administrative & Faculty Leadership</span>
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Cloud Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official hierarchy tiers auto-synced across all user views in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenPersonnelModal}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore Full Tree & Faculty Roster ({personnelCount})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level 1: PSDS */}
            <div 
              onClick={onOpenPersonnelModal}
              className="p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-emerald-900/10 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <PersonnelAvatar 
                  photoUrl={psdsMember?.photoUrl} 
                  name={psdsMember?.name || "PSDS"} 
                  category="district" 
                  size="md" 
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                    Level 1 • District Supervisor
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    {psdsMember?.name || "Dr. Salvacion B. Alcantara, EdD"}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {psdsMember?.position || "Public Schools District Supervisor"}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Donsol West II District</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>

            {/* Level 2: District Administrative Officer(s) */}
            <div 
              onClick={onOpenPersonnelModal}
              className="p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-emerald-900/10 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <PersonnelAvatar 
                  photoUrl={districtAOs[0]?.photoUrl} 
                  name={districtAOs[0]?.name || "District AO"} 
                  category="admin_officer" 
                  size="md" 
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <span>Level 2 • District AO</span>
                    {districtAOs.length > 1 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px]">
                        {districtAOs.length} Officers
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    {districtAOs[0]?.name || "Maria Cristina L. Valenzuela"}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {districtAOs[0]?.position || "Administrative Officer II • District"}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>District Administrative Office</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>

            {/* Level 3: School Head / Principal */}
            <div 
              onClick={onOpenPersonnelModal}
              className="p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-emerald-900/10 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <PersonnelAvatar 
                  photoUrl={principalMember?.photoUrl} 
                  name={principalMember?.name || schoolInfo.schoolHead} 
                  category="administration" 
                  size="md" 
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                    Level 3 • School Head
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    {principalMember?.name || schoolInfo.schoolHead}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {principalMember?.position || schoolInfo.headTitle}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>Office of the School Head</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>

            {/* Level 4: School Administrative Officer(s) */}
            <div 
              onClick={onOpenPersonnelModal}
              className="p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-emerald-900/10 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <PersonnelAvatar 
                  photoUrl={primarySchoolAO?.photoUrl} 
                  name={primarySchoolAO?.name || adminOfficerName || "School AO"} 
                  category="admin_officer" 
                  size="md" 
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <span>Level 4 • School AO</span>
                    {schoolAOs.length > 1 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px]">
                        {schoolAOs.length} Officers
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    {primarySchoolAO?.name || adminOfficerName || "Glenda M. Escober"}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate">
                    {primarySchoolAO?.position || "Administrative Officer II"}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>School Operations</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: School Identity */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Official Identification</h3>
              <p className="text-xs text-slate-600 mt-1">
                DepEd Basic Education Information System (BEIS) Official Records
              </p>
              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <dt className="text-slate-500 font-medium">School ID:</dt>
                  <dd className="font-mono font-bold text-blue-800">{schoolInfo.schoolId}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <dt className="text-slate-500 font-medium">District:</dt>
                  <dd className="font-semibold text-slate-800">{schoolInfo.district}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <dt className="text-slate-500 font-medium">Division:</dt>
                  <dd className="font-semibold text-slate-800">{schoolInfo.division}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <dt className="text-slate-500 font-medium">Region:</dt>
                  <dd className="font-semibold text-slate-800">{schoolInfo.region}</dd>
                </div>
                <div className="flex justify-between py-1.5">
                  <dt className="text-slate-500 font-medium">Classification:</dt>
                  <dd className="font-semibold text-emerald-700">Public Integrated School</dd>
                </div>
              </dl>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Accredited & Recognized by DepEd Philippines</span>
            </div>
          </div>

          {/* Card 2: DepEd Mission & Vision */}
          <div className="p-6 rounded-2xl bg-blue-900 text-white space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">The DepEd Vision</h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  We dream of Filipinos who passionately love their country and whose values and competencies enable them to realize their full potential and contribute meaningfully to building the nation.
                </p>
              </div>

              <div className="pt-2 border-t border-blue-800/80">
                <h3 className="text-base font-bold text-amber-300">Our Mission</h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where teachers facilitate learning and constantly nurture every learner.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-800/80 text-[11px] text-blue-200 italic">
              Vinisitahan, Donsol, Sorsogon • Inspiring Youth Since Foundation
            </div>
          </div>

          {/* Card 3: Core Values */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">DepEd Core Values</h3>
              <p className="text-xs text-slate-600 mt-1">
                The four guiding pillars ingrained in every Vinisitahan learner:
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Maka-Diyos</h4>
                    <p className="text-[11px] text-slate-500">Faith, reverence, and spiritual integrity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">2</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Makatao</h4>
                    <p className="text-[11px] text-slate-500">Respect, kindness, empathy, and service</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">3</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Makakalikasan</h4>
                    <p className="text-[11px] text-slate-500">Environmental care in our coastal town of Donsol</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
                  <span className="w-7 h-7 rounded-lg bg-red-100 text-red-800 font-bold text-xs flex items-center justify-center">4</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Makabansa</h4>
                    <p className="text-[11px] text-slate-500">Patriotism and pride in our Bicolano heritage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campus Facilities Showcase */}
        <div id="campus-facilities-section" className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">Campus Learning Facilities</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Equipping elementary and junior high learners in Vinisitahan with conducive learning environments
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    id="btn-add-facility"
                    onClick={onAddFacility}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Facility</span>
                  </button>
                  {onResetFacilities && facilities.length === 0 && (
                    <button
                      type="button"
                      onClick={onResetFacilities}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Standard</span>
                    </button>
                  )}
                </>
              )}
              <span className="hidden sm:inline-block text-xs text-blue-700 font-semibold px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100">
                Donsol West II Learning Center
              </span>
            </div>
          </div>

          {facilities.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 space-y-3">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">No Facilities Recorded Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isAdmin
                    ? 'Start building the campus directory by adding the classrooms, laboratories, and grounds of Vinisitahan Integrated School.'
                    : 'Campus facilities directory is currently being updated by school administrators.'}
                </p>
              </div>
              {isAdmin && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onAddFacility}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Facility</span>
                  </button>
                  {onResetFacilities && (
                    <button
                      type="button"
                      onClick={onResetFacilities}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Load Standard Facilities</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {facilities.map((facility) => {
                const IconComp = getFacilityIcon(facility.iconName);
                return (
                  <div
                    key={facility.id}
                    id={`facility-card-${facility.id}`}
                    className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-blue-300 transition-all overflow-hidden"
                  >
                    {/* Facility Image or Header Banner */}
                    {facility.imageUrl ? (
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={facility.imageUrl}
                          alt={facility.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          {facility.category && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-900/90 text-white backdrop-blur-xs shadow-xs">
                              {facility.category}
                            </span>
                          )}
                        </div>
                        {facility.capacity && (
                          <div className="absolute bottom-2.5 left-2.5 text-[11px] font-semibold text-white/95 drop-shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>{facility.capacity}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            {facility.category && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                {facility.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {facility.capacity && (
                          <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {facility.capacity}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Facility Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          {!facility.imageUrl && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                          )}
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {facility.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {facility.desc}
                        </p>
                      </div>

                      {/* Admin Action Buttons (Edit / Delete) */}
                      {isAdmin && (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditFacility && onEditFacility(facility)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit this facility"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteFacility && onDeleteFacility(facility)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete this facility"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
