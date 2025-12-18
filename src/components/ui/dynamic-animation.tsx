'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface DynamicAnimationProps {
  animationUrl: string;
  className?: string;
  loop?: boolean;
}

export function DynamicAnimation({ animationUrl, className, loop = true }: DynamicAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(animationUrl);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    if (animationUrl) {
      fetchAnimation();
    }
  }, [animationUrl]);

  if (!animationData) {
    return <div className={className} />; // Placeholder
  }

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={loop} />
    </div>
  );
}
