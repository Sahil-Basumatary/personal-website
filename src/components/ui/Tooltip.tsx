'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';

interface TooltipContextValue {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  show: () => void;
  hide: () => void;
  delay: number;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('Tooltip components must be used within Tooltip');
  }
  return context;
}

interface TooltipProps {
  children: React.ReactNode;
  delay?: number;
}

function TooltipRoot({ children, delay = 400 }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const show = useCallback(() => setIsOpen(true), []);
  const hide = useCallback(() => setIsOpen(false), []);
  return (
    <TooltipContext.Provider value={{ isOpen, triggerRef, show, hide, delay }}>
      {children}
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  const { triggerRef, show, hide, delay } = useTooltip();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(show, delay);
  }, [show, delay]);
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    hide();
  }, [hide]);
  const handleFocus = useCallback(() => {
    timeoutRef.current = setTimeout(show, delay);
  }, [show, delay]);
  const handleBlur = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    hide();
  }, [hide]);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  if (asChild && typeof children === 'object' && children !== null) {
    const child = children as React.ReactElement;
    return (
      <span
        ref={triggerRef as React.RefObject<HTMLSpanElement>}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ display: 'inline-block' }}
      >
        {child}
      </span>
    );
  }
  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ display: 'inline-block' }}
    >
      {children}
    </span>
  );
}

interface TooltipContentProps {
  children: React.ReactNode;
}

function TooltipContent({ children }: TooltipContentProps) {
  const { isOpen, triggerRef } = useTooltip();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (
      !isOpen ||
      !triggerRef.current ||
      !tooltipRef.current ||
      !arrowRef.current
    )
      return;
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    const arrow = arrowRef.current;
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const gap = 8;
    let placement: 'top' | 'bottom' = 'top';
    let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    let y = triggerRect.top - tooltipRect.height - gap;
    if (y < 8) {
      placement = 'bottom';
      y = triggerRect.bottom + gap;
    }
    if (y + tooltipRect.height > viewportHeight - 8) {
      placement = 'top';
      y = triggerRect.top - tooltipRect.height - gap;
    }
    if (x < 8) x = 8;
    if (x + tooltipRect.width > viewportWidth - 8) {
      x = viewportWidth - tooltipRect.width - 8;
    }
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    arrow.dataset.position = placement;
  }, [isOpen, triggerRef]);
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div ref={tooltipRef} className="tooltip" role="tooltip">
      {children}
      <span ref={arrowRef} className="tooltip-arrow" data-position="top" />
    </div>,
    document.body
  );
}

const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});

export { Tooltip };
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps };
