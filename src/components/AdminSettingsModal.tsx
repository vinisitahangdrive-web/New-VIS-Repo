import React, { useState, useRef } from 'react';
import { SchoolInfo } from '../types';
import { SchoolCrest, formatLogoUrl } from './SchoolCrest';
import { Settings, CheckCircle2, Shield, X, KeyRound, Image as ImageIcon, Sparkles, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
  onSaveSettings: (updatedInfo: SchoolInfo) => void;
  onUpdateAdminPassword: (newPassword: string) => void;
  onOpenLogoModal?: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  onSaveSettings,
  onUpdateAdminPassword,
  onOpenLogoModal,
}) => {
  const [formData, setFormData] = useState<SchoolInfo>(schoolInfo);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFormData(schoolInfo);
    setLogoError(null);
  }, [schoolInfo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SchoolInfo, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    if (!file.type.startsWith('image/')) {
      setLogoError('Please select a valid image file (PNG, JPG, SVG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      if (file.type === 'image/svg+xml') {
        handleChange('logoUrl', dataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          handleChange('logoUrl', dataUrl);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/png');
        handleChange('logoUrl', compressed);
      };
      img.onerror = () => setLogoError('Failed to load image file.');
      img.src = dataUrl;
    };
    reader.onerror = () => setLogoError('Failed to read file from disk.');
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSettingsSuccess(true);
    setTimeout(() => {
      setSettingsSuccess(false);
      onClose();
    }, 1200);
  };

  const handlePasswordChange = () => {
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    onUpdateAdminPassword(newPassword.trim());
    setPasswordSuccess(true);
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="modal-admin-settings"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">School Profile & Administrative Settings</h3>
              <p className="text-xs text-slate-500">
                Update DepEd credentials, contact points, and announcement ticker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {settingsSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              School information successfully saved!
            </div>
          )}

          <form onSubmit={handleSaveInfo} className="space-y-4">
            {/* School Logo Quick Management */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0">
                  <SchoolCrest
                    customLogoUrl={formData.logoUrl}
                    size="md"
                    schoolName={formData.name}
                    schoolId={formData.schoolId}
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      School Seal / Logo
                    </span>
                    {formData.logoUrl ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Custom Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Official DepEd Crest
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Custom emblem or photo displayed on the top header, school footer, and announcements.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="btn-settings-upload-local-logo"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-700 text-white hover:bg-blue-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Logo File
                    </button>

                    {onOpenLogoModal && (
                      <button
                        type="button"
                        id="btn-settings-open-logo-modal"
                        onClick={() => {
                          onClose();
                          onOpenLogoModal();
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        Advanced Dialog
                      </button>
                    )}

                    {formData.logoUrl && (
                      <button
                        type="button"
                        id="btn-settings-reset-logo"
                        onClick={() => handleChange('logoUrl', '')}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Reset to DepEd Seal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* In-place Logo URL input */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">
                  Or Paste School Logo Image URL (Google Drive, Imgur, or Web link):
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      id="input-settings-logo-url"
                      value={formData.logoUrl || ''}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://... or Google Drive share link"
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoUrl', '')}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {logoError && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    {logoError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">School Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">School ID</label>
                <input
                  type="text"
                  value={formData.schoolId}
                  onChange={(e) => handleChange('schoolId', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Complete Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => handleChange('division', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Official School Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">School Head / Principal</label>
                <input
                  type="text"
                  value={formData.schoolHead}
                  onChange={(e) => handleChange('schoolHead', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">School Motto</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => handleChange('motto', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 italic"
                />
              </div>
            </div>

            {/* Official School Population & Personnel Statistics */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Official Enrollment & Staffing Statistics
                </h4>
                <span className="text-[11px] text-blue-700 font-semibold">
                  BEIS / LIS Sync
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Elementary Enrolled
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-stats-elementary"
                    value={formData.elementaryEnrolled ?? 0}
                    onChange={(e) => handleChange('elementaryEnrolled', Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Kinder to Gr. 6</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Secondary Enrolled
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-stats-secondary"
                    value={formData.secondaryEnrolled ?? 0}
                    onChange={(e) => handleChange('secondaryEnrolled', Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Grades 7 to 10</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Teachers Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-stats-teachers"
                    value={formData.teachersCount ?? 0}
                    onChange={(e) => handleChange('teachersCount', Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Teaching Faculty</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Non-Teachers
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="input-stats-nonteachers"
                    value={formData.nonTeachersCount ?? 0}
                    onChange={(e) => handleChange('nonTeachersCount', Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Support & Admin</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-[11px] font-bold text-slate-700">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  placeholder="e.g. S.Y. 2024 - 2025"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Top Announcement Marquee Bar
              </label>
              <textarea
                value={formData.announcementTicker}
                onChange={(e) => handleChange('announcementTicker', e.target.value)}
                rows={2}
                placeholder="Broadcast marquee message appearing below header..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="btn-save-school-settings"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Save School Information
              </button>
            </div>
          </form>

          {/* Security & Password Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Change Admin Security Password
              </h4>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative flex-1 w-full">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="input-new-admin-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new administrator password..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
              <button
                type="button"
                id="btn-update-password"
                onClick={handlePasswordChange}
                className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
              >
                Update Password
              </button>
            </div>
            {passwordSuccess && (
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Administrator password has been successfully updated!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
