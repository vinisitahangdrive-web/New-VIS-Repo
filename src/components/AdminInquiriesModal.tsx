import React, { useState, useMemo } from 'react';
import { InquiryMessage, InquiryStatus, SchoolInfo } from '../types';
import {
  X,
  Mail,
  Phone,
  Clock,
  Search,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  MessageSquare,
  Send,
  Reply,
  Printer,
  ShieldCheck,
  Calendar,
  Sparkles,
  Inbox
} from 'lucide-react';

interface AdminInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: InquiryMessage[];
  schoolInfo: SchoolInfo;
  onUpdateStatus: (id: string, status: InquiryStatus, notes?: string) => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
}

export const AdminInquiriesModal: React.FC<AdminInquiriesModalProps> = ({
  isOpen,
  onClose,
  inquiries,
  schoolInfo,
  onUpdateStatus,
  onDeleteInquiry,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtered and searched list
  const filteredList = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchFilter = filter === 'all' || inq.status === filter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        inq.name.toLowerCase().includes(q) ||
        inq.phone.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.inquiryType.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q) ||
        inq.id.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [inquiries, filter, search]);

  const selectedInquiry = useMemo(() => {
    if (!selectedInquiryId) return filteredList[0] || inquiries[0] || null;
    return inquiries.find((i) => i.id === selectedInquiryId) || filteredList[0] || null;
  }, [selectedInquiryId, inquiries, filteredList]);

  // Sync note input when selection changes
  React.useEffect(() => {
    if (selectedInquiry) {
      setAdminNoteInput(selectedInquiry.adminNotes || '');
    }
  }, [selectedInquiry?.id]);

  if (!isOpen) return null;

  const unreadCount = inquiries.filter((i) => i.status === 'unread').length;

  const handleStatusChange = async (inqId: string, newStatus: InquiryStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(inqId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedInquiry.id, selectedInquiry.status, adminNoteInput.trim());
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await onDeleteInquiry(id);
      if (selectedInquiryId === id) {
        setSelectedInquiryId(null);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePrintSlip = (inq: InquiryMessage) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inquiry Slip - ${inq.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #111827; }
          .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 18px; color: #1e3a8a; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #4b5563; }
          .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; margin-top: 6px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          .table th, .table td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
          .table th { background: #f3f4f6; width: 30%; }
          .message-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 14px; margin-top: 15px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
          .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>VINISITAHAN INTEGRATED SCHOOL</h2>
          <p>School ID: 502996 &bull; Donsol West II District, SDO Sorsogon, Region V</p>
          <div class="badge">OFFICIAL INQUIRY TRANSMITTAL SLIP</div>
        </div>
        <table class="table">
          <tr><th>Tracking Reference:</th><td>#${inq.id}</td></tr>
          <tr><th>Date & Time Submitted:</th><td>${new Date(inq.submittedAt).toLocaleString()}</td></tr>
          <tr><th>Inquirer Name:</th><td><strong>${inq.name}</strong></td></tr>
          <tr><th>Contact Phone:</th><td>${inq.phone}</td></tr>
          <tr><th>Email Address:</th><td>${inq.email || 'None provided'}</td></tr>
          <tr><th>Category:</th><td>${inq.inquiryType}</td></tr>
          <tr><th>Dispatched to School Email:</th><td>${inq.targetSchoolEmail || schoolInfo.email}</td></tr>
          <tr><th>Status:</th><td>${inq.status.toUpperCase()}</td></tr>
        </table>
        <h4>Inquiry Message:</h4>
        <div class="message-box">${inq.message}</div>
        ${inq.adminNotes ? `<h4>Action / Admin Notes:</h4><div class="message-box">${inq.adminNotes}</div>` : ''}
        <div class="footer">
          Generated from Vinisitahan Integrated School Administrative Portal on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] max-h-[800px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">School Inquiries & Admin Desk</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold animate-pulse">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Official notifications received & forwarded to school inbox ({schoolInfo.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { id: 'all', label: `All (${inquiries.length})` },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'read', label: `Read (${inquiries.filter((i) => i.status === 'read').length})` },
                { id: 'replied', label: `Replied (${inquiries.filter((i) => i.status === 'replied').length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sender, phone, text..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Modal Main Content: Split Pane */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Pane: Inquiries List */}
          <div className="w-full md:w-5/12 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 bg-white">
            {filteredList.length > 0 ? (
              filteredList.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id;
                const isUnread = inq.status === 'unread';

                return (
                  <div
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiryId(inq.id);
                      if (inq.status === 'unread') {
                        handleStatusChange(inq.id, 'read');
                      }
                    }}
                    className={`p-4 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-700'
                        : isUnread
                        ? 'bg-amber-50/40 hover:bg-slate-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {isUnread && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                            {inq.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              inq.status === 'unread'
                                ? 'bg-amber-100 text-amber-800'
                                : inq.status === 'replied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-blue-700 truncate">
                          {inq.inquiryType}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {inq.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inq.submittedAt).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>#{inq.id.slice(-6)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400 p-6 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium">No inquiries found matching criteria.</p>
              </div>
            )}
          </div>

          {/* Right Pane: Inquiry Detail View */}
          <div className="w-full md:w-7/12 flex flex-col bg-slate-50 overflow-y-auto">
            {selectedInquiry ? (
              <div className="p-6 space-y-5 flex-1">
                {/* Dispatch Confirmation Card */}
                <div className="p-3.5 rounded-xl bg-blue-100/70 border border-blue-200 text-blue-900 flex items-start gap-3 text-xs">
                  <Mail className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-relaxed">
                    <strong className="block text-blue-950 font-semibold">
                      Automated Email Dispatch Target:
                    </strong>
                    <span>
                      Forwarded to: <strong className="text-blue-800">{selectedInquiry.targetSchoolEmail || schoolInfo.email}</strong>
                    </span>
                    <span className="block text-[11px] text-blue-700">
                      Dispatched on: {new Date(selectedInquiry.submittedAt).toLocaleString()} &bull; Ref: #{selectedInquiry.id}
                    </span>
                  </div>
                </div>

                {/* Header card with sender info */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 mb-1.5">
                        {selectedInquiry.inquiryType}
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-900">
                        {selectedInquiry.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Received on {new Date(selectedInquiry.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedInquiry.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as InquiryStatus)}
                        className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Mobile / Phone</span>
                        <a
                          href={`tel:${selectedInquiry.phone}`}
                          className="font-bold text-slate-800 hover:text-blue-700 underline"
                        >
                          {selectedInquiry.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Email Address</span>
                        {selectedInquiry.email ? (
                          <a
                            href={`mailto:${selectedInquiry.email}`}
                            className="font-bold text-slate-800 hover:text-blue-700 underline break-all"
                          >
                            {selectedInquiry.email}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No email provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Box */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Inquiry Message / Question
                  </h5>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Administrative Follow-Up Notes */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Administrative Follow-Up Notes
                  </h5>
                  <textarea
                    rows={2}
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Add internal notes e.g., 'Called parent on March 24, student Form 137 ready for pickup'..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isUpdating}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                {/* Action Footer Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2">
                    {selectedInquiry.email && (
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                          `[VIS Helpdesk Response #${selectedInquiry.id}] ${selectedInquiry.inquiryType}`
                        )}&body=${encodeURIComponent(
                          `Dear ${selectedInquiry.name},\n\nThank you for reaching out to Vinisitahan Integrated School regarding "${selectedInquiry.inquiryType}".\n\n[Write response here]\n\nWarm regards,\nOffice of the Administration\nVinisitahan Integrated School (School ID: 502996)\nBarangay Vinisitahan, Donsol, Sorsogon`
                        )}`}
                        onClick={() => handleStatusChange(selectedInquiry.id, 'replied')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply via Email</span>
                      </a>
                    )}

                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Call Mobile</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handlePrintSlip(selectedInquiry)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                      title="Print official inquiry transmittal slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Slip</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedInquiry.id)}
                    disabled={isDeleting === selectedInquiry.id}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors cursor-pointer"
                    title="Delete inquiry record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <Inbox className="w-10 h-10 text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700">No Inquiry Selected</h4>
                <p className="text-xs max-w-xs text-slate-500">
                  Select an inquiry from the left pane to view details, contact information, and actions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloud Database Sync: Active</span>
            <span className="text-slate-300">|</span>
            <span>Official Inbox: <strong>{schoolInfo.email}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
