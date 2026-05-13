import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement = HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.12 }) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, opts);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
