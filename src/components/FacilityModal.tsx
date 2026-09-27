import React, { useState, useEffect, useRef } from 'react';
import { FacilityItem } from '../types';
import { formatImageUrl, compressImageFile } from '../utils/imageCompressor';
import {
  Building2,
  Microscope,
  Monitor,
  Trophy,
  BookOpen,
  Sprout,
  GraduationCap,
  Music,
  Palette,
  Layers,
  Shield,
  Users,
  Wrench,
  X,
  Upload,
  Link as LinkIcon,
  Trash2,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: FacilityItem | null;
  onSave: (savedFacility: FacilityItem) => void;
}

const CATEGORY_PRESETS = [
  'Academic Instruction',
  'Science & STEM',
  'Information & Tech',
  'Sports & Athletics',
  'Library & Research',
  'Eco & Agriculture',
  'Arts & Livelihood',
  'Administrative & Support'
];

const ICON_OPTIONS = [
  { name: 'Building2', label: 'Classroom / Building', icon: Building2 },
  { name: 'Microscope', label: 'Science / Lab', icon: Microscope },
  { name: 'Monitor', label: 'ICT / Computer', icon: Monitor },
  { name: 'Trophy', label: 'Gym / Sports', icon: Trophy },
  { name: 'BookOpen', label: 'Library / Books', icon: BookOpen },
  { name: 'Sprout', label: 'Eco / Garden', icon: Sprout },
  { name: 'GraduationCap', label: 'Academic / Hall', icon: GraduationCap },
  { name: 'Music', label: 'Music / Culture', icon: Music },
  { name: 'Palette', label: 'Arts / Creative', icon: Palette },
  { name: 'Wrench', label: 'TLE / Workshop', icon: Wrench },
  { name: 'Layers', label: 'Multi-purpose', icon: Layers },
  { name: 'Users', label: 'Community / Center', icon: Users },
];

export const FacilityModal: React.FC<FacilityModalProps> = ({
  isOpen,
  onClose,
  facility,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Academic Instruction');
  const [capacity, setCapacity] = useState('');
  const [iconName, setIconName] = useState('Building2');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (facility) {
      setTitle(facility.title || '');
      setDesc(facility.desc || '');
      setCategory(facility.category || 'Academic Instruction');
      setCapacity(facility.capacity || '');
      setIconName(facility.iconName || 'Building2');
      setImageUrl(facility.imageUrl || '');
      setUrlInput(facility.imageUrl || '');
    } else {
      setTitle('');
      setDesc('');
      setCategory('Academic Instruction');
      setCapacity('');
      setIconName('Building2');
      setImageUrl('');
      setUrlInput('');
    }
    setError(null);
  }, [facility, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to process image file. Please choose a standard PNG or JPG.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setImageUrl('');
      return;
    }
    const formatted = formatImageUrl(urlInput.trim());
    setImageUrl(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const cleanDesc = desc.trim();

    if (!cleanTitle) {
      setError('Facility Title is required.');
      return;
    }

    if (!cleanDesc) {
      setError('Facility Description is required to inform students and parents.');
      return;
    }

    const savedFacility: FacilityItem = {
      id: facility ? facility.id : `facility-${Date.now()}`,
      title: cleanTitle,
      desc: cleanDesc,
      category: category.trim() || 'Academic Instruction',
      capacity: capacity.trim() || undefined,
      iconName: iconName || 'Building2',
      imageUrl: imageUrl.trim() || undefined,
      order: facility?.order ?? Date.now(),
    };

    onSave(savedFacility);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="modal-facility"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {facility ? 'Edit Campus Learning Facility' : 'Add New Learning Facility'}
              </h3>
              <p className="text-xs text-slate-500">
                Vinisitahan Integrated School • Campus Physical Plant & Resources
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Facility Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Facility Name / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="input-facility-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Science & Technology Laboratory"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="category-suggestions"
                  id="input-facility-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Select or enter category"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
                <datalist id="category-suggestions">
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Capacity Specification */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Capacity / Specification (Optional)
            </label>
            <input
              type="text"
              id="input-facility-capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 45 Students • 35 Desktop Terminals • Covered Bleachers"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Facility Icon Badge
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ICON_OPTIONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIconName(item.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <IconComp
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-700' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Facility Description & Equipment Highlights <span className="text-red-500">*</span>
            </label>
            <textarea
              id="input-facility-desc"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Detailed description of the facility, available equipment, learning modules, and educational purpose for learners..."
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-normal leading-relaxed"
            />
          </div>

          {/* Facility Photo / Image */}
          <div className="space-y-2.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Facility Photo / Illustration (Optional)</span>
              </label>
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    imageInputMode === 'url'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Image Link
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white text-slate-600 hover:text-blue-700 flex flex-col items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="font-semibold">
                    {isCompressing ? 'Compressing and optimizing photo...' : 'Click to select campus facility photo'}
                  </span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, or WEBP</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://... or Google Drive public link"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Photo Preview */}
            {imageUrl && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 bg-white max-h-48 group">
                <img
                  src={imageUrl}
                  alt="Facility Preview"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setUrlInput('');
                    }}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-facility"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{facility ? 'Save Changes' : 'Add Facility to Campus'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
