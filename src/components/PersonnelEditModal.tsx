import React, { useState, useEffect, useRef } from 'react';
import { PersonnelMember, PersonnelCategory } from '../types';
import { X, UserPlus, Check, AlertCircle, Camera, Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PersonnelAvatar } from './PersonnelAvatar';
import { compressImageFile, formatImageUrl } from '../utils/imageCompressor';

interface PersonnelEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: PersonnelMember) => void;
  initialData?: PersonnelMember | null;
  defaultCategory?: PersonnelCategory;
  defaultReportsToId?: string | null;
  allMembers: PersonnelMember[];
}

export const PersonnelEditModal: React.FC<PersonnelEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultCategory,
  defaultReportsToId,
  allMembers,
}) => {
  const [formData, setFormData] = useState<Partial<PersonnelMember>>({
    name: '',
    position: '',
    category: 'elementary',
    departmentOrGrade: '',
    reportsToId: null,
    email: '',
    contactNumber: '',
    photoUrl: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const category: PersonnelCategory = defaultCategory || 'elementary';
      let defaultPos = 'Teacher I';
      let defaultDept = '';
      let defaultReports: string | null = 'personnel-principal';

      if (category === 'district') {
        defaultPos = 'Public Schools District Supervisor (PSDS)';
        defaultDept = 'DepEd Sorsogon • Donsol West II District';
        defaultReports = null;
      } else if (category === 'district_admin_officer') {
        defaultPos = 'Administrative Officer II • District Administrative Office';
        defaultDept = 'District Administrative Office • Donsol West II District';
        defaultReports = allMembers.find((m) => m.category === 'district')?.id || null;
      } else if (category === 'administration') {
        defaultPos = 'Principal I / School Head';
        defaultDept = 'Office of the School Head';
        defaultReports = allMembers.find((m) => m.category === 'district')?.id || null;
      } else if (category === 'admin_officer') {
        defaultPos = 'Administrative Officer II';
        defaultDept = 'Office of the Administrative Officer • School Operations';
        defaultReports = allMembers.find((m) => m.category === 'administration')?.id || null;
      } else if (category === 'secondary') {
        defaultPos = 'Teacher I';
        defaultDept = 'Junior High School Department';
        defaultReports = allMembers.find((m) => m.category === 'administration')?.id || null;
      } else if (category === 'non_teaching') {
        defaultPos = 'Administrative Aide';
        defaultDept = 'School Support Services';
        defaultReports = allMembers.find((m) => m.category === 'admin_officer')?.id || allMembers.find((m) => m.category === 'administration')?.id || null;
      } else {
        defaultPos = 'Teacher I';
        defaultDept = 'Elementary Department';
        defaultReports = allMembers.find((m) => m.category === 'administration')?.id || null;
      }

      setFormData({
        name: '',
        position: defaultPos,
        category: category,
        departmentOrGrade: defaultDept,
        reportsToId: defaultReportsToId !== undefined ? defaultReportsToId : defaultReports,
        email: '',
        contactNumber: '',
        photoUrl: '',
      });
    }
    setError(null);
  }, [initialData, defaultCategory, defaultReportsToId, isOpen, allMembers]);

  const handleCategoryChange = (newCategory: PersonnelCategory) => {
    setFormData((prev) => {
      let nextPos = prev.position;
      let nextDept = prev.departmentOrGrade;
      let nextReports = prev.reportsToId;

      // If creating a fresh record or user hasn't typed custom fields, adapt defaults
      if (!initialData) {
        if (newCategory === 'district') {
          nextPos = 'Public Schools District Supervisor (PSDS)';
          nextDept = 'DepEd Sorsogon • Donsol West II District';
          nextReports = null;
        } else if (newCategory === 'district_admin_officer') {
          nextPos = 'Administrative Officer II • District Administrative Office';
          nextDept = 'District Administrative Office • Donsol West II District';
          nextReports = allMembers.find((m) => m.category === 'district')?.id || null;
        } else if (newCategory === 'administration') {
          nextPos = 'Principal I / School Head';
          nextDept = 'Office of the School Head';
          nextReports = allMembers.find((m) => m.category === 'district')?.id || null;
        } else if (newCategory === 'admin_officer') {
          nextPos = 'Administrative Officer II';
          nextDept = 'Office of the Administrative Officer • School Operations';
          nextReports = allMembers.find((m) => m.category === 'administration')?.id || null;
        } else if (newCategory === 'secondary') {
          nextPos = 'Teacher I';
          nextDept = 'Junior High School Department';
          nextReports = allMembers.find((m) => m.category === 'administration')?.id || null;
        } else if (newCategory === 'non_teaching') {
          nextPos = 'Administrative Aide';
          nextDept = 'School Support Services';
          nextReports =
            allMembers.find((m) => m.category === 'admin_officer')?.id ||
            allMembers.find((m) => m.category === 'administration')?.id ||
            null;
        } else {
          nextPos = 'Teacher I';
          nextDept = 'Elementary Department';
          nextReports = allMembers.find((m) => m.category === 'administration')?.id || null;
        }
      }

      return {
        ...prev,
        category: newCategory,
        position: nextPos,
        departmentOrGrade: nextDept,
        reportsToId: nextReports,
      };
    });
  };

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file exceeds 8MB limit. Please upload a smaller photo.');
      return;
    }

    try {
      setIsProcessingPhoto(true);
      setError(null);
      // Auto-compress photo to 360px portrait avatar (~15-30KB)
      // This guarantees instant cloud syncing and zero Firestore document limit violations
      const compressed = await compressImageFile(file, 360, 0.78);
      setFormData((prev) => ({ ...prev, photoUrl: compressed }));
    } catch (err) {
      console.error('Failed to compress avatar photo:', err);
      setError('Could not process this image. Please try another photo.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Please enter the personnel member’s full name.');
      return;
    }
    if (!formData.position?.trim()) {
      setError('Please specify the position / DepEd title.');
      return;
    }
    if (!formData.departmentOrGrade?.trim()) {
      setError('Please specify the department, grade level, or operational assignment.');
      return;
    }

    const memberToSave: PersonnelMember = {
      id: initialData?.id || `personnel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: formData.name.trim(),
      position: formData.position.trim(),
      category: (formData.category as PersonnelCategory) || 'elementary',
      departmentOrGrade: formData.departmentOrGrade.trim(),
      reportsToId: formData.reportsToId || null,
      email: formData.email?.trim() || undefined,
      contactNumber: formData.contactNumber?.trim() || undefined,
      photoUrl: formData.photoUrl?.trim() || undefined,
      order: initialData?.order ?? allMembers.length + 1,
    };

    onSave(memberToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Personnel Record' : 'Add New Faculty or Staff Member'}
              </h3>
              <p className="text-xs text-slate-500">
                Vinisitahan Integrated School • Donsol West II District
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Personnel Photo Upload & Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <PersonnelAvatar
              photoUrl={formData.photoUrl}
              name={formData.name || 'Personnel'}
              category={formData.category}
              size="xl"
            />
            <div className="flex-1 space-y-2 w-full text-center sm:text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Personnel Photo
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload an official portrait or paste a direct image URL
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isProcessingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isProcessingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing Photo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </>
                  )}
                </button>
                {formData.photoUrl && (
                  <button
                    type="button"
                    disabled={isProcessingPhoto}
                    onClick={() => setFormData((prev) => ({ ...prev, photoUrl: '' }))}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 border border-red-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              <div>
                <input
                  type="url"
                  value={formData.photoUrl || ''}
                  onChange={(e) => {
                    const formatted = formatImageUrl(e.target.value);
                    setFormData({ ...formData, photoUrl: formatted });
                  }}
                  placeholder="Or enter image URL (e.g. Google Drive, Unsplash, HTTPS)"
                  className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Full Name (with title/degrees if applicable) *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Maria Teresa G. Ramos, PhD or Ronald S. Doma"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Position / DepEd Rank *
              </label>
              <input
                type="text"
                required
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. Teacher III, Master Teacher I, Admin Aide"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value as PersonnelCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="district">District Leadership (PSDS)</option>
                <option value="district_admin_officer">District Administrative Officer (District Office / Under PSDS)</option>
                <option value="administration">School Administration (Head / Principal)</option>
                <option value="admin_officer">School Administrative Officer (AO II / Operations / Under Principal)</option>
                <option value="elementary">Elementary Teacher (K to 6)</option>
                <option value="secondary">Secondary Teacher (Junior High 7 to 10)</option>
                <option value="non_teaching">Non-Teaching & Support Staff</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Department, Section, or Grade Assignment *
            </label>
            <input
              type="text"
              required
              value={formData.departmentOrGrade || ''}
              onChange={(e) => setFormData({ ...formData, departmentOrGrade: e.target.value })}
              placeholder="e.g. Grade 2 - Rosal, Junior High English Dept, Registrar / LIS"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Reports To in Hierarchy (Pedigree Parent)
            </label>
            <select
              value={formData.reportsToId || ''}
              onChange={(e) => setFormData({ ...formData, reportsToId: e.target.value || null })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">None (Top Level / District Supervisor)</option>
              {allMembers
                .filter((m) => m.id !== initialData?.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.position})
                  </option>
                ))}
            </select>
            <span className="text-[10px] text-slate-400">
              Determines connecting tree line in the pedigree chart.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email Address (Optional)</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@deped.gov.ph"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Contact Number (Optional)</label>
              <input
                type="text"
                value={formData.contactNumber || ''}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Update Record' : 'Add to Faculty List'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
