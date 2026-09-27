import React, { useState } from 'react';
import { HLISettings, HLIPillar, HLIFile, AdminUser } from '../types';
import { fetchHLIFileDownloadUrl } from '../services/firestoreService';
import {
  HeartPulse,
  ShieldCheck,
  FileText,
  Download,
  Lock,
  Unlock,
  UploadCloud,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck,
  File,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus,
  Loader2,
  Trash2,
  Eye,
} from 'lucide-react';
import { EditPillarModal, UploadPillarFileModal, EditPillarFileModal, ViewHLIFileModal } from './HLIModals';

interface HealthyLearningInstituteProps {
  hliData: HLISettings;
  adminUser: AdminUser | null;
  onUpdateHLIData: (updatedData: HLISettings) => void;
  onUploadFileToCloud?: (pillarId: string, newFile: HLIFile) => Promise<void>;
  onSaveFileToCloud?: (pillarId: string, updatedFile: HLIFile) => Promise<void>;
  onDeleteFileFromCloud?: (pillarId: string, fileId: string) => Promise<void>;
  onShowToast?: (msg: string) => void;
}

export const HealthyLearningInstitute: React.FC<HealthyLearningInstituteProps> = ({
  hliData,
  adminUser,
  onUpdateHLIData,
  onUploadFileToCloud,
  onSaveFileToCloud,
  onDeleteFileFromCloud,
  onShowToast,
}) => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('all');
  const [editingPillar, setEditingPillar] = useState<HLIPillar | null>(null);
  const [uploadingPillar, setUploadingPillar] = useState<HLIPillar | null>(null);
  const [editingFileContext, setEditingFileContext] = useState<{
    pillar: HLIPillar;
    file: HLIFile;
  } | null>(null);
  const [viewingFileContext, setViewingFileContext] = useState<{
    pillar: HLIPillar;
    file: HLIFile;
  } | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<{
    pillar: HLIPillar;
    file: HLIFile;
  } | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  const isAdmin = !!adminUser;

  // Calculate stats
  const totalFiles = hliData.pillars.reduce((acc, p) => acc + (p.files?.length || 0), 0);
  const allowedFiles = hliData.pillars.reduce(
    (acc, p) => acc + (p.files?.filter((f) => !f.isRestricted).length || 0),
    0
  );
  const restrictedFiles = totalFiles - allowedFiles;

  // Handler for downloading
  const handleDownload = async (file: HLIFile) => {
    if (file.isRestricted && !isAdmin) {
      if (onShowToast) {
        onShowToast(
          `Download Restricted: ${file.restrictionReason || 'This document has been restricted by the administrator.'}`
        );
      } else {
        alert(`Download Restricted: ${file.restrictionReason || 'This document has been restricted by the administrator.'}`);
      }
      return;
    }

    try {
      setDownloadingFileId(file.id);
      if (onShowToast) {
        onShowToast(`Retrieving "${file.name}" from Cloud...`);
      }

      const downloadUrl = await fetchHLIFileDownloadUrl(file);
      if (!downloadUrl) {
        throw new Error('File download content is empty');
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name || 'school_document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) {
        onShowToast(`Downloaded "${file.name}" successfully.`);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to initiate download. Please verify connection or contact school administration.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Pillar save handler
  const handleSavePillar = (updatedPillar: HLIPillar) => {
    const newPillars = hliData.pillars.map((p) =>
      p.id === updatedPillar.id ? updatedPillar : p
    );
    const updatedSettings: HLISettings = {
      ...hliData,
      pillars: newPillars,
      updatedAt: new Date().toISOString(),
    };
    onUpdateHLIData(updatedSettings);
    onShowToast?.(`Updated ${updatedPillar.name}: ${updatedPillar.title}`);
  };

  // Upload file handler (Cloud-persisted automatically)
  const handleUploadFile = async (pillarId: string, newFile: HLIFile) => {
    if (onUploadFileToCloud) {
      await onUploadFileToCloud(pillarId, newFile);
    } else {
      const targetPillar = hliData.pillars.find((p) => p.id === pillarId);
      if (!targetPillar) return;
      const updatedPillar: HLIPillar = {
        ...targetPillar,
        files: [newFile, ...(targetPillar.files || [])],
      };
      handleSavePillar(updatedPillar);
    }
  };

  // Edit file handler (Cloud-persisted automatically)
  const handleSaveFile = async (pillarId: string, updatedFile: HLIFile) => {
    if (onSaveFileToCloud) {
      await onSaveFileToCloud(pillarId, updatedFile);
    } else {
      const targetPillar = hliData.pillars.find((p) => p.id === pillarId);
      if (!targetPillar) return;
      const updatedFiles = targetPillar.files.map((f) =>
        f.id === updatedFile.id ? updatedFile : f
      );
      handleSavePillar({
        ...targetPillar,
        files: updatedFiles,
      });
    }
  };

  // Delete file handler (Cloud-persisted automatically)
  const handleDeleteFile = async (pillarId: string, fileId: string) => {
    if (onDeleteFileFromCloud) {
      await onDeleteFileFromCloud(pillarId, fileId);
    } else {
      const targetPillar = hliData.pillars.find((p) => p.id === pillarId);
      if (!targetPillar) return;
      const updatedFiles = targetPillar.files.filter((f) => f.id !== fileId);
      handleSavePillar({
        ...targetPillar,
        files: updatedFiles,
      });
    }
  };

  const displayedPillars =
    selectedPillarId === 'all'
      ? hliData.pillars
      : hliData.pillars.filter((p) => p.id === selectedPillarId);

  // Helper for file type icons
  const getFileIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileCheck className="w-5 h-5 text-red-600" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <section id="hli-section" className="scroll-mt-16 py-12 bg-[#f7faf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Section Header */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
                <HeartPulse className="w-4 h-4 animate-pulse text-emerald-300" />
                <span>DepEd-DOH Accredited Program • School ID: 502996</span>
              </div>

              {isAdmin && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Mode: File Upload & Permission Controls Active</span>
                </div>
              )}
            </div>

            <div className="max-w-3xl space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {hliData.title} (HLI)
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
                {hliData.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {hliData.description}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-700/50 text-xs">
              <div className="bg-emerald-950/50 backdrop-blur-xs border border-emerald-700/40 rounded-xl p-3">
                <span className="text-[11px] text-emerald-300 font-semibold block">Framework</span>
                <span className="text-lg font-black text-white">6 Pillars</span>
              </div>
              <div className="bg-emerald-950/50 backdrop-blur-xs border border-emerald-700/40 rounded-xl p-3">
                <span className="text-[11px] text-emerald-300 font-semibold block">Uploaded Records</span>
                <span className="text-lg font-black text-white">{totalFiles} Files</span>
              </div>
              <div className="bg-emerald-950/50 backdrop-blur-xs border border-emerald-700/40 rounded-xl p-3">
                <span className="text-[11px] text-emerald-300 font-semibold block">Public Downloads</span>
                <span className="text-lg font-black text-emerald-300">{allowedFiles} Allowed</span>
              </div>
              <div className="bg-emerald-950/50 backdrop-blur-xs border border-emerald-700/40 rounded-xl p-3">
                <span className="text-[11px] text-emerald-300 font-semibold block">Restricted Documents</span>
                <span className="text-lg font-black text-amber-300">{restrictedFiles} View-Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Pillar Selector Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              HLI Governance Panels:
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPillarId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPillarId === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All 6 Pillars ({hliData.pillars.length})
            </button>

            {hliData.pillars.map((pillar) => (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPillarId === pillar.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pillar.name}
              </button>
            ))}
          </div>
        </div>

        {/* The 6 Separate Additional Panels (Pillar 1 to 6) */}
        <div className="space-y-8">
          {displayedPillars.map((pillar) => {
            const pillarFiles = pillar.files || [];

            return (
              <div
                key={pillar.id}
                id={`hli-${pillar.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Pillar Header Ribbon */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[11px] font-black tracking-wider uppercase">
                        {pillar.name}
                      </span>
                      {pillar.status && (
                        <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-emerald-200 text-[11px] font-semibold">
                          {pillar.status}
                        </span>
                      )}
                      {pillar.leadCoordinator && (
                        <span className="text-slate-400 text-xs hidden sm:inline">
                          • Lead: {pillar.leadCoordinator}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {pillar.title}
                    </h3>
                    {pillar.subtitle && (
                      <p className="text-xs text-emerald-200/90 font-medium">
                        {pillar.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Admin Actions on Pillar */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPillar(pillar)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                        title="Edit title, description, and focus areas"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Edit Pillar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadingPillar(pillar)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        title="Upload file to this pillar"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Pillar Content Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Pillar Detailed Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pillar Scope & Institutional Directives
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Key Focus Areas */}
                  {pillar.keyFocusAreas && pillar.keyFocusAreas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Key Health Mandates & Indicators
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pillar.keyFocusAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{area}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Repository / Downloads for this Pillar */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Uploaded Files & Downloadable Resources ({pillarFiles.length})
                        </h4>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setUploadingPillar(pillar)}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Document</span>
                        </button>
                      )}
                    </div>

                    {pillarFiles.length === 0 ? (
                      <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-xs">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold">No files currently uploaded for {pillar.name}.</p>
                        {isAdmin ? (
                          <p className="text-[11px] mt-1 text-emerald-700 font-medium">
                            Use the &ldquo;Upload File&rdquo; button above to add documents for download.
                          </p>
                        ) : (
                          <p className="text-[11px] mt-1 text-slate-400">
                            The school administration will post reference documents here when available.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pillarFiles.map((file) => (
                          <div
                            key={file.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              file.isRestricted
                                ? 'border-amber-200 bg-amber-50/40'
                                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Top row: Icon, title, restriction tag */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                                    {getFileIcon(file.fileType)}
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                      {file.title}
                                    </h5>
                                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                      {file.name}
                                    </p>
                                  </div>
                                </div>

                                {/* Status Tag */}
                                <div>
                                  {file.isRestricted ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                                      title={file.restrictionReason || 'Download restricted by admin. Viewable online.'}
                                    >
                                      <Lock className="w-3 h-3 text-amber-700" />
                                      <span>Restricted (View-Only)</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      <Unlock className="w-3 h-3 text-emerald-700" />
                                      <span>Download Allowed</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Brief description if available */}
                              {file.description && (
                                <p className="text-[11px] text-slate-600 line-clamp-2">
                                  {file.description}
                                </p>
                              )}

                              {/* Meta Info */}
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                                <span>Size: {file.fileSize || 'Standard Document'}</span>
                                <span>•</span>
                                <span>Uploaded: {file.uploadedAt}</span>
                              </div>

                              {/* Restriction Notice Banner if restricted */}
                              {file.isRestricted && (
                                <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <span className="font-semibold block">
                                      {file.restrictionReason ||
                                        'Download restricted by school admin. Internal faculty/division access only.'}
                                    </span>
                                    <span className="text-[10px] text-amber-800">
                                      You can view this document online using the &quot;View Document&quot; button below. File download is restricted.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* View Document Button - ALWAYS ACCESSIBLE (EVEN FOR RESTRICTED FILES) */}
                                <button
                                  type="button"
                                  onClick={() => setViewingFileContext({ pillar, file })}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                                    file.isRestricted
                                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                  }`}
                                  title="View and read document online"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Document</span>
                                </button>

                                {/* Download Button */}
                                {file.isRestricted && !isAdmin ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200"
                                    title="Download restricted: This document can be viewed online only"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Download Locked</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={downloadingFileId === file.id}
                                    onClick={() => handleDownload(file)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 disabled:opacity-75 disabled:cursor-wait"
                                    title={
                                      file.isRestricted
                                        ? 'Admin Access: Download this restricted record'
                                        : 'Download this document to your device'
                                    }
                                  >
                                    {downloadingFileId === file.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                                    )}
                                    <span>
                                      {downloadingFileId === file.id
                                        ? 'Downloading...'
                                        : file.isRestricted
                                        ? 'Admin Download'
                                        : 'Download'}
                                    </span>
                                  </button>
                                )}
                              </div>

                              {/* Admin Manage & Delete Buttons */}
                              {isAdmin && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingFileContext({
                                        pillar,
                                        file,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                                    title="Edit title, name, or toggle download permission"
                                  >
                                    <Edit3 className="w-3 h-3 text-blue-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFileToDelete({ pillar, file })}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                                    title="Permanently delete this file from database cloud"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {editingPillar && (
        <EditPillarModal
          isOpen={!!editingPillar}
          pillar={editingPillar}
          onClose={() => setEditingPillar(null)}
          onSave={handleSavePillar}
        />
      )}

      {uploadingPillar && (
        <UploadPillarFileModal
          isOpen={!!uploadingPillar}
          pillar={uploadingPillar}
          onClose={() => setUploadingPillar(null)}
          onUpload={handleUploadFile}
        />
      )}

      {editingFileContext && (
        <EditPillarFileModal
          isOpen={!!editingFileContext}
          pillar={editingFileContext.pillar}
          file={editingFileContext.file}
          onClose={() => setEditingFileContext(null)}
          onSave={handleSaveFile}
          onDelete={handleDeleteFile}
        />
      )}

      {/* View HLI Document Modal (View-Only clearance for restricted files) */}
      {viewingFileContext && (
        <ViewHLIFileModal
          isOpen={!!viewingFileContext}
          file={viewingFileContext.file}
          pillar={viewingFileContext.pillar}
          isAdmin={isAdmin}
          onClose={() => setViewingFileContext(null)}
          onDownload={handleDownload}
          onShowToast={onShowToast}
        />
      )}

      {/* Delete File from Cloud Storage Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Permanently Delete File</h3>
                <p className="text-xs text-slate-500">Free up Cloud Storage Quota</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2 leading-relaxed">
              <p>
                Are you sure you want to permanently delete <strong className="font-mono text-red-950">&quot;{fileToDelete.file.name}&quot;</strong>?
              </p>
              <p className="text-[11px] text-red-700">
                This will delete the file record and all its binary chunk documents directly from Cloud Firestore, ensuring it will not clog your cloud storage space. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingFile}
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingFile}
                onClick={async () => {
                  try {
                    setIsDeletingFile(true);
                    await handleDeleteFile(fileToDelete.pillar.id, fileToDelete.file.id);
                    setFileToDelete(null);
                  } catch (err) {
                    console.error('Delete error:', err);
                  } finally {
                    setIsDeletingFile(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {isDeletingFile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Wiping from Cloud...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
