'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * HeroSlides — background slideshow for the Heritage Trust home hero.
 *
 * Put this file at:  components/commercial-ui/HeroSlides.tsx
 *
 * It only draws the background (images + dark scrim + slide controls).
 * Your headline, APY line and buttons stay exactly where they are in page.tsx.
 *
 * Image files needed (public/images/hero/):
 *   hero-1-desktop.webp  hero-2-desktop.webp  hero-3-desktop.webp   (2560x1440)
 * Optional, once you have made them (then pass useMobileImages):
 *   hero-1-mobile.webp   hero-2-mobile.webp   hero-3-mobile.webp    (1200x1600)
 *
 * Behaviour: 7s per slide, 1.2s crossfade, slow 5% zoom, pauses on hover/focus,
 * pause button, and only slide 1 for people who prefer reduced motion.
 *
 * The parent <section> in page.tsx MUST have the `isolate` class (see steps).
 */

type Slide = { id: string; base: string; alt: string };

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'family',
    base: '/images/hero/hero-1',
    alt: 'A couple and their toddler on the steps of a brownstone at dusk, the front door glowing warmly',
  },
  {
    id: 'business',
    base: '/images/hero/hero-2',
    alt: 'A bakery owner hanging a sign in her shop window at sunrise',
  },
  {
    id: 'heritage',
    base: '/images/hero/hero-3',
    alt: 'The limestone Heritage Trust building lit amber at dusk',
  },
];

type Props = {
  slides?: Slide[];
  interval?: number; // ms each slide stays
  fadeMs?: number; // ms crossfade
  useMobileImages?: boolean; // true only after the -mobile.webp files exist
};

function usePrefersReducedMotion() {
  // starts false so server and browser render the same thing (avoids hydration warnings)
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function HeroSlides({
  slides = DEFAULT_SLIDES,
  interval = 7000,
  fadeMs = 1200,
  useMobileImages = false,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const shown = reduced ? slides.slice(0, 1) : slides;
  const count = shown.length;

  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false); // mouse or keyboard focus is inside the hero
  const activeRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const playing = !reduced && !userPaused && !engaged && count > 1;

  const goTo = useCallback((next: number) => {
    if (next === activeRef.current) return;
    setPrev(activeRef.current);
    activeRef.current = next;
    setActive(next);
  }, []);

  // pause while the visitor hovers or tabs through the hero (listens on the parent <section>)
  useEffect(() => {
    const section = rootRef.current?.parentElement;
    if (!section) return undefined;
    const on = () => setEngaged(true);
    const off = () => setEngaged(false);
    section.addEventListener('mouseenter', on);
    section.addEventListener('mouseleave', off);
    section.addEventListener('focusin', on);
    section.addEventListener('focusout', off);
    return () => {
      section.removeEventListener('mouseenter', on);
      section.removeEventListener('mouseleave', off);
      section.removeEventListener('focusin', on);
      section.removeEventListener('focusout', off);
    };
  }, []);

  // go to the next slide after `interval`
  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => goTo((activeRef.current + 1) % count), interval);
    return () => clearTimeout(t);
  }, [playing, active, count, interval, goTo]);

  // let the outgoing slide finish fading before we release it
  useEffect(() => {
    if (prev === null) return undefined;
    const t = setTimeout(() => setPrev(null), fadeMs + 100);
    return () => clearTimeout(t);
  }, [prev, fadeMs]);

  const zoomMs = interval + fadeMs * 2;
  const runState = playing ? 'running' : 'paused';

  return (
    <>
      <style>{`
        @keyframes ht-kenburns { from { transform: scale(1); } to { transform: scale(1.05); } }
        @keyframes ht-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .ht-kb { animation-name: ht-kenburns; animation-timing-function: linear; animation-fill-mode: forwards; transform-origin: 70% 50%; }
        .ht-progress { animation-name: ht-progress; animation-timing-function: linear; animation-fill-mode: forwards; transform-origin: left; }
        @media (prefers-reduced-motion: reduce) { .ht-kb, .ht-progress { animation: none; } }
      `}</style>

      {/* ── images + scrims (sit behind your text) ── */}
      <div ref={rootRef} className="absolute inset-0 -z-10 bg-ink-900">
        {shown.map((s, i) => {
          const isActive = i === active;
          const zooming = !reduced && (isActive || i === prev);
          return (
            <div
              key={s.id}
              aria-hidden={!isActive}
              className="absolute inset-0 transition-opacity ease-in-out"
              style={{ opacity: isActive ? 1 : 0, transitionDuration: `${fadeMs}ms` }}
            >
              <picture className="block h-full w-full">
                {useMobileImages && (
                  <>
                    <source media="(min-width: 768px)" srcSet={`${s.base}-desktop.webp`} type="image/webp" />
                    <source srcSet={`${s.base}-mobile.webp`} type="image/webp" />
                  </>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${s.base}-desktop.webp`}
                  alt={s.alt}
                  width={2560}
                  height={1440}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`h-full w-full object-cover object-[70%_center] md:object-center ${zooming ? 'ht-kb' : ''}`}
                  style={zooming ? { animationDuration: `${zoomMs}ms`, animationPlayState: runState } : undefined}
                />
              </picture>
            </div>
          );
        })}

        {/* dark scrim, strongest on the left where the headline sits */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,24,28,0.92) 0%, rgba(20,24,28,0.62) 50%, rgba(20,24,28,0) 100%)',
          }}
        />
        {/* extra darkening at the bottom for phones */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(20,24,28,0.7) 0%, rgba(20,24,28,0) 45%, rgba(20,24,28,0.25) 100%)',
          }}
        />
      </div>

      {/* ── controls (above your text, clickable) ── */}
      {count > 1 && !reduced && (
        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-4 sm:right-6 lg:right-8">
          <div className="flex items-center" role="group" aria-label="Choose slide">
            {shown.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show slide ${i + 1} of ${count}`}
                aria-current={i === active}
                className="group flex h-8 w-11 items-center justify-center focus:outline-none"
              >
                <span className="relative block h-[3px] w-9 overflow-hidden rounded-full group-focus-visible:ring-2 group-focus-visible:ring-white">
                  <span className="absolute inset-0 block bg-paper-300 opacity-40" />
                  {i === active && (
                    <span
                      key={`${active}-${playing}`}
                      className="ht-progress absolute inset-0 block bg-vermilion-400"
                      style={
                        userPaused
                          ? { animation: 'none', transform: 'scaleX(1)' }
                          : { animationDuration: `${interval}ms`, animationPlayState: runState }
                      }
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-300 text-paper-50 transition-colors hover:text-vermilion-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {userPaused ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <rect x="2.5" y="1.5" width="2.5" height="9" fill="currentColor" />
                <rect x="7" y="1.5" width="2.5" height="9" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      )}
    </>
  );
}
