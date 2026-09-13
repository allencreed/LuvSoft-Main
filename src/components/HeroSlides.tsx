"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Slide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const SLIDE_MS = 7000;

const slides: Slide[] = [
  {
    src: "/images/hero-1.jpg",
    alt: "Folded knitwear in soft morning light",
    eyebrow: "The Autumn Edit · 2026",
    title: "Love Soft Life",
    copy: "Quietly luxurious essentials for a softer, slower everyday.",
    cta: { label: "Shop the Collection", href: "/products" },
    secondary: { label: "Our Story", href: "/about" },
  },
  {
    src: "/images/hero-2.jpg",
    alt: "A calm interior in warm neutrals",
    eyebrow: "Home Rituals",
    title: "Rooms that exhale",
    copy: "Layers of linen, light, and nothing that asks for attention.",
    cta: { label: "Shop Home", href: "/products?category=home" },
    secondary: { label: "The Edit", href: "/#the-edit" },
  },
  {
    src: "/images/hero-3.jpg",
    alt: "Soft washed linen textures",
    eyebrow: "Ease, By Design",
    title: "Softness, kept daily",
    copy: "Hand-finished pieces made in small batches — and made to be kept.",
    cta: { label: "Shop Apparel", href: "/products?category=apparel" },
    secondary: { label: "Our Promise", href: "/shipping" },
  },
  {
    src: "/images/hero-4.jpg",
    alt: "Morning fog over quiet hills",
    eyebrow: "Seasonal, Considered",
    title: "Quiet is the luxury",
    copy: "Limited runs, finished by hand. When a piece is gone, it is gone.",
    cta: { label: "Explore the Collection", href: "/products" },
    secondary: { label: "Contact the Studio", href: "/contact" },
  },
];

export function HeroSlides() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const reducedMotion = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
      setCycle((c) => c + 1);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const goTo = useCallback(
    (i: number) => {
      setActive(i);
      setCycle((c) => c + 1);
    },
    []
  );

  const current = slides[active];

  return (
    <section
      className="relative flex h-[92svh] min-h-[560px] items-center justify-center overflow-hidden bg-surface-black"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — all mounted; active/prev crossfade over 2s */}
      {slides.map((slide, i) => {
        const isActive = i === active;
        const isPrev = i === (active - 1 + slides.length) % slides.length;
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className={[
              "hero-slide absolute inset-0 transition-opacity duration-[2000ms] ease-in-out",
              isActive ? "z-10 opacity-100" : isPrev ? "z-0 opacity-100" : "z-0 opacity-0",
            ].join(" ")}
          >
            <img
              // Remount only when a slide becomes active so Ken Burns restarts
              key={isActive ? `active-${cycle}` : "idle"}
              src={slide.src}
              alt={slide.alt}
              className="animate-kenburns h-full w-full object-cover"
              style={{ objectPosition: "center 35%" }}
              fetchPriority={i === 0 ? "high" : undefined}
            />
          </div>
        );
      })}

      {/* Legibility gradients */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />

      {/* Copy — fixed-height layer, centered; never affects hero size */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-end justify-center sm:items-center">
        <div
          key={`copy-${active}`}
          className="animate-hero-copy pointer-events-auto mx-auto w-full px-6 pt-[104px] pb-24 text-center sm:pt-28 sm:pb-28"
          style={{ maxWidth: 900 }}
          aria-live="polite"
        >
        <p className="eyebrow text-white/75">
          <span className="mr-4 inline-block h-px w-8 translate-y-[-3px] bg-gold align-middle" />
          {current.eyebrow}
          <span className="ml-4 inline-block h-px w-8 translate-y-[-3px] bg-gold align-middle" />
        </p>
        <h1 className="mt-4 text-[36px] leading-[1.06] text-white sm:mt-8 sm:text-[76px] lg:text-[104px]">
          {current.title}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[16px] font-light leading-[1.5] text-white/85 sm:mt-7 sm:text-[19px]">
          {current.copy}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:mt-11 sm:flex-row sm:gap-8">
          <Link
            href={current.cta.href}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-primary-foreground px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-all hover:bg-white hover:shadow-[0_2px_24px_rgba(0,0,0,0.25)] active:scale-[0.97] sm:px-10 sm:py-4 sm:text-[12px]"
          >
            {current.cta.label}
          </Link>
          {current.secondary && (
            <Link
              href={current.secondary.href}
              className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-white/90 transition-colors hover:text-white"
            >
              {current.secondary.label}
              <span className="block h-px w-6 bg-gold transition-all duration-300 group-hover:w-10" />
            </Link>
          )}
        </div>
      </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute inset-x-0 bottom-8 z-30 flex items-center justify-center gap-3">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className={[
              "h-[2px] rounded-full transition-all duration-700 ease-out",
              i === active
                ? "w-10 bg-white"
                : "w-5 bg-white/35 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
