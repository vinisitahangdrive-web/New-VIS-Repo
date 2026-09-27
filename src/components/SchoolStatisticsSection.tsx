import React from 'react';
import { SchoolInfo } from '../types';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  Briefcase, 
  BarChart3, 
  CheckCircle2, 
  Pencil,
  Building,
  School,
  GitBranch
} from 'lucide-react';

interface SchoolStatisticsSectionProps {
  schoolInfo: SchoolInfo;
  isAdmin: boolean;
  onOpenSettings: () => void;
  onOpenPersonnelModal?: () => void;
}

export const SchoolStatisticsSection: React.FC<SchoolStatisticsSectionProps> = ({
  schoolInfo,
  isAdmin,
  onOpenSettings,
  onOpenPersonnelModal,
}) => {
  const elementary = schoolInfo.elementaryEnrolled || 0;
  const secondary = schoolInfo.secondaryEnrolled || 0;
  const totalStudents = elementary + secondary;
  const teachers = schoolInfo.teachersCount || 0;
  const nonTeachers = schoolInfo.nonTeachersCount || 0;
  const totalPersonnel = teachers + nonTeachers;
  const totalSchoolCommunity = totalStudents + totalPersonnel;

  const elementaryPercentage = totalStudents > 0 ? Math.round((elementary / totalStudents) * 100) : 0;
  const secondaryPercentage = totalStudents > 0 ? Math.round((secondary / totalStudents) * 100) : 0;
  const studentTeacherRatio = teachers > 0 ? Math.round(totalStudents / teachers) : 0;

  return (
    <section id="statistics-section" className="py-12 bg-[#f0f6f1]/60 border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/10 text-[#0f2454] border border-blue-900/25">
              <BarChart3 className="w-3.5 h-3.5 text-[#1e3a8a]" />
              DepEd BEIS & LIS Official Registry
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2454] tracking-tight">
              School Enrollment & Staffing Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Official demographic records of learners enrolled in elementary and secondary education, alongside our licensed teaching faculty and support personnel for {schoolInfo.academicYear}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Basic Education Registry
              </span>
              <span className="text-xs font-bold text-slate-800">
                {schoolInfo.district}
              </span>
            </div>

            {onOpenPersonnelModal && (
              <button
                type="button"
                id="btn-stats-view-pedigree"
                onClick={onOpenPersonnelModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-amber-700" />
                <span>Faculty Pedigree List</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                id="btn-edit-statistics"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-950/10 text-[#0f2454] hover:bg-blue-950/15 border border-blue-900/20 text-xs font-bold transition-colors cursor-pointer"
                title="Edit enrollment and staffing numbers"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Update Numbers</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. Elementary Enrolled */}
          <div className="p-6 rounded-2xl bg-white/95 border border-emerald-900/10 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Kinder – Grade 6
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <School className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Elementary Learners
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {elementary.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    enrolled
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span>Share of Learners:</span>
              <strong className="text-blue-800 font-semibold">{elementaryPercentage}%</strong>
            </div>
          </div>

          {/* 2. Secondary Enrolled */}
          <div className="p-6 rounded-2xl bg-white/95 border border-emerald-900/10 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Junior High (Grades 7–10)
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Secondary Learners
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {secondary.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    enrolled
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span>Share of Learners:</span>
              <strong className="text-amber-800 font-semibold">{secondaryPercentage}%</strong>
            </div>
          </div>

          {/* 3. Teaching Personnel */}
          <div className="p-6 rounded-2xl bg-white/95 border border-emerald-900/10 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Faculty Staff
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Teaching Personnel
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {teachers.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    teachers
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span>Learner-to-Teacher:</span>
              <div className="flex items-center gap-2">
                <strong className="text-emerald-800 font-semibold">1 : {studentTeacherRatio}</strong>
                {onOpenPersonnelModal && (
                  <button
                    type="button"
                    onClick={onOpenPersonnelModal}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                  >
                    View Roster →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Non-Teaching Personnel */}
          <div className="p-6 rounded-2xl bg-white/95 border border-emerald-900/10 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Support & Operations
                </span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Non-Teaching Personnel
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {nonTeachers.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    personnel
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Support Roles:</span>
              <div className="flex items-center gap-2">
                <strong className="text-purple-800 font-semibold">Admin, IT & Utility</strong>
                {onOpenPersonnelModal && (
                  <button
                    type="button"
                    onClick={onOpenPersonnelModal}
                    className="text-[10px] text-purple-700 hover:text-purple-800 font-bold hover:underline cursor-pointer"
                  >
                    View Staff →
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Aggregate Summary & Visual Distribution Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0a192f] via-[#0f2454] to-[#0a192f] border-t-2 border-amber-400/80 text-white shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Total Enrolled Students */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Total Enrolled Basic Education Learners
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  {totalStudents.toLocaleString()}
                </h3>
                <span className="text-xs text-blue-200 font-medium">
                  Students (K to 10)
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Combining Elementary ({elementary}) and Secondary ({secondary}) levels.
              </p>
            </div>

            {/* Total School Workforce */}
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Total School Workforce
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  {totalPersonnel.toLocaleString()}
                </h3>
                <span className="text-xs text-blue-200 font-medium">
                  Staff Members
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {teachers} Teachers and {nonTeachers} Non-Teaching personnel serving our learners.
              </p>
            </div>

            {/* Total School Community */}
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-700/80 pt-4 md:pt-0 md:pl-6">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Overall School Community
              </span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  {totalSchoolCommunity.toLocaleString()}
                </h3>
                <span className="text-xs text-blue-200 font-medium">
                  Active Population
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Vinisitahan Integrated School, Donsol West II District, Sorsogon.
              </p>
            </div>

          </div>

          {/* Enrollment Proportional Visual Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                Elementary: {elementary.toLocaleString()} ({elementaryPercentage}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
                Secondary: {secondary.toLocaleString()} ({secondaryPercentage}%)
              </span>
            </div>
            
            <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
              <div
                style={{ width: `${elementaryPercentage}%` }}
                className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                title={`Elementary: ${elementary} learners`}
              ></div>
              <div
                style={{ width: `${secondaryPercentage}%` }}
                className="h-full bg-amber-400 rounded-r-full transition-all duration-500"
                title={`Secondary: ${secondary} learners`}
              ></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified against DepEd Learner Information System (LIS) & Basic Education Information System (BEIS)</span>
            </div>
            <span className="text-slate-400">School ID: {schoolInfo.schoolId}</span>
          </div>

        </div>

      </div>
    </section>
  );
};
