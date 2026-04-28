import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const CursorTrail = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const id = Date.now() + Math.random();
      setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }].slice(-15));
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, 600);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{ left: p.x, top: p.y }}
            className="absolute w-1 h-1 rounded-full bg-rose-300/60 blur-[0.5px]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorTrail;
