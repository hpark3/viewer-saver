import { motion, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import Sphere from './Sphere';

const PastelBackground = () => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const spheres = useRef([
    // Group A: Floating (Intelligent placement to avoid center card)
    ...[...Array(16)].map((_, i) => {
      let x, y;
      const zone = i % 4;
      if (zone === 0) { // Top Left
        x = Math.random() * (window.innerWidth * 0.3);
        y = Math.random() * (window.innerHeight * 0.4);
      } else if (zone === 1) { // Top Right
        x = window.innerWidth * 0.7 + Math.random() * (window.innerWidth * 0.3);
        y = Math.random() * (window.innerHeight * 0.4);
      } else if (zone === 2) { // Bottom Left
        x = Math.random() * (window.innerWidth * 0.25);
        y = window.innerHeight * 0.5 + Math.random() * (window.innerHeight * 0.3);
      } else { // Bottom Right
        x = window.innerWidth * 0.75 + Math.random() * (window.innerWidth * 0.25);
        y = window.innerHeight * 0.5 + Math.random() * (window.innerHeight * 0.3);
      }
      return {
        id: `float-${i}`,
        type: 'floating',
        size: Math.random() * 40 + 40,
        initialX: x,
        initialY: y,
        delay: Math.random() * 3, // Slower entry
        color: i % 3 === 0 ? '#1A1A2E' : i % 3 === 1 ? '#FFF9C4' : '#BFFFC7'
      };
    }),
    // Group B: Settled (Bottom Pile)
    ...[...Array(35)].map((_, i) => {
      const size = Math.random() * 40 + 60;
      return {
        id: `settled-${i}`,
        type: 'settled',
        size,
        initialX: Math.random() * window.innerWidth,
        initialY: window.innerHeight - (Math.random() * 80 + 40),
        delay: Math.random() * 2 + 1,
        color: i % 4 === 0 ? '#1A1A2E' : i % 4 === 1 ? '#FFF9C4' : i % 4 === 2 ? '#BFFFC7' : '#FFD1DC'
      };
    })
  ]).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#fdfaf9]">
      {/* Slow Blobs */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -40, 80, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[120px] opacity-40 bg-pink-200"
      />
      <motion.div
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 80, -30, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full blur-[110px] opacity-35 bg-purple-200"
      />
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] rounded-full blur-[160px] opacity-[0.18] bg-rose-100" />

      {spheres.map(s => (
        <Sphere 
          key={s.id} 
          {...s} 
          initialX={s.initialX > dimensions.width ? Math.random() * dimensions.width : s.initialX}
          initialY={s.type === 'settled' ? dimensions.height - (Math.random() * 80 + 40) : (s.initialY > dimensions.height ? Math.random() * dimensions.height : s.initialY)}
          mouseX={mouseX} 
          mouseY={mouseY} 
        />
      ))}
    </div>
  );
};

export default PastelBackground;
