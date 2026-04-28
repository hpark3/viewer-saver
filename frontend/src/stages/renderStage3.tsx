import { Bot, FolderUp, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const RenderStage3 = ({ copy, handleAutoRecapture, handleManualUpload }: any) => (
  <div className="space-y-8 py-4">
    <div className="flex flex-col items-center gap-6">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-full bg-vivid-yellow flex items-center justify-center shadow-lg shadow-vivid-yellow/20"
      >
        <RotateCcw className="text-white w-8 h-8" />
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-text-primary">{copy.stage3Decision.title}</h2>
        <p className="text-sm text-text-secondary">{copy.stage3Decision.subtitle}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button 
        onClick={handleAutoRecapture}
        className="clay-card p-8 text-left flex flex-col gap-4 group transition-all duration-300 border-2 border-transparent hover:border-primary-blue/20"
      >
        <div className="w-12 h-12 clay-icon-badge bg-primary-blue flex items-center justify-center shadow-lg shadow-primary-blue/20 group-hover:scale-110 transition-transform">
          <Bot className="text-white w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{copy.stage3Decision.autoTitle}</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{copy.stage3Decision.autoDescription}</p>
        </div>
      </button>

      <button 
        onClick={handleManualUpload}
        className="clay-card p-8 text-left flex flex-col gap-4 group transition-all duration-300 border-2 border-transparent hover:border-vivid-yellow/20"
      >
        <div className="w-12 h-12 clay-icon-badge bg-vivid-yellow flex items-center justify-center shadow-lg shadow-vivid-yellow/20 group-hover:scale-110 transition-transform">
          <FolderUp className="text-white w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{copy.stage3Decision.manualTitle}</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{copy.stage3Decision.manualDescription}</p>
        </div>
      </button>
    </div>
  </div>
);

export default RenderStage3;
