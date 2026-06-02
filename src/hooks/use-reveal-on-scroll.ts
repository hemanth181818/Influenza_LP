import { useEffect, useRef } from "react";

/**
 * Attach to elements with class `.reveal-on-scroll` and toggle `.is-visible`
 * once they enter the viewport. Honors prefers-reduced-motion by revealing
 * immediately.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current ?? document;
    const targets = (root instanceof HTMLElement ? root : document).querySelectorAll<HTMLElement>(
      ".reveal-on-scroll"
    );
    if (!targets.length) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
