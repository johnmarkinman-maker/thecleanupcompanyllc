"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BUSINESS, phoneHref } from "@/lib/site";
import { ArrowIcon, PhoneIcon } from "./Icons";

const CHAPTERS = 4;
const PORTRAIT = "(max-aspect-ratio: 1/1)";
const HEADER_PX = 64;

const STEPS = [
  { t: "Send the schedule", d: "Turnover date, square footage, anything unusual about the site." },
  { t: "We walk the site", d: "We size the crew to the job and map each cleaning phase to your dates." },
  { t: "Turnover-ready on the date", d: "One point of contact from first clean to handover." },
];

function Still({ n, alt }: { n: number; alt: string }) {
  // Only shown (and so only fetched) when prefers-reduced-motion is on.
  return (
    <picture className="chapter-still">
      <source media={PORTRAIT} srcSet={`/film/stills/mobile-${n}.webp`} />
      <img src={`/film/stills/desktop-${n}.webp`} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
}

export function ScrollFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const video = videoRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let objectUrl = "";
    let ready = false;
    let current = 0;
    let raf = 0;
    let running = false;
    let cancelled = false;

    const travel = () => Math.max(1, section.offsetHeight - stage.offsetHeight);
    const progress = () => Math.min(1, Math.max(0, (HEADER_PX - section.getBoundingClientRect().top) / travel()));

    const paint = (p: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      const x = p * CHAPTERS;
      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const center = i + 0.5;
        const d = Math.abs(x - center);
        const incoming = x < center;
        // Outgoing copy clears just before the boundary; incoming copy is already
        // most of the way in, so there is always readable text and little overlap.
        let o = incoming ? (0.55 - d) / 0.1 : (0.49 - d) / 0.08;
        o = Math.min(1, Math.max(0, o));
        const pinned = (i === 0 && incoming) || (i === CHAPTERS - 1 && !incoming);
        if (pinned) o = 1;
        const shift = pinned ? 0 : incoming ? Math.max(0, d - 0.45) * 300 : -Math.max(0, d - 0.41) * 300;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
        el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      });
    };

    const tick = () => {
      const p = progress();
      paint(p);
      if (ready && video.duration) {
        const target = p * (video.duration - 0.05);
        current += (target - current) * 0.14;
        if (Math.abs(target - current) < 0.002) current = target;
        if (!video.seeking && Math.abs(video.currentTime - current) > 0.012) video.currentTime = current;
      }
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "100px 0px" });
    io.observe(section);
    paint(progress());

    // Fetch the whole clip as a Blob so seeking backward and forward never waits on the network.
    const load = () => {
      const size = window.matchMedia(PORTRAIT).matches ? "mobile" : "desktop";
      // H.264 everywhere it decodes; VP9 WebM for browsers built without it.
      const src = video.canPlayType('video/mp4; codecs="avc1.640028"') ? `/film/${size}.mp4` : `/film/${size}.webm`;
      fetch(src)
        .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then((blob) => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          video.src = objectUrl;
          video.load();
        })
        .catch(() => {
          /* poster stays up; the page still works */
        });
    };
    const onData = () => {
      ready = true;
      current = progress() * (video.duration - 0.05);
      video.currentTime = current;
      video.classList.add("is-ready");
    };
    video.addEventListener("loadeddata", onData);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (document.readyState === "complete") (idle ?? setTimeout)(load);
    else window.addEventListener("load", () => (idle ?? setTimeout)(load), { once: true });

    // iOS Safari only renders seeks after the element has been played once from a user gesture.
    const prime = () => {
      const p = video.play();
      if (p) p.then(() => video.pause()).catch(() => {});
    };
    window.addEventListener("touchstart", prime, { once: true, passive: true });

    // Keyboard users: focusing a CTA in a faded chapter scrolls that chapter into view.
    const onFocus = (e: FocusEvent) => {
      const i = chapterRefs.current.findIndex((el) => el?.contains(e.target as Node));
      if (i < 0) return;
      const want = (i + 0.5) / CHAPTERS;
      if (Math.abs(progress() - want) > 0.5 / CHAPTERS) {
        const top = window.scrollY + section.getBoundingClientRect().top - HEADER_PX + want * travel();
        window.scrollTo({ top, behavior: "auto" });
      }
    };
    section.addEventListener("focusin", onFocus);

    // "#plan" is the third chapter; jump to its scroll position rather than the pinned element.
    const toPlan = () => {
      if (window.location.hash !== "#plan") return;
      const top = window.scrollY + section.getBoundingClientRect().top - HEADER_PX + (2.5 / CHAPTERS) * travel();
      window.scrollTo({ top, behavior: "auto" });
    };
    const planTimer = setTimeout(toPlan, 60);
    window.addEventListener("hashchange", toPlan);

    return () => {
      cancelled = true;
      stop();
      io.disconnect();
      clearTimeout(planTimer);
      video.removeEventListener("loadeddata", onData);
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("hashchange", toPlan);
      section.removeEventListener("focusin", onFocus);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    chapterRefs.current[i] = el;
  };

  return (
    <section ref={sectionRef} className="film" aria-label="Turnover-ready: from dusty site to finished building">
      <div ref={stageRef} className="film-stage">
        <div className="film-media" aria-hidden="true">
          <picture>
            <source media={PORTRAIT} srcSet="/film/poster-mobile.webp" type="image/webp" />
            <img src="/film/poster-desktop.webp" alt="" fetchPriority="high" decoding="async" width={1280} height={720} />
          </picture>
          <video ref={videoRef} className="film-video" muted playsInline preload="none" disablePictureInPicture tabIndex={-1} />
        </div>
        <div className="film-shade" aria-hidden="true" />
        <div className="film-progress" aria-hidden="true">
          <span ref={barRef} />
        </div>

        <div ref={setRef(0)} className="chapter" style={{ opacity: 1 }}>
          <Still n={1} alt="Unfinished commercial ground floor at dawn with construction debris and dust in the light" />
          <div className="chapter-inner">
            <p className="label text-white/80">Commercial cleaning · Nashville &amp; Central PA</p>
            <h1 className="mt-3 text-[clamp(2.5rem,7.5vw,5rem)] font-semibold leading-[1.02] tracking-tight">
              Turnover-ready.
              <br />
              On your schedule.
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/85">
              Phased construction cleaning for general contractors who need the building finished on the date, not the day after.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Request a Quote <ArrowIcon />
              </Link>
              {BUSINESS.phone && (
                <a href={phoneHref} className="btn btn-ghost-dark">
                  <PhoneIcon className="h-4 w-4" /> Call {BUSINESS.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div ref={setRef(1)} className="chapter" style={{ opacity: 0 }}>
          <Still n={2} alt="Dust being cleared as crews work toward the glass storefront of a new building" />
          <div className="chapter-inner">
            <p className="label text-white/80">The problem</p>
            <h2 className="mt-3 text-[clamp(2.1rem,6vw,4rem)] font-semibold leading-[1.05] tracking-tight">
              The last 2% decides the punch list.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/85">
              Dust on the ledges. Debris in the corners. Streaks on the storefront glass right before the owner walks in. And you, managing a
              cleaning crew when you should be closing out.
            </p>
          </div>
        </div>

        <div ref={setRef(2)} id="plan" className="chapter" style={{ opacity: 0 }}>
          <Still n={3} alt="Technicians in green polos detailing the glass entry and polishing the floor" />
          <div className="chapter-inner">
            <p className="label text-white/80">The plan</p>
            <h2 className="mt-3 text-[clamp(2rem,5.5vw,3.6rem)] font-semibold leading-[1.05] tracking-tight">
              Three steps to a clean walkthrough.
            </h2>
            <ol className="mt-5 grid max-w-lg gap-3">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-3.5">
                  <span className="label mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-deep text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold leading-snug">{s.t}</span>
                    <span className="hidden text-white/80 sm:block">{s.d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div ref={setRef(3)} className="chapter" style={{ opacity: 0 }}>
          <Still n={4} alt="Finished commercial building at golden hour with clear glass and a polished entry" />
          <div className="chapter-inner">
            <p className="label text-white/80">The result</p>
            <h2 className="mt-3 text-[clamp(2.1rem,6vw,4rem)] font-semibold leading-[1.05] tracking-tight">
              Hand over a building that looks finished.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/85">Clear glass. Clean floors. No dust in the light. Your walkthrough stays about the work.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Request a Quote <ArrowIcon />
              </Link>
              <Link href="#checklist" className="btn btn-ghost-dark">
                Get the checklist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
