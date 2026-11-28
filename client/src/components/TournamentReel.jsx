import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';

const SLIDES = [
  {
    src: '/motion/kickoff.jpg',
    eyebrow: '11 December · Doha',
    title: 'Night kickoff energy',
    copy: 'Floodlights up for Masters Cup 2026 — 7’s knockout under the Qatar sky.',
  },
  {
    src: '/motion/celebrate.jpg',
    eyebrow: 'Age 35 & above',
    title: 'Veterans on the charge',
    copy: 'Born 1991 or earlier. One team. Full commitment from whistle to final whistle.',
  },
  {
    src: '/motion/trophy.jpg',
    eyebrow: 'Champions night',
    title: 'Chase the Cup',
    copy: 'Single-elimination path to the trophy — every match decides who stays in.',
  },
];

const INTERVAL_MS = 5200;

export default function TournamentReel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const settings = useApi(() => api.settings(), []);
  const registrationOpen = settings.data?.registration_open === true;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduce) return undefined;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      className="motion-reel reveal"
      aria-roledescription="carousel"
      aria-label="Masters Cup motion highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="motion-reel-stage">
        {SLIDES.map((slide, index) => (
          <figure
            key={slide.src}
            className={`motion-slide ${index === active ? 'is-active' : ''}`}
            aria-hidden={index !== active}
          >
            <img src={slide.src} alt="" className="motion-slide-image" />
            <div className="motion-slide-shade" />
            <figcaption className="motion-slide-caption container">
              <p className="motion-eyebrow">{slide.eyebrow}</p>
              <h2>{slide.title}</h2>
              <p>{slide.copy}</p>
              <div className="cta-row">
                {registrationOpen && (
                  <Link className="btn btn-primary" to="/register">
                    Join Now
                  </Link>
                )}
                <Link className="btn btn-ghost" to="/rules">
                  Read rules
                </Link>
                <Link className="btn btn-ghost" to="/team">
                  Team login
                </Link>
              </div>
            </figcaption>
          </figure>
        ))}

        <div className="motion-progress" aria-hidden="true">
          <span key={active} className={`motion-progress-bar ${paused ? 'is-paused' : ''}`} />
        </div>
      </div>

      <div className="motion-dots container" role="tablist" aria-label="Highlight slides">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`motion-dot ${index === active ? 'is-active' : ''}`}
            onClick={() => setActive(index)}
          >
            <span className="sr-only">{slide.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
