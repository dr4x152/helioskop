import type { SVGProps } from "react";

/** Wspólne atrybuty ikon paska narzędzi. */
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconPlay(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconToday(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

export function IconSkip(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M5 6l8 6-8 6V6zM17 6v12" />
    </svg>
  );
}

export function IconOrbits(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="10.5" />
    </svg>
  );
}

export function IconMoons(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M15.5 4.5A7.5 7.5 0 1 0 19.5 15 6 6 0 0 1 15.5 4.5z" />
    </svg>
  );
}

export function IconLabelsOn(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M5 7h9M5 12h14M5 17h11" />
    </svg>
  );
}

export function IconLabelsOff(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M5 7h9M5 12h14M5 17h11M4 5l16 14" />
    </svg>
  );
}

export function IconFollow(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  );
}

export function IconReset(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 5v5h5" />
    </svg>
  );
}

/** Przełącznik „Komety” — jądro + ogon. */
export function IconComet(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={p.className} {...base}>
      <circle cx="16.5" cy="7.5" r="2.4" />
      <path d="M14 10L4 20M15.2 12.2L7 21M12.4 9.2L5 17" />
    </svg>
  );
}
