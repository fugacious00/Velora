import React, { useState, useEffect, useRef, useCallback } from "react";

interface VerticalScrollRailProps {
  targetId?: string;
}

export const VerticalScrollRail: React.FC<VerticalScrollRailProps> = ({
  targetId = "auth-scroll-viewport",
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeightRatio, setThumbHeightRatio] = useState(0.25);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrollable, setIsScrollable] = useState(true);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const repeatIntervalRef = useRef<number | null>(null);

  // Helper to get scroll target element or window
  const getScrollTarget = useCallback((): HTMLElement | null => {
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) return el;
    }
    return null;
  }, [targetId]);

  // Recalculate thumb position and size
  const updateScroll = useCallback(() => {
    const target = getScrollTarget();

    let scrollHeight = 0;
    let clientHeight = 0;
    let scrollTop = 0;

    if (target) {
      scrollHeight = target.scrollHeight;
      clientHeight = target.clientHeight;
      scrollTop = target.scrollTop;
    } else {
      scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      clientHeight = window.innerHeight;
      scrollTop = window.scrollY || document.documentElement.scrollTop;
    }

    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    if (maxScroll <= 1) {
      setScrollProgress(0);
      setThumbHeightRatio(0.4);
      setIsScrollable(false);
      return;
    }

    setIsScrollable(true);
    const ratio = Math.max(0.1, Math.min(0.85, clientHeight / scrollHeight));
    setThumbHeightRatio(ratio);

    const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
    setScrollProgress(progress);
  }, [getScrollTarget]);

  // Perform scroll by delta
  const scrollByDelta = useCallback(
    (delta: number, smooth: boolean = true) => {
      const target = getScrollTarget();
      if (target) {
        target.scrollBy({
          top: delta,
          behavior: smooth ? "smooth" : "auto",
        });
      } else {
        window.scrollBy({
          top: delta,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    },
    [getScrollTarget]
  );

  // Scroll to absolute ratio (0 to 1)
  const scrollToRatio = useCallback(
    (ratio: number, smooth: boolean = true) => {
      const target = getScrollTarget();
      const clampedRatio = Math.max(0, Math.min(1, ratio));

      if (target) {
        const maxScroll = Math.max(0, target.scrollHeight - target.clientHeight);
        target.scrollTo({
          top: clampedRatio * maxScroll,
          behavior: smooth ? "smooth" : "auto",
        });
      } else {
        const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const winHeight = window.innerHeight;
        const maxScroll = Math.max(0, docHeight - winHeight);
        window.scrollTo({
          top: clampedRatio * maxScroll,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    },
    [getScrollTarget]
  );

  // Set up listeners for scroll & resize
  useEffect(() => {
    updateScroll();

    const target = getScrollTarget();
    const handleScrollEvent = () => updateScroll();

    if (target) {
      target.addEventListener("scroll", handleScrollEvent, { passive: true });
    }
    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    window.addEventListener("resize", handleScrollEvent, { passive: true });

    // Observe size changes of target
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScroll());
      if (target) resizeObserver.observe(target);
      if (document.body) resizeObserver.observe(document.body);
    }

    return () => {
      if (target) {
        target.removeEventListener("scroll", handleScrollEvent);
      }
      window.removeEventListener("scroll", handleScrollEvent);
      window.removeEventListener("resize", handleScrollEvent);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [getScrollTarget, updateScroll]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (repeatIntervalRef.current) {
        window.clearInterval(repeatIntervalRef.current);
      }
    };
  }, []);

  // Continuous scrolling on arrow hold
  const startContinuousScroll = (direction: -1 | 1) => {
    const step = direction * Math.max(80, window.innerHeight * 0.15);
    scrollByDelta(step, true);

    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    repeatIntervalRef.current = window.setInterval(() => {
      scrollByDelta(step, false);
    }, 100);
  };

  const stopContinuousScroll = () => {
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  };

  // Up Arrow Click
  const handleScrollUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByDelta(-Math.max(160, window.innerHeight * 0.25), true);
  };

  // Down Arrow Click
  const handleScrollDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollByDelta(Math.max(160, window.innerHeight * 0.25), true);
  };

  // Track click to jump
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = rect.height;
    if (trackHeight <= 0) return;

    const ratio = Math.max(0, Math.min(1, clickY / trackHeight));
    scrollToRatio(ratio, true);
  };

  // Thumb Drag handling
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;

    const target = getScrollTarget();
    if (target) {
      dragStartScrollRef.current = target.scrollTop;
    } else {
      dragStartScrollRef.current = window.scrollY || document.documentElement.scrollTop;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const trackHeight = trackRef.current.clientHeight;
      if (trackHeight <= 0) return;

      const deltaY = e.clientY - dragStartYRef.current;
      const target = getScrollTarget();

      let scrollHeight = 0;
      let clientHeight = 0;

      if (target) {
        scrollHeight = target.scrollHeight;
        clientHeight = target.clientHeight;
      } else {
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        clientHeight = window.innerHeight;
      }

      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      if (maxScroll <= 0) return;

      const scrollDelta = (deltaY / trackHeight) * maxScroll;
      const newScroll = Math.max(0, Math.min(maxScroll, dragStartScrollRef.current + scrollDelta));

      if (target) {
        target.scrollTop = newScroll;
      } else {
        window.scrollTo({ top: newScroll });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, getScrollTarget]);

  // Wheel over rail
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    scrollByDelta(e.deltaY, false);
  };

  // Calculate thumb height and top
  const thumbPercent = Math.max(10, thumbHeightRatio * 100);
  const maxTopPercent = 100 - thumbPercent;
  const topPercent = scrollProgress * maxTopPercent;

  return (
    <aside
      aria-label="Vertical Navigation Scroll Rail"
      onWheel={handleWheel}
      className="fixed right-0 top-0 bottom-0 z-50 w-4 sm:w-4.5 bg-[#2B2D31] text-[#9A9DA5] flex flex-col justify-between items-center select-none shadow-md border-l border-[#202225]"
    >
      {/* 1. TOP ARROW BUTTON (Upward Triangle) */}
      <button
        type="button"
        onClick={handleScrollUp}
        onMouseDown={() => startContinuousScroll(-1)}
        onMouseUp={stopContinuousScroll}
        onMouseLeave={stopContinuousScroll}
        aria-label="Scroll Up"
        title="Scroll Up"
        className="w-full h-6 flex items-center justify-center text-[#9A9DA5] hover:text-white hover:bg-[#383A40] active:bg-[#404249] transition-colors cursor-pointer shrink-0 border-b border-[#202225]/40"
      >
        <svg
          className="w-3 h-3 fill-current transition-transform active:scale-90"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 2L8.5 7H1.5L5 2Z" />
        </svg>
      </button>

      {/* 2. MIDDLE TRACK & THUMB PILL */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="w-full flex-1 relative cursor-pointer group bg-[#2B2D31]"
      >
        {/* Scroll Thumb Pill */}
        <div
          onMouseDown={handleThumbMouseDown}
          className={`absolute left-[2.5px] right-[2.5px] rounded-full transition-all cursor-grab active:cursor-grabbing ${
            isDragging
              ? "bg-[#E5E7EB] ring-1 ring-white/30"
              : "bg-[#82858D] hover:bg-[#9CA3AF] group-hover:bg-[#9CA3AF]"
          }`}
          style={{
            top: `${topPercent}%`,
            height: `${thumbPercent}%`,
            minHeight: "26px",
          }}
        />
      </div>

      {/* 3. BOTTOM ARROW BUTTON (Downward Triangle) */}
      <button
        type="button"
        onClick={handleScrollDown}
        onMouseDown={() => startContinuousScroll(1)}
        onMouseUp={stopContinuousScroll}
        onMouseLeave={stopContinuousScroll}
        aria-label="Scroll Down"
        title="Scroll Down"
        className="w-full h-6 flex items-center justify-center text-[#9A9DA5] hover:text-white hover:bg-[#383A40] active:bg-[#404249] transition-colors cursor-pointer shrink-0 border-t border-[#202225]/40"
      >
        <svg
          className="w-3 h-3 fill-current transition-transform active:scale-90"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 8L1.5 3H8.5L5 8Z" />
        </svg>
      </button>
    </aside>
  );
};
