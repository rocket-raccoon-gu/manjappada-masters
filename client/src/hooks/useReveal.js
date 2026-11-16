import { useEffect } from 'react';

/** Adds .is-visible to .reveal elements when they enter the viewport. */
export default function useReveal(rootMargin = '0px 0px -8% 0px') {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'));
    if (!nodes.length) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  });
}
