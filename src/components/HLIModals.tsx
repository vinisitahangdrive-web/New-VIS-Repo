import React, { useState } from 'react';
import { HLIPillar, HLIFile } from '../types';
import {
  X,
  UploadCloud,
  Lock,
  Unlock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// 1. Edit Pillar Content Modal
interface EditPillarModalProps {
  isOpen: boolean;
  pillar: HLIPillar | null;
  onClose: () => void;
  onSave: (updatedPillar: HLIPillar) => void;
}

export const EditPillarModal: React.FC<EditPillarModalProps> = ({
  isOpen,
  pillar,
  onClose,
  onSave,
}) => {
  if (!isOpen || !pillar) return null;

  const [title, setTitle] = useState(pillar.title);
  const [subtitle, setSubtitle] = useState(pillar.subtitle || '');
  const [description, setDescription] = useState(pillar.description);
  const [keyFocusAreasText, setKeyFocusAreasText] = useState(pillar.keyFocusAreas.join('\n'));
  const [leadCoordinator, setLeadCoordinator] = useState(pillar.leadCoordinator || '');
  const [status, setStatus] = useState(pillar.status || 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const areas = keyFocusAreasText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated: HLIPillar = {
      ...pillar,
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      keyFocusAreas: areas.length > 0 ? areas : pillar.keyFocusAreas,
      leadCoordinator: leadCoordinator.trim(),
      status: status.trim(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Healthy Learning Institute • Admin Editor
            </span>
            <h3 className="text-lg font-bold text-white">
              Edit {pillar.name}: {pillar.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pillar Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              placeholder="e.g. Healthy School Policy & Leadership"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtitle / DepEd Directive Tagline</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              placeholder="e.g. Institutional health policies, anti-smoking, canteen compliance"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Committee / Coordinator</label>
              <input
                type="text"
                value={leadCoordinator}
                onChange={(e) => setLeadCoordinator(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                placeholder="e.g. School Health & Nutrition Coordinator"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="Fully Operational">Fully Operational</option>
                <option value="Active Implementation">Active Implementation</option>
                <option value="Three-Star Certified">Three-Star Certified</option>
                <option value="Ongoing Monitoring">Ongoing Monitoring</option>
                <option value="DepEd-DOH Accredited">DepEd-DOH Accredited</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pillar Content & Implementation Scope</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 leading-relaxed"
              placeholder="Detailed description of policies, school activities, and standards enforced under this pillar..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Key Focus Areas & Programs <span className="text-slate-400 font-normal">(one per line)</span>
            </label>
            <textarea
              rows={3}
              value={keyFocusAreasText}
              onChange={(e) => setKeyFocusAreasText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              placeholder="100% Smoke-Free & Vape-Free Campus&#10;Healthy Canteen Food Standards&#10;Emergency Health Plan"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Pillar Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Upload File to Pillar Modal
interface UploadPillarFileModalProps {
  isOpen: boolean;
  pillar: HLIPillar | null;
  onClose: () => void;
  onUpload: (pillarId: string, newFile: HLIFile) => void | Promise<void>;
}

export const UploadPillarFileModal: React.FC<UploadPillarFileModalProps> = ({
  isOpen,
  pillar,
  onClose,
  onUpload,
}) => {
  if (!isOpen || !pillar) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    if (!title) {
      // Auto-generate title from file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Format file size
    const sizeKB = Math.round(file.size / 1024);
    if (sizeKB < 1024) {
      setFileSize(`${sizeKB} KB`);
    } else {
      setFileSize(`${(sizeKB / 1024).toFixed(1)} MB`);
    }

    // Determine type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) setFileType('pdf');
    else if (['doc', 'docx'].includes(ext)) setFileType('docx');
    else if (['xls', 'xlsx'].includes(ext)) setFileType('xlsx');
    else if (['csv', 'tsv'].includes(ext)) setFileType('csv');
    else if (['txt', 'text', 'md', 'log', 'json', 'xml', 'rtf'].includes(ext)) setFileType('txt');
    else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) setFileType('image');
    else setFileType('document');

    const reader = new FileReader();
    reader.onload = () => {
      setDownloadUrl(reader.result as string);
      setFileSelected(true);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl) {
      alert('Please select a file to upload.');
      return;
    }

    const newFile: HLIFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pillarId: pillar.id,
      name: fileName.trim() || 'school_document.pdf',
      title: title.trim() || fileName,
      fileSize: fileSize || '1.0 MB',
      fileType,
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadUrl,
      isRestricted,
      restrictionReason: isRestricted ? restrictionReason.trim() || 'Internal Administrator Access Only' : undefined,
      description: description.trim(),
    };

    try {
      setIsUploading(true);
      await onUpload(pillar.id, newFile);
      onClose();
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file to Cloud Firestore. Please check your network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Upload Document to {pillar.name}
              </span>
              <h3 className="text-base font-bold text-white">{pillar.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* File Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Choose File to Upload</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                id="file-upload-input"
                onChange={handleFileChange}
                required={!downloadUrl}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <UploadCloud className="w-8 h-8 text-emerald-600 mb-1" />
                {fileSelected ? (
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-800">{fileName}</p>
                    <p className="text-[11px] text-slate-500">{fileSize} • Click to replace file</p>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-700">Click or drag file here to upload</p>
                    <p className="text-[11px] text-slate-500">Supports PDF, DOCX, XLSX, Images, and Text records</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Display Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              placeholder="e.g. VIS School Health and Nutrition Action Plan 2025"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Summary / Brief Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              placeholder="Brief context on who this document is for and how it is used..."
            />
          </div>

          {/* Download Permission Selector (Key User Requirement!) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
              {isRestricted ? (
                <Lock className="w-4 h-4 text-amber-600" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-600" />
              )}
              Download Permission & Access Control
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  !isRestricted
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="downloadPermission"
                  checked={!isRestricted}
                  onChange={() => setIsRestricted(false)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block font-bold text-xs">Allow Public Download</span>
                  <span className="text-[11px] opacity-80">
                    Any student, parent, or visitor can view and download this file freely.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  isRestricted
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="downloadPermission"
                  checked={isRestricted}
                  onChange={() => setIsRestricted(true)}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="block font-bold text-xs">Restrict Download (View-Only)</span>
                  <span className="text-[11px] opacity-80">
                    Users can view and read the document online, but downloading is restricted to administrators.
                  </span>
                </div>
              </label>
            </div>

            {isRestricted && (
              <div className="pt-2">
                <label className="block font-semibold text-amber-900 mb-1 text-[11px]">
                  Restriction Notice (displayed to public visitors)
                </label>
                <input
                  type="text"
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="e.g. Internal DepEd faculty records • Confidential access only"
                  className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || isUploading || !fileSelected}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>
                {isUploading ? 'Uploading to Cloud...' : isProcessing ? 'Processing File...' : 'Upload to Pillar'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Edit Existing File Details & Download Restriction Modal
interface EditPillarFileModalProps {
  isOpen: boolean;
  pillar: HLIPillar | null;
  file: HLIFile | null;
  onClose: () => void;
  onSave: (pillarId: string, updatedFile: HLIFile) => void | Promise<void>;
  onDelete: (pillarId: string, fileId: string) => void | Promise<void>;
}

export const EditPillarFileModal: React.FC<EditPillarFileModalProps> = ({
  isOpen,
  pillar,
  file,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !pillar || !file) return null;

  const [title, setTitle] = useState(file.title);
  const [name, setName] = useState(file.name);
  const [description, setDescription] = useState(file.description || '');
  const [isRestricted, setIsRestricted] = useState(file.isRestricted);
  const [restrictionReason, setRestrictionReason] = useState(file.restrictionReason || '');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: HLIFile = {
      ...file,
      pillarId: pillar.id,
      title: title.trim(),
      name: name.trim(),
      description: description.trim(),
      isRestricted,
      restrictionReason: isRestricted ? restrictionReason.trim() || 'Administrative Download Restriction' : undefined,
    };
    try {
      setIsSaving(true);
      await onSave(pillar.id, updated);
      onClose();
    } catch (err) {
      console.error('Save file error:', err);
      alert('Failed to update file settings in cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await onDelete(pillar.id, file.id);
      onClose();
    } catch (err) {
      console.error('Delete file error:', err);
      alert('Failed to delete file from cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              {pillar.name} • File Settings
            </span>
            <h3 className="text-base font-bold text-white">Edit Document & Download Permissions</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Display Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">File Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Download Restriction Radio Toggle (Core user requirement!) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
              {isRestricted ? (
                <Lock className="w-4 h-4 text-amber-600" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-600" />
              )}
              Download Permission Status
            </span>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  !isRestricted
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="editDownloadPermission"
                  checked={!isRestricted}
                  onChange={() => setIsRestricted(false)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block font-bold text-xs">Public Download Allowed</span>
                  <span className="text-[11px] opacity-80">
                    All visitors, parents, and students can view and download this document.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  isRestricted
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="editDownloadPermission"
                  checked={isRestricted}
                  onChange={() => setIsRestricted(true)}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="block font-bold text-xs">Restricted for Download (View-Only)</span>
                  <span className="text-[11px] opacity-80">
                    Users can view and read the document online, but downloading is restricted.
                  </span>
                </div>
              </label>
            </div>

            {isRestricted && (
              <div className="pt-2">
                <label className="block font-semibold text-amber-900 mb-1 text-[11px]">
                  Reason / Public Lock Notice
                </label>
                <input
                  type="text"
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="e.g. Internal school records • Confidential"
                  className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Delete Danger Section */}
          <div className="pt-2">
            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently delete this file from Cloud</span>
              </button>
            ) : (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-2.5">
                <div>
                  <p className="text-red-800 font-bold text-xs">Permanently delete from Cloud Storage?</p>
                  <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                    This file and all its stored cloud binary data will be completely deleted from Cloud Firestore. It will be removed immediately for all users and will not take up any cloud storage space.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleDelete}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Wiping from Cloud...' : 'Yes, Delete from Cloud'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 rounded-md font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isSaving ? 'Saving to Cloud...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { ViewHLIFileModal } from './HLIDocumentViewer';
