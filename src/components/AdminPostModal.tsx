import React, { useState, useEffect, useRef } from 'react';
import { PostItem, PostCategory } from '../types';
import {
  FileText,
  Pin,
  Upload,
  Link as LinkIcon,
  Sparkles,
  X,
  AlertCircle,
  Images,
  Star,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { compressImageFile, formatImageUrl } from '../utils/imageCompressor';

interface AdminPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (post: PostItem) => void;
  postToEdit?: PostItem | null;
}

const CATEGORIES: PostCategory[] = [
  'Announcements',
  'Advisories & Memos',
  'Campus Events',
  'Achievements',
  'Academic Updates',
];

export const AdminPostModal: React.FC<AdminPostModalProps> = ({
  isOpen,
  onClose,
  onSavePost,
  postToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PostCategory>('Announcements');
  const [department, setDepartment] = useState('Office of the School Head');
  const [author, setAuthor] = useState('School Administration');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  
  // Cover image and additional gallery photos
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setCategory(postToEdit.category);
      setDepartment(postToEdit.department || 'Office of the School Head');
      setAuthor(postToEdit.author);
      setDate(postToEdit.date);
      setSummary(postToEdit.summary);
      setContent(postToEdit.content);
      setPinned(!!postToEdit.pinned);
      setCoverImageUrl(postToEdit.imageUrl || '');
      setGalleryImages(postToEdit.galleryImages || []);
      setTagsInput(postToEdit.tags ? postToEdit.tags.join(', ') : '');
    } else {
      // Defaults for new post
      setTitle('');
      setCategory('Announcements');
      setDepartment('Office of the School Head');
      setAuthor('School Administration');
      setDate(new Date().toISOString().split('T')[0]);
      setSummary('');
      setContent('');
      setPinned(false);
      setCoverImageUrl('');
      setGalleryImages([]);
      setTagsInput('Vinisitahan, Donsol West II, DepEd Sorsogon');
    }
    setUrlInput('');
    setIsProcessing(false);
    setError(null);
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        setError('Please select valid image files (PNG, JPG, WEBP).');
        setIsProcessing(false);
        return;
      }

      const compressedList: string[] = [];
      for (const file of validFiles) {
        try {
          const compressed = await compressImageFile(file, 1200, 0.82);
          compressedList.push(compressed);
        } catch (err) {
          console.error('Failed to compress file', file.name, err);
        }
      }

      if (compressedList.length === 0) {
        setError('Failed to process the selected images.');
        setIsProcessing(false);
        return;
      }

      // If no cover photo set yet, the first compressed image becomes cover
      if (!coverImageUrl) {
        setCoverImageUrl(compressedList[0]);
        if (compressedList.length > 1) {
          setGalleryImages((prev) => [...prev, ...compressedList.slice(1)]);
        }
      } else {
        // Append all to gallery
        setGalleryImages((prev) => [...prev, ...compressedList]);
      }
    } catch (err) {
      console.error('Error during image upload', err);
      setError('An error occurred while uploading photos.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    const formatted = formatImageUrl(trimmed);
    if (!coverImageUrl) {
      setCoverImageUrl(formatted);
    } else {
      setGalleryImages((prev) => [...prev, formatted]);
    }
    setUrlInput('');
  };

  const handleSetAsCover = (index: number) => {
    const targetImage = galleryImages[index];
    if (!targetImage) return;

    // Swap: the target image becomes cover, and old cover goes to gallery
    const newGallery = [...galleryImages];
    newGallery.splice(index, 1);
    if (coverImageUrl) {
      newGallery.unshift(coverImageUrl);
    }
    setCoverImageUrl(targetImage);
    setGalleryImages(newGallery);
  };

  const handleRemoveCover = () => {
    if (galleryImages.length > 0) {
      const [nextCover, ...remaining] = galleryImages;
      setCoverImageUrl(nextCover);
      setGalleryImages(remaining);
    } else {
      setCoverImageUrl('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllPhotos = () => {
    setCoverImageUrl('');
    setGalleryImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a post title.');
      return;
    }
    if (!summary.trim() && !content.trim()) {
      setError('Please provide a summary or content for this post.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const postItem: PostItem = {
      id: postToEdit ? postToEdit.id : `post-${Date.now()}`,
      title: title.trim(),
      slug: (postToEdit ? postToEdit.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)) + `-${Date.now().toString().slice(-4)}`,
      category,
      department: department.trim() || 'General Administration',
      author: author.trim() || 'School Head',
      date: date || new Date().toISOString().split('T')[0],
      summary: summary.trim() || content.trim().slice(0, 160) + '...',
      content: content.trim() || summary.trim(),
      pinned,
      imageUrl: coverImageUrl.trim() || undefined,
      galleryImages: galleryImages.filter((img) => img && img.trim().length > 0),
      tags,
    };

    onSavePost(postItem);
    onClose();
  };

  const totalPhotosCount = (coverImageUrl ? 1 : 0) + galleryImages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="modal-admin-post"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {postToEdit ? 'Edit School Post' : 'Create Official School Post'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Announcement / Post Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="input-post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Early Enrollment for S.Y. 2024-2025"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Category
              </label>
              <select
                id="select-post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Author / Office
              </label>
              <input
                type="text"
                id="input-post-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Office of the School Head"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Date, Pinned & Featured in Hero Carousel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Publish Date
              </label>
              <input
                type="date"
                id="input-post-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 sm:pt-4 space-y-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="checkbox-post-pinned"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-600" />
                  Pin this announcement to top
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="checkbox-post-featured"
                  checked={tagsInput.split(',').map((t) => t.trim().toLowerCase()).includes('featured')}
                  onChange={(e) => {
                    const currentTags = tagsInput
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0 && t.toLowerCase() !== 'featured');
                    if (e.target.checked) {
                      currentTags.unshift('featured');
                    }
                    setTagsInput(currentTags.join(', '));
                  }}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Feature in Hero Carousel</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                    'featured' tag
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Summary / Excerpt */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Brief Excerpt / Summary
            </label>
            <textarea
              id="textarea-post-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="Short 1-2 sentence preview for cards and bulletin list..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Full Content */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Full Content & Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textarea-post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Provide complete announcements, requirements, schedule of events, or memo guidelines..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
            />
          </div>

          {/* Post Photos & Attachments (Multiple Photos Supported) */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-blue-700" />
                  Announcement Photos & Gallery (Multiple Photos Supported)
                </span>
                <p className="text-[11px] text-slate-500">
                  Upload a cover photo and additional event or documentation pictures.
                </p>
              </div>
              {totalPhotosCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    {totalPhotosCount} {totalPhotosCount === 1 ? 'Photo' : 'Photos'} Attached
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllPhotos}
                    className="text-[11px] text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Actions: Multi-file picker and URL add */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMultipleFilesUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  id="btn-upload-multiple-photos"
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Optimizing Photos...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photos (Select Multiple)
                    </>
                  )}
                </button>

                <div className="flex-1 flex gap-1.5">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      id="input-post-image-url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Or paste image or Google Drive link..."
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!urlInput.trim()}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    Add URL
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Tip: You can select multiple images at once (Hold Ctrl or Shift in the file picker to select several photos).
              </p>
            </div>

            {/* Photo Preview Grid */}
            {totalPhotosCount > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200">
                {/* Cover Photo */}
                {coverImageUrl && (
                  <div className="relative group rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-100 aspect-square flex flex-col justify-between shadow-xs">
                    <img
                      src={coverImageUrl}
                      alt="Cover photo preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Cover
                    </div>
                    <button
                      type="button"
                      title="Remove cover photo"
                      onClick={handleRemoveCover}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Additional Gallery Photos */}
                {galleryImages.map((img, idx) => (
                  <div
                    key={`gallery-img-${idx}`}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`Gallery photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          title="Remove photo"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(idx)}
                        className="w-full py-1 text-[10px] font-bold rounded bg-white text-slate-800 hover:bg-amber-100 hover:text-amber-900 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Star className="w-2.5 h-2.5 text-amber-500" />
                        Set as Cover
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 px-1 bg-black/60 text-white text-[9px] rounded font-mono">
                      #{idx + 2}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-300 rounded-lg bg-white/60">
                <Images className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">No photos attached yet.</p>
                <p className="text-[11px] text-slate-400">Click &apos;Upload Photos&apos; to add one or more pictures.</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="input-post-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Enrollment, Donsol West II, PTA, Announcements"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">Quick Tags:</span>
              <button
                type="button"
                onClick={() => {
                  const hasFeatured = tagsInput.split(',').map((t) => t.trim().toLowerCase()).includes('featured');
                  const currentTags = tagsInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0 && t.toLowerCase() !== 'featured');
                  if (!hasFeatured) {
                    currentTags.unshift('featured');
                  }
                  setTagsInput(currentTags.join(', '));
                }}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer transition-colors"
              >
                ★ + featured
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tagsInput.toLowerCase().includes('donsol west ii')) {
                    setTagsInput((prev) => (prev ? `${prev}, Donsol West II` : 'Donsol West II'));
                  }
                }}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
              >
                + Donsol West II
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tagsInput.toLowerCase().includes('deped bicol')) {
                    setTagsInput((prev) => (prev ? `${prev}, DepEd Bicol` : 'DepEd Bicol'));
                  }
                }}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
              >
                + DepEd Bicol
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-publish-post"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {postToEdit ? 'Save Changes' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
