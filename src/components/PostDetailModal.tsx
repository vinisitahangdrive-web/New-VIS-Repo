import React, { useState, useEffect, useCallback } from 'react';
import { PostItem, SchoolInfo } from '../types';
import { SchoolCrest } from './SchoolCrest';
import {
  Calendar,
  User,
  Tag,
  Printer,
  Share2,
  X,
  Check,
  Pin,
  Images,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';

interface PostDetailModalProps {
  post: PostItem | null;
  onClose: () => void;
  schoolInfo: SchoolInfo;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  schoolInfo,
}) => {
  const [copied, setCopied] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Compile all attached images (cover + gallery)
  const allImages: string[] = post
    ? [
        ...(post.imageUrl ? [post.imageUrl] : []),
        ...(post.galleryImages || []),
      ].filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    : [];

  const handleNextPhoto = useCallback(() => {
    if (activePhotoIndex === null || allImages.length <= 1) return;
    setActivePhotoIndex((prev) => ((prev ?? 0) + 1) % allImages.length);
  }, [activePhotoIndex, allImages.length]);

  const handlePrevPhoto = useCallback(() => {
    if (activePhotoIndex === null || allImages.length <= 1) return;
    setActivePhotoIndex((prev) => ((prev ?? 0) - 1 + allImages.length) % allImages.length);
  }, [activePhotoIndex, allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'Escape') setActivePhotoIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, handleNextPhoto, handlePrevPhoto]);

  if (!post) return null;

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white">
        <div
          id="modal-post-detail"
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:max-w-full"
        >
          {/* Top Header Bar for Print & Document */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                {post.category}
              </span>
              {post.pinned && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  <Pin className="w-3 h-3 text-amber-700" />
                  Featured Notice
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Print Document"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Share / Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6 print:max-h-none print:overflow-visible">
            {/* Institutional Letterhead on top */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
              <SchoolCrest
                customLogoUrl={schoolInfo.logoUrl}
                size="md"
                schoolName={schoolInfo.name}
                schoolId={schoolInfo.schoolId}
              />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Department of Education • {schoolInfo.region} • {schoolInfo.division}
                </p>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {schoolInfo.name}
                </h2>
                <p className="text-xs text-slate-600">
                  School ID: <span className="font-semibold">{schoolInfo.schoolId}</span> • {schoolInfo.district} • {schoolInfo.address}
                </p>
              </div>
            </div>

            {/* Title and Metadata */}
            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border-y border-slate-100 py-2.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formattedDate}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Issuing Office: <strong className="text-slate-800">{post.department || post.author}</strong></span>
                </div>
              </div>
            </div>

            {/* Featured Photo Banner if present */}
            {allImages.length > 0 && (
              <div className="space-y-2">
                <div
                  onClick={() => setActivePhotoIndex(0)}
                  className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-96 w-full group cursor-pointer"
                >
                  <img
                    src={allImages[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Click to View Full Size
                    </span>
                  </div>
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                      <Images className="w-3.5 h-3.5 text-blue-400" />
                      {allImages.length} Photos in Gallery
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {post.content}
            </div>

            {/* Attached Photo Gallery (when multiple photos exist) */}
            {allImages.length > 1 && (
              <div className="pt-5 border-t border-slate-200 space-y-3 print:break-inside-avoid">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Images className="w-4 h-4 text-blue-600" />
                    Attached Photos & Documentation ({allImages.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click any photo to enlarge
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {allImages.map((img, idx) => (
                    <div
                      key={`modal-gallery-${idx}`}
                      onClick={() => setActivePhotoIndex(idx)}
                      className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square cursor-pointer hover:shadow-md transition-all"
                    >
                      <img
                        src={img}
                        alt={`Photo attachment ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Keywords:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Official Sign-Off Footer */}
            <div className="mt-8 pt-6 border-t border-dashed border-slate-300 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Office of the School Head & Communications Committee</p>
              <p>Vinisitahan Integrated School, Donsol West II District, Sorsogon</p>
              <p className="text-slate-500 text-[11px]">Official Email: {schoolInfo.email} | BEIS School ID: {schoolInfo.schoolId}</p>
            </div>
          </div>

          {/* Modal Bottom action */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Photo Viewer */}
      {activePhotoIndex !== null && allImages[activePhotoIndex] && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white w-full max-w-5xl mx-auto py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <Images className="w-4 h-4 text-blue-400" />
              <span>
                Photo {activePhotoIndex + 1} of {allImages.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Close viewer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Photo Display with Nav Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl w-full mx-auto overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-lg hover:scale-105"
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={allImages[activePhotoIndex]}
              alt={`Photo view ${activePhotoIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
              referrerPolicy="no-referrer"
            />

            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-lg hover:scale-105"
                title="Next photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {allImages.length > 1 && (
            <div
              className="max-w-3xl w-full mx-auto flex items-center justify-center gap-2 overflow-x-auto py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((thumb, idx) => (
                <button
                  key={`lightbox-thumb-${idx}`}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-12 h-12 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-blue-500 scale-105 shadow-md'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
