import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Heritage Trust — hero slideshow
 * Vite + React + Tailwind. No extra dependencies.
 *
 * Behaviour
 *  - 3 slides, 7s each, 1.2s crossfade, slow 5% zoom on the active slide
 *  - Pauses on hover / keyboard focus and via a visible pause button (WCAG 2.2.2)
 *  - prefers-reduced-motion: shows slide 1 only, no zoom, no controls
 *  - Left-to-right ink scrim keeps the headline readable over every photo
 *  - Optional ambient video (videoSrc) replaces the slideshow
 *
 * Image files expected for each slide `base` (see the image brief):
 *   {base}-desktop.avif  {base}-desktop.webp   (2560x1440)
 *   {base}-mobile.avif   {base}-mobile.webp    (1200x1600)
 *
 * Colours are arbitrary values taken from the screenshot. Swap them for your
 * Tailwind tokens (e.g. bg-ink, text-vermilion) if you have them.
 *   ink #14181C · sand #F3EEE3 · vermilion #C8401A (button) / #F4724A (on dark)
 */

const DEFAULT_SLIDES = [
  {
    id: "family",
    base: "/img/hero/hero-1",
    alt: "A couple and their toddler on the front steps of a brownstone at dusk",
  },
  {
    id: "business",
    base: "/img/hero/hero-2",
    alt: "A bakery owner turning the open sign in her shop window at sunrise",
  },
  {
    id: "heritage",
    base: "/img/hero/hero-3",
    alt: "The 1888 limestone Heritage Trust building lit amber at dusk",
  },
];

function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroSlideshow({
  slides = DEFAULT_SLIDES,
  interval = 7000,
  fadeMs = 1200,
  eyebrow = "Est. 1888 · Member FDIC",
  headline = "138 years",
  subline = (
    <>
      Heritage Savings earns <strong className="font-semibold">4.85% APY</strong> — with
      no minimums and no monthly fee.
    </>
  ),
  disclosure = "APY as of 1 October 2026. Variable rate. Conditions apply.",
  primaryCta = { label: "Open an account", href: "/apply" },
  secondaryCta = { label: "Sign in to Heritage Vault", href: "/signin" },
  videoSrc, // optional: "/video/hero-loop" -> loads .webm and .mp4
}) {
  const reduced = usePrefersReducedMotion();
  const shown = reduced ? slides.slice(0, 1) : slides;
  const count = shown.length;

  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false); // hover or focus inside
  const activeRef = useRef(0);

  const playing = !reduced && !userPaused && !engaged && count > 1 && !videoSrc;

  const goTo = useCallback((next) => {
    if (next === activeRef.current) return;
    setPrev(activeRef.current);
    activeRef.current = next;
    setActive(next);
  }, []);

  // advance
  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => goTo((activeRef.current + 1) % count), interval);
    return () => clearTimeout(t);
  }, [playing, active, count, interval, goTo]);

  // let the outgoing slide finish fading (and keep zooming) before we release it
  useEffect(() => {
    if (prev === null) return undefined;
    const t = setTimeout(() => setPrev(null), fadeMs + 100);
    return () => clearTimeout(t);
  }, [prev, fadeMs]);

  const kenBurnsMs = interval + fadeMs * 2;
  const runState = playing ? "running" : "paused";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Heritage Trust highlights"
      className="relative isolate overflow-hidden bg-[#14181C] min-h-[640px] h-[min(780px,calc(100svh-7rem))]"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      <style>{`
        @keyframes ht-kenburns { from { transform: scale(1); } to { transform: scale(1.05); } }
        @keyframes ht-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .ht-kb { animation-name: ht-kenburns; animation-timing-function: linear; animation-fill-mode: forwards; transform-origin: 70% 50%; }
        .ht-progress { animation-name: ht-progress; animation-timing-function: linear; animation-fill-mode: forwards; transform-origin: left; }
        @media (prefers-reduced-motion: reduce) { .ht-kb, .ht-progress { animation: none; } }
      `}</style>

      {/* ---------- media layer ---------- */}
      <div className="absolute inset-0 -z-10">
        {videoSrc && !reduced ? (
          <video
            className="h-full w-full object-cover object-[70%_center] md:object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={`${slides[0].base}-desktop.webp`}
            aria-hidden="true"
          >
            <source src={`${videoSrc}.webm`} type="video/webm" />
            <source src={`${videoSrc}.mp4`} type="video/mp4" />
          </video>
        ) : (
          shown.map((s, i) => {
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
                  <source media="(min-width: 768px)" srcSet={`${s.base}-desktop.avif`} type="image/avif" />
                  <source media="(min-width: 768px)" srcSet={`${s.base}-desktop.webp`} type="image/webp" />
                  <source srcSet={`${s.base}-mobile.avif`} type="image/avif" />
                  <source srcSet={`${s.base}-mobile.webp`} type="image/webp" />
                  <img
                    src={`${s.base}-desktop.webp`}
                    alt={s.alt}
                    width={2560}
                    height={1440}
                    // React 18: use lowercase `fetchpriority` instead
                    fetchPriority={i === 0 ? "high" : "auto"}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className={`h-full w-full object-cover object-[70%_center] md:object-center ${zooming ? "ht-kb" : ""}`}
                    style={zooming ? { animationDuration: `${kenBurnsMs}ms`, animationPlayState: runState } : undefined}
                  />
                </picture>
              </div>
            );
          })
        )}
      </div>

      {/* ---------- scrims: protect text contrast on every slide ---------- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#14181C]/90 via-[#14181C]/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#14181C]/85 via-transparent to-[#14181C]/30 md:from-[#14181C]/50"
      />

      {/* ---------- content ---------- */}
      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-20 sm:px-6 md:items-center md:pb-0 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#F3EEE3]/80">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-6xl font-semibold leading-[0.95] tracking-tight text-[#F4724A] sm:text-7xl lg:text-8xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#F3EEE3] md:text-xl">
            {subline}
          </p>
          <p className="mt-3 text-xs text-[#F3EEE3]/75">{disclosure}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-sm bg-[#C8401A] px-6 py-3.5 font-medium text-white transition-colors hover:bg-[#B23714] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14181C]"
            >
              {primaryCta.label}
              <Arrow />
            </a>
            <a
              href={secondaryCta.href}
              className="text-[#F3EEE3] underline decoration-[#F3EEE3]/40 underline-offset-4 transition-colors hover:decoration-[#F4724A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#14181C]"
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>
      </div>

      {/* ---------- controls ---------- */}
      {count > 1 && !videoSrc && !reduced && (
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
                <span className="relative block h-[3px] w-9 overflow-hidden rounded-full bg-[#F3EEE3]/30 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#14181C]">
                  {i === active && (
                    <span
                      key={`${active}-${playing}`}
                      className="ht-progress absolute inset-0 block bg-[#F4724A]"
                      style={{
                        animationDuration: `${interval}ms`,
                        animationPlayState: runState,
                        // when paused by the user, show a full bar instead of an empty one
                        ...(userPaused ? { animation: "none", transform: "scaleX(1)" } : {}),
                      }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F3EEE3]/40 text-[#F3EEE3] transition-colors hover:border-[#F4724A] hover:text-[#F4724A] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14181C]"
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

      {/* announce slide changes only when the user drives them */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        {shown[active]?.alt}
      </p>
    </section>
  );
}
