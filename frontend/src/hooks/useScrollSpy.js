import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to track the active section in the viewport using IntersectionObserver.
 * 
 * @param {string[]} sectionIds - Array of section IDs to track.
 * @param {Object} options - IntersectionObserver options.
 * @returns {Object} - { activeSection, setActiveSection, scrollToSection }
 */
export function useScrollSpy(sectionIds, options = {}) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const isClickScrollRef = useRef(false);
  const clickScrollTimeoutRef = useRef(null);

  useEffect(() => {
    // Keep track of all sections currently in the viewport
    const visibleSections = new Map();

    const updateActiveSection = () => {
      if (isClickScrollRef.current) return;

      // EDGE CASE: If scrolled to the absolute bottom of the window
      const isAtBottom = Math.abs(document.documentElement.scrollHeight - window.scrollY - window.innerHeight) < 10;
      if (isAtBottom) {
        console.log("[ScrollSpy] Reached bottom, setting to last section:", sectionIds[sectionIds.length - 1]);
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      // Otherwise, find the visible section that takes up the most space
      let bestMatch = null;
      let highestRatio = -1;

      visibleSections.forEach((entry, id) => {
        if (entry.isIntersecting) {
          if (entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            bestMatch = id;
          }
        }
      });

      if (bestMatch) {
        console.log("[ScrollSpy] Active section changing to:", bestMatch);
        setActiveSection(bestMatch);
      }
    };

    const observerOptions = {
      root: null, // observe viewport
      rootMargin: '-120px 0px -40% 0px', // Compensate for sticky headers (~112px)
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], // Fine-grained ratio tracking
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        console.log(`[ScrollSpy] Observer callback:`, entry.target.id, 'isIntersecting:', entry.isIntersecting, 'ratio:', entry.intersectionRatio);
        visibleSections.set(entry.target.id, entry);
      });
      updateActiveSection();
    }, observerOptions);

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        console.log(`[ScrollSpy] Observing section: ${id}`);
        observer.observe(element);
      } else {
        console.warn(`[ScrollSpy] Element not found for section: ${id}`);
      }
    });

    return () => {
      observer.disconnect();
      if (clickScrollTimeoutRef.current) {
        clearTimeout(clickScrollTimeoutRef.current);
      }
    };
  }, [sectionIds, options]); // No longer depends on scrollContainerRef

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    // Optimistically update UI immediately
    setActiveSection(id);

    // Lock the observer from overriding the state while smooth scrolling is happening
    isClickScrollRef.current = true;
    if (clickScrollTimeoutRef.current) {
      clearTimeout(clickScrollTimeoutRef.current);
    }
    
    // Smooth scroll native API
    el.scrollIntoView({ behavior: 'smooth' });

    // Release the lock after a generous timeout
    clickScrollTimeoutRef.current = setTimeout(() => {
      isClickScrollRef.current = false;
    }, 800);
  };

  return { activeSection, setActiveSection, scrollToSection };
}
