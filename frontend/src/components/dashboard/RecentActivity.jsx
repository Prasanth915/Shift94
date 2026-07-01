import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ArrowUpRight } from 'lucide-react';

const statusIcons = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
};

const statusColors = {
  success: 'bg-emerald-50 border-emerald-100',
  failed: 'bg-red-50 border-red-100',
  pending: 'bg-amber-50 border-amber-100',
};

function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentActivity({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const status = activity.status || 'pending';
        return (
          <motion.div
            key={activity._id || activity.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border
              transition-colors duration-200 hover:bg-opacity-80
              ${statusColors[status] || 'bg-zinc-50 border-zinc-100'}
            `}
          >
            <div className="flex-shrink-0">
              {statusIcons[status] || statusIcons.pending}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {activity.projectTitle || activity.title || 'Untitled Project'}
              </p>
              <p className="text-xs text-zinc-500">
                Published to{' '}
                <span className="font-medium capitalize">
                  {activity.platform || 'unknown'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-zinc-400">
                {formatRelativeTime(activity.createdAt || activity.date)}
              </span>
              {activity.url && (
                <a
                  href={activity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
