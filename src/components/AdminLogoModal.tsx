import React, { useState, useRef, useEffect } from 'react';
import { SchoolInfo } from '../types';
import { SchoolCrest, formatLogoUrl } from './SchoolCrest';
import { 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AdminLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
  onSaveLogo: (newLogoUrl: string | null) => void;
}

export const AdminLogoModal: React.FC<AdminLogoModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  onSaveLogo,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(schoolInfo.logoUrl);
  const [urlInput, setUrlInput] = useState<string>(schoolInfo.logoUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal state whenever modal opens or schoolInfo updates
  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(schoolInfo.logoUrl);
      setUrlInput(schoolInfo.logoUrl || '');
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsProcessing(false);
    }
  }, [isOpen, schoolInfo.logoUrl]);

  if (!isOpen) return null;

  // Compress & resize image to safe dimensions (max 512x512) for localStorage stability
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const dataUrl = readerEvent.target?.result as string;
        if (!dataUrl) {
          reject(new Error('Failed to read file.'));
          return;
        }

        // If SVG, keep as is
        if (file.type === 'image/svg+xml') {
          resolve(dataUrl);
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
            resolve(dataUrl);
            return;
          }

          // Clear and draw image smoothly
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as PNG for transparency support while compact in size
          const compressedDataUrl = canvas.toDataURL('image/png');
          resolve(compressedDataUrl);
        };

        img.onerror = () => reject(new Error('Image could not be loaded.'));
        img.src = dataUrl;
      };

      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(file);
    });
  };

  // Handle local file selection and convert to optimized Base64
  const processFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, SVG, or WEBP).');
      return;
    }

    try {
      setIsProcessing(true);
      const optimizedUrl = await compressImage(file);
      setPreviewUrl(optimizedUrl);
      setUrlInput('');
      setSuccessMessage(`Logo "${file.name}" loaded and optimized for instant display.`);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not process this image file. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlInputChange = (val: string) => {
    setUrlInput(val);
    setErrorMessage(null);
    if (val.trim()) {
      const normalized = formatLogoUrl(val);
      setPreviewUrl(normalized);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    const formatted = formatLogoUrl(trimmed);
    setErrorMessage(null);
    setPreviewUrl(formatted);
    setSuccessMessage('Image URL applied to preview.');
  };

  const handleResetToDefault = () => {
    setPreviewUrl(null);
    setUrlInput('');
    setErrorMessage(null);
    setSuccessMessage('Reset to the official Vinisitahan Integrated School vector crest.');
  };

  const handleSave = () => {
    let finalLogoToSave: string | null = previewUrl;

    if (activeTab === 'url' && urlInput.trim()) {
      finalLogoToSave = formatLogoUrl(urlInput.trim());
    }

    onSaveLogo(finalLogoToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-admin-logo"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage School Logo</h3>
              <p className="text-xs text-slate-500">Upload a custom emblem or provide an image link</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Live Preview Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="shrink-0">
              <SchoolCrest
                customLogoUrl={previewUrl}
                size="lg"
                schoolName={schoolInfo.name}
                schoolId={schoolInfo.schoolId}
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Logo:
                </span>
                {previewUrl ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Custom Logo Selected
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Default DepEd Vector Crest
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Updates the main header, footer, announcement stamps, and official school letterhead immediately.
              </p>
              {previewUrl && (
                <button
                  type="button"
                  id="btn-restore-default-crest"
                  onClick={handleResetToDefault}
                  className="mt-1 text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Restore Official DepEd Crest
                </button>
              )}
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              id="tab-logo-upload"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image File
            </button>
            <button
              type="button"
              id="tab-logo-url"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Manually Put URL
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                className="hidden"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  {isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {isProcessing ? 'Optimizing Image...' : 'Click to browse or drag and drop logo file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, WEBP, or SVG (Transparent circular emblem recommended)
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Manual URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Direct Web Image URL or Google Drive Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="input-logo-url"
                  value={urlInput}
                  onChange={(e) => handleUrlInputChange(e.target.value)}
                  placeholder="https://example.com/school-logo.png or Google Drive share link"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  id="btn-apply-logo-url"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                >
                  Preview
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Supports image URLs and Google Drive shared links (auto-converted to direct view).
              </p>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-logo"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save & Update Logo
          </button>
        </div>
      </div>
    </div>
  );
};
