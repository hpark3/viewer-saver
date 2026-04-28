import { motion } from 'motion/react';

const BackgroundAtmosphere = () => {
  return (
    <div className="bg-atmosphere">
      {/* Large Soft Clouds */}
      <motion.div 
        animate={{ 
          x: [0, 150, -100, 0],
          y: [0, -80, 150, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="cloud-blob w-[800px] h-[800px] -top-40 -left-40" 
      />
      <motion.div 
        animate={{ 
          x: [0, -180, 120, 0],
          y: [0, 120, -180, 0],
          rotate: [0, -15, 15, 0]
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="cloud-blob w-[700px] h-[700px] top-1/3 -right-40" 
      />
      
      {/* Blue Atmospheric Accents */}
      <motion.div 
        animate={{ 
          x: [0, 100, -100, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="cloud-blob-blue w-[600px] h-[600px] bottom-0 left-0" 
      />
      
      {/* Smaller Floating Clouds */}
      <motion.div 
        animate={{ 
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="cloud-blob w-[300px] h-[300px] top-1/4 left-1/4 opacity-20" 
      />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{ 
            y: [null, Math.random() * -100 - 50],
            opacity: [null, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px] z-0"
        />
      ))}
    </div>
  );
};

export default BackgroundAtmosphere;
