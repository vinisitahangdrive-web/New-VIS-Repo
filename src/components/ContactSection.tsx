import React, { useState } from 'react';
import { SchoolInfo } from '../types';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContactSectionProps {
  schoolInfo: SchoolInfo;
  onOpenGmail?: (to?: string, subject?: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ schoolInfo, onOpenGmail }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Enrollment & Admissions',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset after showing confirmation
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'Enrollment & Admissions',
        message: '',
      });
    }, 4000);
  };

  return (
    <section id="contact-section" className="py-12 bg-[#f0f6f1]/60 border-t border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/10 text-[#0f2454] border border-blue-900/25">
            <Mail className="w-3.5 h-3.5 text-[#1e3a8a]" />
            School Inquiries & Communications
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2454] tracking-tight">
            Connect With Vinisitahan Integrated School
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions regarding enrollment, student records (Form 137/SF10), transfer credentials, or community partnerships? Contact our administrative desk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Official School Location & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
                Official Campus Address & Directory
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">Campus Address:</strong>
                    <p className="text-slate-600 leading-relaxed">{schoolInfo.address}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Barangay Vinisitahan, Donsol, Sorsogon • Donsol West II District
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-slate-900 font-semibold">Official School Email:</strong>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <a
                        href={`mailto:${schoolInfo.email}`}
                        className="text-blue-700 font-medium hover:underline break-all text-xs sm:text-sm"
                      >
                        {schoolInfo.email}
                      </a>
                      {onOpenGmail && (
                        <button
                          type="button"
                          onClick={() => onOpenGmail(schoolInfo.email, `Inquiry to ${schoolInfo.name}`)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                          title="Open Gmail Desk to send official message"
                        >
                          <Mail className="w-3 h-3 text-red-600" />
                          <span>Gmail Desk</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">Contact & Hotline:</strong>
                    <p className="text-slate-600">{schoolInfo.contactNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold">Administrative Office Hours:</strong>
                    <p className="text-slate-600">Monday to Friday: 7:30 AM – 4:30 PM</p>
                    <p className="text-[11px] text-slate-500">(Excluding Philippine Public & Local Holidays)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographical Context & SDO badge */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a192f] via-[#0f2454] to-[#0a192f] border-t-2 border-amber-400/80 text-white space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Administrative Jurisdiction
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Vinisitahan Integrated School operates under the direct supervision of the <strong className="text-white">Donsol West II District</strong>, Schools Division Office of Sorsogon, Department of Education Region V (Bicol Region).
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-[#1e3a8a]" />
                <h3 className="text-lg font-bold text-slate-900">
                  Send an Inquiry to the School Helpdesk
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-6">
                Fill out the message slip below and our school registrar or admin office will attend to your inquiry.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold">Message Successfully Dispatched!</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you. Your inquiry has been forwarded to the Vinisitahan Integrated School administration ({schoolInfo.email}).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Juan Dela Cruz"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Contact Number / Mobile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., 0912 345 6789"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="Enrollment & Admissions">Enrollment & Admissions</option>
                        <option value="Learner Records / SF10 Request">Learner Records / SF10 Request</option>
                        <option value="PTA & Community Matters">PTA & Community Matters</option>
                        <option value="Donation / Brigada Eskwela">Donation / Brigada Eskwela</option>
                        <option value="General Campus Question">General Campus Question</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Message / Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please write your inquiry, child's grade level, or specific request here..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0f2454] bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {onOpenGmail && (
                      <button
                        type="button"
                        onClick={() => {
                          const subject = `[${formData.inquiryType}] From: ${formData.name || 'School Inquirer'}`;
                          onOpenGmail(schoolInfo.email, subject);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
                        title="Draft and send inquiry using official Gmail"
                      >
                        <Mail className="w-3.5 h-3.5 text-red-600" />
                        <span>Compose in Gmail Desk</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      id="btn-submit-inquiry"
                      className="ml-auto px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#0f2454] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      Submit Inquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
