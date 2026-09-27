import React from 'react';
import { PostItem } from '../types';
import { Pin, Calendar, Tag, ChevronRight, Edit2, Trash2, Images, Star } from 'lucide-react';

interface PostCardProps {
  post: PostItem;
  isAdmin: boolean;
  onReadMore: (post: PostItem) => void;
  onEdit: (post: PostItem) => void;
  onDelete: (postId: string) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Announcements': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Advisories & Memos': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Campus Events': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Achievements': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Academic Updates': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isAdmin,
  onReadMore,
  onEdit,
  onDelete,
}) => {
  const categoryStyle = CATEGORY_STYLES[post.category] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displayImage = post.imageUrl || (post.galleryImages && post.galleryImages.length > 0 ? post.galleryImages[0] : undefined);
  const totalPhotos = (post.imageUrl ? 1 : 0) + (post.galleryImages ? post.galleryImages.length : 0);

  return (
    <article
      id={`post-card-${post.id}`}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Status Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          >
            {post.category}
          </span>

          <div className="flex items-center gap-1.5">
            {post.tags && post.tags.some((t) => t.trim().toLowerCase() === 'featured') && (
              <span
                title="Featured on Hero Carousel"
                className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md"
              >
                <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>Featured</span>
              </span>
            )}

            {post.pinned && (
              <span
                title="Pinned post"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md"
              >
                <Pin className="w-3 h-3 text-blue-700" />
                <span className="hidden sm:inline">Pinned</span>
              </span>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  id={`btn-edit-post-${post.id}`}
                  onClick={() => onEdit(post)}
                  title="Edit post"
                  className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id={`btn-delete-post-${post.id}`}
                  onClick={() => onDelete(post.id)}
                  title="Delete post"
                  className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date & Department */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{formattedDate}</span>
          </div>
          {post.department && (
            <>
              <span>•</span>
              <span className="truncate max-w-[160px]">{post.department}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onReadMore(post)}
          className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
          {post.summary}
        </p>

        {/* Thumbnail if provided */}
        {displayImage && (
          <div
            onClick={() => onReadMore(post)}
            className="relative mt-3 rounded-lg overflow-hidden h-36 w-full border border-slate-200 bg-slate-100 cursor-pointer"
          >
            <img
              src={displayImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            {totalPhotos > 1 && (
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Images className="w-3 h-3 text-blue-400" />
                {totalPhotos} photos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer with tags & Action */}
      <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {post.tags && post.tags.length > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <Tag className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{post.tags.slice(0, 2).join(', ')}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Official Notice</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onReadMore(post)}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Read Full</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
