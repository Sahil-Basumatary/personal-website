'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HELP_CARDS, isLastHelpStep, listHelpCards } from '@/lib/help/topics';
import {
  helpAnchorSelector,
  placeHelpCard,
  type HelpAnchorId,
  type HelpPlacement,
} from '@/lib/help/placement';
import {
  buildHelpArrow,
  type HelpArrowGeometry,
  type Rect,
} from '@/lib/help/arrow-path';
import { useHelpStore } from '@/stores/help-store';
import { useAudioStore } from '@/stores/audio-store';
import { HelpVisual } from './HelpVisual';
import { HelpArrow } from './HelpArrow';

const CARD_WIDTH = 320;

function readRect(el: Element | null): Rect | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function measurePlacement(
  anchorId: HelpAnchorId,
  cardHeight: number
): HelpPlacement {
  const el = document.querySelector(helpAnchorSelector(anchorId));
  const rect = el?.getBoundingClientRect();
  return placeHelpCard({
    anchor: rect
      ? {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        }
      : null,
    card: { width: CARD_WIDTH, height: cardHeight },
    viewport: { width: window.innerWidth, height: window.innerHeight },
  });
}

export function HelpCoach() {
  const isOpen = useHelpStore((s) => s.isOpen);
  const stepIndex = useHelpStore((s) => s.stepIndex);
  const close = useHelpStore((s) => s.close);
  const next = useHelpStore((s) => s.next);
  const back = useHelpStore((s) => s.back);
  const goTo = useHelpStore((s) => s.goTo);
  const cards = listHelpCards();
  const card = HELP_CARDS[stepIndex] ?? cards[0];
  const last = isLastHelpStep(stepIndex);
  const coachRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<HelpPlacement>({
    left: 16,
    top: 80,
  });
  const [arrow, setArrow] = useState<HelpArrowGeometry | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        back();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [isOpen, close, next, back]);

  useEffect(() => {
    if (!isOpen || !card) return;
    const selector = helpAnchorSelector(card.anchor);
    const target = document.querySelector(selector);
    target?.classList.add('help-anchor-glow');
    return () => {
      target?.classList.remove('help-anchor-glow');
    };
  }, [isOpen, card, stepIndex]);

  useLayoutEffect(() => {
    if (!isOpen || !card) return;

    const update = () => {
      const chrome = coachRef.current?.querySelector('.help-coach-chrome');
      const cardHeight = chrome?.getBoundingClientRect().height ?? 420;
      const nextPlacement = measurePlacement(card.anchor, cardHeight);

      // Apply position synchronously so the arrow uses the same frame coords.
      if (coachRef.current) {
        coachRef.current.style.left = `${nextPlacement.left}px`;
        coachRef.current.style.top = `${nextPlacement.top}px`;
      }
      setPlacement(nextPlacement);

      const anchorRect = readRect(
        document.querySelector(helpAnchorSelector(card.anchor))
      );
      const width = coachRef.current?.offsetWidth || CARD_WIDTH;
      const cardRect: Rect = {
        x: nextPlacement.left,
        y: nextPlacement.top,
        width,
        height: cardHeight,
      };

      if (!anchorRect) {
        setArrow(null);
        return;
      }
      setArrow(buildHelpArrow(cardRect, anchorRect));
    };

    update();
    let frameTwo = 0;
    const frameOne = requestAnimationFrame(() => {
      update();
      frameTwo = requestAnimationFrame(update);
    });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, card, stepIndex]);

  if (!isOpen || !card) return null;

  return (
    <>
      {arrow ? (
        <div className="help-arrow-layer">
          <HelpArrow geometry={arrow} label={card.arrowLabel} />
        </div>
      ) : null}
      <div
        ref={coachRef}
        className="help-coach"
        role="dialog"
        aria-modal="false"
        aria-label="Help"
        style={{ left: placement.left, top: placement.top }}
      >
        <div className="help-coach-chrome">
          <div className="help-coach-titlebar">
            <button
              type="button"
              className="help-coach-close window-control-box window-close-box active"
              aria-label="Close Help"
              onClick={() => {
                useAudioStore.getState().playSound('click');
                close();
              }}
            />
            <span className="help-coach-title">Help</span>
          </div>
          <div className="help-coach-card">
            <HelpVisual visual={card.visual} />
            <div className="help-coach-copy">
              <h2 className="help-coach-headline">{card.headline}</h2>
              <p className="help-coach-body">{card.body}</p>
            </div>
            <div className="help-coach-footer">
              <button
                type="button"
                className="help-coach-back"
                onClick={() => {
                  useAudioStore.getState().playSound('click');
                  back();
                }}
                disabled={stepIndex === 0}
              >
                Back
              </button>
              <div
                className="help-coach-dots"
                role="tablist"
                aria-label="Help steps"
              >
                {cards.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === stepIndex}
                    aria-label={`Step ${index + 1}: ${item.headline}`}
                    className={
                      index === stepIndex
                        ? 'help-coach-dot help-coach-dot--active'
                        : 'help-coach-dot'
                    }
                    onClick={() => {
                      useAudioStore.getState().playSound('click');
                      goTo(index);
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                className="help-coach-next btn primary"
                onClick={() => {
                  useAudioStore.getState().playSound('click');
                  next();
                }}
              >
                {last ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
