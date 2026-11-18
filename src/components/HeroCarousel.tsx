"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Banner {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_href: string | null;
  cta2_label: string | null;
  cta2_href: string | null;
}

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  const go = useCallback((d: number) => setI((cur) => (cur + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [n, paused, go]);

  if (!n) return null;

  return (
    <section
      className="relative overflow-hidden bg-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div className="relative h-[460px] sm:h-[520px] lg:h-[600px]">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            aria-hidden={idx !== i}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-transparent sm:via-ivory/50" />
            <div className="container-page relative flex h-full items-center">
              <div className="max-w-xl">
                {b.eyebrow && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold-dark">{b.eyebrow}</p>
                )}
                <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{b.title}</h1>
                {b.subtitle && <p className="mt-4 max-w-md text-base leading-relaxed text-stone sm:text-lg">{b.subtitle}</p>}
                <div className="mt-7 flex flex-wrap gap-3">
                  {b.cta_label && b.cta_href && (
                    <Link href={b.cta_href} className="btn-dark px-8">
                      {b.cta_label}
                    </Link>
                  )}
                  {b.cta2_label && b.cta2_href && (
                    <Link href={b.cta2_href} className="btn-outline px-8">
                      {b.cta2_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white sm:flex"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white sm:flex"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setI(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === i}
                className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-ink" : "w-2 bg-ink/35"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
