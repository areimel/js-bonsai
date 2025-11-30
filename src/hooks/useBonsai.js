import { useRef, useEffect, useState } from 'react';
import { JSBonsai } from '@lib/bonsai';

export function useBonsai(options = {}) {
  const containerRef = useRef(null);
  const bonsaiRef = useRef(null);
  const [isGrowing, setIsGrowing] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize JSBonsai with element reference
    bonsaiRef.current = new JSBonsai({
      ...options,
      container: containerRef.current,
      verbose: false  // Disable vanilla UI, use React controls
    });

    // Auto-start the tree generation
    if (bonsaiRef.current) {
      bonsaiRef.current.start();
    }

    return () => {
      // Cleanup on unmount
      if (bonsaiRef.current) {
        bonsaiRef.current.clearTimeouts();
        bonsaiRef.current.reset();
      }
    };
  }, []); // Only initialize once

  const regenerate = () => {
    if (bonsaiRef.current) {
      bonsaiRef.current.clearTimeouts();
      bonsaiRef.current.reset();
      bonsaiRef.current.start();
    }
  };

  const changePalette = (paletteName) => {
    if (bonsaiRef.current) {
      bonsaiRef.current.changePalette(paletteName);
    }
  };

  return {
    containerRef,
    isGrowing,
    regenerate,
    changePalette,
    bonsaiInstance: bonsaiRef.current
  };
}
