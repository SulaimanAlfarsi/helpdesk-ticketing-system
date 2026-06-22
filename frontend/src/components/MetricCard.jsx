import { motion } from "framer-motion";

export default function MetricCard({ icon: Icon, label, value, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-500">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-950">{value}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-950">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {description && <p className="mt-4 text-sm text-neutral-500">{description}</p>}
    </motion.div>
  );
}
