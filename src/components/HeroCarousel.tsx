import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PostItem, PostCategory, SchoolInfo } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  Star,
  Calendar,
  Tag,
  ArrowRight,
  Eye,
  Edit2,
  Images,
  PlusCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export interface CarouselSlide {
  id: string;
  postId: string;
  post: PostItem;
  imageUrl: string;
  imageIndex: number;
  totalImagesInPost: number;
  title: string;
  summary: string;
  category: PostCategory;
  date: string;
  department?: string;
  author: string;
  tags?: string[];
  pinned?: boolean;
}

interface HeroCarouselProps {
  posts: PostItem[];
  isAdmin: boolean;
  onSelectPost: (post: PostItem) => void;
  onEditPost?: (post: PostItem) => void;
  onOpenNewPost?: () => void;
  schoolInfo?: SchoolInfo;
  autoPlayInterval?: number; // In milliseconds, default 5000
}

const CATEGORY_STYLES: Record<string, { badge: string; text: string; bg: string }> = {
  'Announcements': { badge: 'bg-blue-600/90 text-white border-blue-400/40', text: 'text-blue-300', bg: 'bg-blue-500' },
  'Advisories & Memos': { badge: 'bg-amber-600/90 text-white border-amber-400/40', text: 'text-amber-300', bg: 'bg-amber-500' },
  'Campus Events': { badge: 'bg-purple-600/90 text-white border-purple-400/40', text: 'text-purple-300', bg: 'bg-purple-500' },
  'Achievements': { badge: 'bg-emerald-600/90 text-white border-emerald-400/40', text: 'text-emerald-300', bg: 'bg-emerald-500' },
  'Academic Updates': { badge: 'bg-cyan-600/90 text-white border-cyan-400/40', text: 'text-cyan-300', bg: 'bg-cyan-500' },
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  posts,
  isAdmin,
  onSelectPost,
  onEditPost,
  onOpenNewPost,
  schoolInfo,
  autoPlayInterval = 5500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // 1. Filter posts from the 'posts' collection tagged as 'featured'
  const slides: CarouselSlide[] = useMemo(() => {
    const list: CarouselSlide[] = [];

    // Filter posts that contain 'featured' in their tags (case-insensitive)
    const featuredPosts = posts.filter((post) => {
      const isTaggedFeatured =
        post.tags &&
        post.tags.some((tag) => tag && tag.trim().toLowerCase() === 'featured');

      const hasImages = Boolean(
        (post.imageUrl && post.imageUrl.trim().length > 0) ||
        (post.galleryImages && post.galleryImages.some((img) => img && img.trim().length > 0))
      );

      return isTaggedFeatured && hasImages;
    });

    // If there are posts tagged as 'featured', create rich slides for them
    if (featuredPosts.length > 0) {
      featuredPosts.forEach((post) => {
        const images: string[] = [];
        if (post.imageUrl && post.imageUrl.trim().length > 0) {
          images.push(post.imageUrl.trim());
        }
        if (post.galleryImages && Array.isArray(post.galleryImages)) {
          post.galleryImages.forEach((img) => {
            if (img && img.trim().length > 0 && !images.includes(img.trim())) {
              images.push(img.trim());
            }
          });
        }

        // Each distinct image in a featured post becomes an engaging carousel slide
        images.forEach((imgUrl, imgIdx) => {
          list.push({
            id: `${post.id}-img-${imgIdx}`,
            postId: post.id,
            post,
            imageUrl: imgUrl,
            imageIndex: imgIdx,
            totalImagesInPost: images.length,
            title: post.title,
            summary: post.summary || post.content.slice(0, 160) + '...',
            category: post.category,
            date: post.date,
            department: post.department,
            author: post.author,
            tags: post.tags,
            pinned: post.pinned,
          });
        });
      });
    } else {
      // Graceful fallback: If no posts currently have the 'featured' tag,
      // showcase pinned posts with photos or recent posts with photos
      const fallbackPosts = posts.filter((post) => {
        return Boolean(
          (post.imageUrl && post.imageUrl.trim().length > 0) ||
          (post.galleryImages && post.galleryImages.length > 0)
        );
      });

      fallbackPosts.slice(0, 4).forEach((post) => {
        const cover = post.imageUrl || post.galleryImages?.[0] || '';
        if (cover) {
          list.push({
            id: `${post.id}-fallback`,
            postId: post.id,
            post,
            imageUrl: cover,
            imageIndex: 0,
            totalImagesInPost: (post.imageUrl ? 1 : 0) + (post.galleryImages?.length || 0),
            title: post.title,
            summary: post.summary || post.content.slice(0, 160) + '...',
            category: post.category,
            date: post.date,
            department: post.department,
            author: post.author,
            tags: post.tags,
            pinned: post.pinned,
          });
        }
      });
    }

    return list;
  }, [posts]);

  // Keep currentIndex bounded if slides change
  useEffect(() => {
    if (currentIndex >= slides.length && slides.length > 0) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [slides.length, currentIndex]);

  const totalSlides = slides.length;

  const goToNext = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
    lastTickRef.current = Date.now();
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
    lastTickRef.current = Date.now();
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    lastTickRef.current = Date.now();
  };

  // 2. Auto-playing timer with pause on hover & pause on manual user toggle
  useEffect(() => {
    if (totalSlides <= 1 || !isPlaying || isHovered) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      return;
    }

    lastTickRef.current = Date.now();
    const tickInterval = 50; // Update progress bar every 50ms for smooth animation

    progressTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      const newProgress = Math.min(100, (elapsed / autoPlayInterval) * 100);
      setProgress(newProgress);

      if (elapsed >= autoPlayInterval) {
        goToNext();
      }
    }, tickInterval);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [totalSlides, isPlaying, isHovered, autoPlayInterval, goToNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsPlaying((prev) => !prev);
    }
  };

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    setTouchStartX(null);
  };

  // If no slides available at all, show official campus welcome hero
  if (totalSlides === 0) {
    return (
      <section
        id="hero-carousel-section"
        aria-label="Campus Hero"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>DepEd Donsol West II District</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {schoolInfo?.name || 'Vinisitahan Integrated School'}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Welcome to the official digital portal of Vinisitahan Integrated School (School ID: {schoolInfo?.schoolId || '502996'}). Empowering young minds with quality education, resilience, and community values.
            </p>

            {isAdmin && onOpenNewPost && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenNewPost}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Featured Announcement</span>
                </button>
                <span className="text-xs text-slate-400 italic">
                  Tip: Add the tag <strong>'featured'</strong> with an image to feature announcements here!
                </span>
              </div>
            )}
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none translate-x-12">
            <Building2 className="w-96 h-96 text-white" />
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];
  const categoryStyle = CATEGORY_STYLES[currentSlide.category] || {
    badge: 'bg-blue-600 text-white border-blue-400/30',
    text: 'text-blue-300',
    bg: 'bg-blue-600',
  };

  const formattedDate = new Date(currentSlide.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section
      id="hero-carousel-section"
      aria-label="Featured Announcements & News Carousel"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Outer Card with 16:9 / Cinematic Ratio */}
      <div
        className="relative group w-full h-[400px] sm:h-[480px] lg:h-[530px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-800/20 bg-slate-950 select-none focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Images with Crossfade & subtle Ken Burns Zoom */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className={`w-full h-full object-cover transform transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
              />

              {/* Multi-layered Vignette & Dark Gradient Overlay for Maximum Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent sm:max-w-3xl" />
            </div>
          );
        })}

        {/* Top Bar Controls: Featured Pill, Photo Count, AutoPlay Status */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-auto">
          {/* Spotlight Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/40 text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="tracking-wide uppercase text-[11px]">Featured Spotlight</span>
            </div>

            {currentSlide.totalImagesInPost > 1 && (
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 border border-white/10 text-[11px] font-medium shadow-md">
                <Images className="w-3 h-3 text-blue-400" />
                <span>Photo {currentSlide.imageIndex + 1} of {currentSlide.totalImagesInPost}</span>
              </div>
            )}
          </div>

          {/* Right Top Controls: AutoPlay Pause/Resume & Slide Counter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-carousel-autoplay-toggle"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white border border-white/20 text-xs font-semibold shadow-md transition-all cursor-pointer"
              title={isPlaying ? 'Pause autoplay (Space)' : 'Start autoplay (Space)'}
              aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Playing</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline text-[11px]">Paused</span>
                </>
              )}
            </button>

            <div className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 border border-white/10 text-xs font-mono font-bold shadow-md">
              <span className="text-amber-400">{currentIndex + 1}</span>
              <span className="text-slate-500"> / </span>
              <span>{totalSlides}</span>
            </div>
          </div>
        </div>

        {/* Content Overlay Area (Bottom Left) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-8 lg:p-10 pointer-events-none">
          <div className="max-w-3xl space-y-3 pointer-events-auto">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${categoryStyle.badge}`}
              >
                {currentSlide.category}
              </span>

              {/* Date */}
              <div className="inline-flex items-center gap-1 text-xs text-slate-300 font-medium bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>{formattedDate}</span>
              </div>

              {/* Department */}
              {currentSlide.department && (
                <div className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-300 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className="text-amber-300 font-medium">{currentSlide.department}</span>
                </div>
              )}
            </div>

            {/* Post Title */}
            <h2
              onClick={() => onSelectPost(currentSlide.post)}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight line-clamp-2 leading-tight drop-shadow-md hover:text-amber-300 transition-colors cursor-pointer"
            >
              {currentSlide.title}
            </h2>

            {/* Post Summary Excerpt */}
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-xs max-w-2xl font-normal">
              {currentSlide.summary}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id={`btn-carousel-read-${currentSlide.postId}`}
                onClick={() => onSelectPost(currentSlide.post)}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Read Full Announcement</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>

              {isAdmin && onEditPost && (
                <button
                  type="button"
                  id={`btn-carousel-edit-${currentSlide.postId}`}
                  onClick={() => onEditPost(currentSlide.post)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-xs border border-white/30 transition-all cursor-pointer"
                  title="Edit this post as Administrator"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Edit Post</span>
                </button>
              )}

              {/* Tag Badges Preview */}
              {currentSlide.tags && currentSlide.tags.length > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {currentSlide.tags.slice(0, 3).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Previous & Next Navigation Buttons (Accessible, Glassmorphic) */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              id="btn-carousel-prev"
              onClick={goToPrev}
              aria-label="Previous featured announcement"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md shadow-xl transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer focus:opacity-100 focus:outline-hidden"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              id="btn-carousel-next"
              onClick={goToNext}
              aria-label="Next featured announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md shadow-xl transition-all opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer focus:opacity-100 focus:outline-hidden"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Bottom Slide Indicators / Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-8 z-30 flex items-center gap-1.5 sm:gap-2">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  id={`btn-carousel-indicator-${idx}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-7 sm:w-9 bg-amber-400 shadow-md ring-2 ring-amber-400/40'
                      : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/80'
                  }`}
                  title={`${idx + 1}. ${slide.title}`}
                />
              );
            })}
          </div>
        )}

        {/* Real-time Animated Progress Bar at Bottom of Carousel */}
        {totalSlides > 1 && isPlaying && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Admin Quick Tips / Helper Banner */}
      {isAdmin && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
            <span>
              <strong>Hero Carousel:</strong> Showing {totalSlides} featured {totalSlides === 1 ? 'slide' : 'slides'} tagged as <code>'featured'</code> from the Firestore posts collection.
            </span>
          </div>
          {onOpenNewPost && (
            <button
              type="button"
              onClick={onOpenNewPost}
              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Featured Post</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
