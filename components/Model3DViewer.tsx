import React, { useRef, useState } from 'react';

interface Model3DData {
  modelName: string;
  description: string;
  imageSeed: string;
}

interface Model3DViewerProps {
  title: string;
  data: Model3DData;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ title, data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    const rotateX = -((y / height) - 0.5) * 20; // Max rotation 10deg
    const rotateY = ((x / width) - 0.5) * 20;  // Max rotation 10deg

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    });
  };

  return (
    <div className="w-full h-full flex flex-col text-white p-4 items-center justify-center">
      <h3 className="text-xl font-semibold text-cyan-200 mb-4 text-center">{title}</h3>
      <div 
        ref={containerRef}
        className="w-full max-w-lg aspect-square"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
         <div 
            className="relative w-full h-full transition-transform duration-100 ease-out [transform-style:preserve-3d]"
            style={style}
          >
            <img 
              src={`https://picsum.photos/seed/${data.imageSeed}/600`} 
              alt={data.modelName}
              className="w-full h-full object-cover rounded-lg shadow-2xl shadow-cyan-500/20"
            />
            <div className="absolute inset-0 bg-blue-900/20 rounded-lg pointer-events-none"></div>
             <div className="absolute bottom-4 left-4 bg-black/60 p-3 rounded-lg backdrop-blur-sm [transform:translateZ(40px)]">
                <h4 className="font-bold text-lg">{data.modelName}</h4>
                <p className="text-sm text-gray-300 max-w-xs">{data.description}</p>
            </div>
         </div>
      </div>
       <p className="mt-4 text-gray-300 text-center italic">Note: This is a representative 3D visualization. Move your mouse over the image to interact.</p>
    </div>
  );
};
