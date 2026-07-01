import { motion } from 'framer-motion';

export default function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  index = 0,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className={`
        bg-white rounded-2xl border border-zinc-100 p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        transition-shadow duration-300
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-zinc-600" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend > 0
                ? 'bg-emerald-50 text-emerald-600'
                : trend < 0
                ? 'bg-red-50 text-red-600'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.2, type: 'spring' }}
          className="text-3xl font-bold text-zinc-900 tracking-tight"
        >
          {value}
        </motion.p>
        <p className="text-sm text-zinc-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
