import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

const Sphere = ({ initialX, initialY, size, color, mouseX, mouseY, delay, type }: any) => {
  // Slower falling speed: lower stiffness (150 -> 40), higher damping (30 -> 60) for zero-gravity feel
  const x = useSpring(initialX, { damping: type === 'floating' ? 40 : 25, stiffness: type === 'floating' ? 100 : 60 });
  const y = useSpring(-200, { damping: type === 'floating' ? 60 : 40, stiffness: type === 'floating' ? 40 : 30 });
  const floatingOffset = useMotionValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      y.set(initialY);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [initialY, delay, y]);

  useAnimationFrame((time) => {
    // Floating effect for Group A: 25px amplitude
    if (type === 'floating') {
      const float = Math.sin(time / 2000 + initialX) * 25;
      floatingOffset.set(float);
    } else {
      // Subtle breathing for Group B: 3-5px amplitude even after settling
      const breathe = Math.sin(time / 3000 + initialX) * 4;
      floatingOffset.set(breathe);
    }

    const currentX = x.get() as unknown as number;
    const currentY = (y.get() as unknown as number) + (floatingOffset.get() as unknown as number);
    
    const dx = currentX - (mouseX.get() as unknown as number);
    const dy = currentY - (mouseY.get() as unknown as number);
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = type === 'floating' ? 300 : 180;
    const pushStrength = type === 'floating' ? 200 : 120;

    if (distance < threshold) {
      const angle = Math.atan2(dy, dx);
      const force = (threshold - distance) / threshold;
      const pushX = Math.cos(angle) * force * pushStrength;
      const pushY = Math.sin(angle) * force * pushStrength;
      
      x.set(initialX + pushX);
      y.set(initialY + pushY);
    } else {
      x.set(initialX);
      y.set(initialY);
    }
  });

  const displayY = useTransform([y, floatingOffset], ([latestY, latestOffset]) => (latestY as number) + (latestOffset as number));

  return (
    <motion.div
      style={{
        x,
        y: displayY,
        width: size,
        height: size,
        background: color === '#1A1A2E' 
          ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, ${color} 100%)`
          : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, ${color} 70%)`,
        boxShadow: "inset -4px -4px 12px rgba(0,0,0,0.1), 0 15px 35px rgba(0,0,0,0.12)",
        opacity: color === '#1A1A2E' ? (type === 'floating' ? 0.85 : 0.95) : (type === 'floating' ? 0.7 : 0.85),
        zIndex: type === 'floating' ? 0 : 5
      }}
      className="absolute rounded-full backdrop-blur-[6px] border border-white/40"
    >
      <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] rounded-full bg-white/60 blur-[1px]" />
    </motion.div>
  );
};

export default Sphere;
