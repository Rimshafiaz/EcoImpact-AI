import { useState, useEffect } from 'react';

export function useCountUp(endValue, duration = 1500, decimals = 2, startDelay = 0) {
  const [count, setCount] = useState(0);
  const [shouldStart, setShouldStart] = useState(startDelay === 0);

  useEffect(() => {
    if (startDelay > 0) {
      const timer = setTimeout(() => {
        setShouldStart(true);
      }, startDelay);
      return () => clearTimeout(timer);
    } else {
      setShouldStart(true);
    }
  }, [startDelay]);

  useEffect(() => {
    if (!shouldStart || endValue === undefined || endValue === null || isNaN(endValue)) {
      if (!shouldStart) setCount(0);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startTime === currentTime ? 0 : endValue * easeOutQuart;
      
      setCount(currentValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [endValue, duration, shouldStart]);

  return parseFloat(count.toFixed(decimals));
}

