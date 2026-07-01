import { motion } from 'framer-motion';
import { ExternalLink, Trash2, Image as ImageIcon } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function ProjectCard({
  project,
  onDelete,
  onView,
  index = 0,
}) {
  const {
    title,
    description,
    coverImage,
    techStack = [],
    status,
    publishedPlatforms = [],
  } = project;

  const statusMap = {
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    failed: { variant: 'error', label: 'Failed' },
    publishing: { variant: 'warning', label: 'Publishing...' },
  };

  const statusInfo = statusMap[status] || statusMap.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden group"
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-zinc-100 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-zinc-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={statusInfo.variant} size="sm">
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-zinc-900 mb-1.5 line-clamp-1">{title}</h3>
        <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
          {description || 'No description provided'}
        </p>

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex gap-1.5">
            {publishedPlatforms.map((p) => (
              <span
                key={p}
                className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-white"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {onView && (
              <button
                onClick={() => onView(project)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project._id || project.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
