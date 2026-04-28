import { Bot } from 'lucide-react';
import { motion } from 'motion/react';

const RenderStage9 = ({ copy }: any) => (
  <div className="flex flex-col items-center justify-center py-16 space-y-8 h-full">
    <div className="relative w-24 h-24">
      {/* Decorative orbiting rings for the completion state */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/20"
      />
      <div className="absolute inset-2 rounded-full bg-emerald-100/50 animate-pulse" />
      <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Bot className="text-emerald-600/60" size={32} />
      </div>
    </div>
    <div className="text-center space-y-2">
      <p className="text-sm font-bold text-text-secondary tracking-widest uppercase">{copy.stage9.title}...</p>
      <p className="text-xs text-text-secondary opacity-60">{copy.stage9.description}</p>
    </div>
  </div>
);

export default RenderStage9;
