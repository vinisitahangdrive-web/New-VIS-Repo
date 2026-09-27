import React from 'react';
import { CURRICULUM_OFFERINGS } from '../data/initialData';
import { GraduationCap, BookCheck, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AcademicPrograms: React.FC = () => {
  return (
    <section id="academics-section" className="py-12 bg-[#f7faf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/10 text-[#0f2454] border border-blue-900/25">
            <GraduationCap className="w-3.5 h-3.5 text-[#1e3a8a]" />
            Curriculum & Levels
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2454] tracking-tight">
            Integrated Basic Education Curriculum
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            As an Integrated School, Vinisitahan offers continuous, holistic schooling from early childhood through secondary education within one cohesive campus community.
          </p>
        </div>

        {/* 3 Core Curriculum Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CURRICULUM_OFFERINGS.map((curr, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:border-amber-400/80 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {curr.badge}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {curr.age}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{curr.level}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {curr.desc}
                  </p>
                </div>

                {/* Key focus areas */}
                <div className="pt-2 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>DepEd MATATAG / K to 12 Aligned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Values & Character Formation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Remediation & Reading Enhancement</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Class schedule:</span>
                <span className="font-semibold text-slate-800">Monday – Friday</span>
              </div>
            </div>
          ))}
        </div>

        {/* Co-curricular Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Learner Development Programs
              </span>
              <h3 className="text-xl font-bold">Holistic Co-Curricular & Special Programs</h3>
              <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
                Scouting (BSP & GSP), Campus Journalism, School Sports Club, Supreme Secondary Learner Government (SSLG), and Disaster Preparedness Corps.
              </p>
            </div>
            <div className="shrink-0">
              <a
                href="#posts-section"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs tracking-wide uppercase transition-colors shadow-sm"
              >
                View Latest Activities
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
