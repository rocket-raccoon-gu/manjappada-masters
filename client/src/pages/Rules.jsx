import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';

const DOCX_HREF = '/docs/Masters-Cup-2026-Rules-Regulations-By-Laws-Ver2.0.docx';

const facts = [
  { label: 'Venue', value: 'Park House School, Abu Hamour, Doha' },
  { label: 'Date', value: '11 December 2026' },
  { label: 'Kickoff', value: '03:00 PM' },
  { label: 'Registration', value: '70135305' },
];

const explainers = [
  {
    title: '7’s knockout format',
    image: '/rules/format.jpg',
    alt: 'Seven footballers and a knockout bracket illustration',
    points: [
      '6 outfield + 1 goalkeeper on the pitch',
      'Single-elimination — a loss ends the run',
      'Up to 16 teams; byes drawn by lot if needed',
      'Path: Round of 16 → Quarters → Semis → Final',
    ],
  },
  {
    title: 'Who can play',
    image: '/rules/eligibility.jpg',
    alt: 'Age eligibility and Qatar ID illustration',
    points: [
      'Age 35+ — born on or before 31 Dec 1991',
      'Qatar ID / passport DOB is final',
      'Valid QID or residence permit; Indian nationals only',
      'One team only; medical fitness confirmed by each player',
    ],
  },
  {
    title: 'Match day',
    image: '/rules/matchday.jpg',
    alt: 'Match day check-in clipboard and whistle illustration',
    points: [
      'Playing list of 10 (7 + 3) before kickoff',
      'Report 30 minutes early with Qatar ID',
      'Minimum 5 players to start; 10-minute grace then walkover',
      'Team jerseys, turf shoes preferred — no steel studs',
    ],
  },
  {
    title: 'Fair play on the field',
    image: '/rules/fairplay.jpg',
    alt: 'Fair play cards, whistle and football illustration',
    points: [
      'No offside; unlimited rolling substitutions',
      'No sliding tackles — free kick and possible card',
      'Draws decided by penalties (final has short ET first)',
      'Referee decisions are final — no video review',
    ],
  },
];

const sections = [
  {
    title: '1. Introduction',
    items: [
      '1.1 Manjappada Qatar Wing (KBFC Supporters Club), the Organizer, hosts Masters 7s Football Cup 2026 — a 7’s knockout tournament for players aged 35 and above.',
      '1.2 The Organizing Committee may amend rules or match schedules.',
      '1.3 The fixture draw is held with a Team Manager or representative from each team present.',
    ],
  },
  {
    title: '2. Tournament Format',
    items: [
      '2.1 Seven-a-side: 6 outfield players and 1 goalkeeper (unless a player is red-carded).',
      '2.2 Single-elimination knockout — a loss ends the team’s run.',
      '2.3 Up to 16 teams. If the field is not a power of two, byes are drawn by lot (max one bye per team).',
      '2.4 Stages: Round of 16 / Quarterfinals / Semi-finals / Final (third-place match if scheduled).',
    ],
  },
  {
    title: '3. Eligibility',
    items: [
      '3.1 Age 35+: born on or before 31 December 1991.',
      '3.2 Qatar ID (or passport) date of birth is final; the Committee may verify documents anytime.',
      '3.3 Valid Qatar ID / residence permit required. Indian nationals only.',
      '3.4 A player may represent only one team.',
      '3.5 Players confirm they are medically fit; a pre-tournament check-up is strongly recommended.',
    ],
  },
  {
    title: '4. Team Registration',
    items: [
      '4.1 Maximum 12 players + 1 Team Manager (13 persons).',
      '4.2 Submit: registration form & player list, QID copies (passport if needed), passport photo per player, signed rules copy, and signed Team Management Undertaking.',
      '4.3 Non-refundable fee QAR 350 due before 30 November 2026 (cash / bank transfer as advised).',
      '4.4 Team registration closes 27 November 2026; player list closes 30 November 2026. Post-draw list changes need Committee approval.',
      '4.5 Defaulting teams may be excluded or replaced.',
      '4.6 Enquiries / registration: 70135305.',
    ],
  },
  {
    title: '5. Match Day Procedures',
    items: [
      '5.1 Before each match, submit a playing list of 10 players (7 + 3) from the registered squad.',
      '5.2 Report at least 30 minutes early; present Qatar ID at the desk.',
      '5.3 Minimum 5 players to start; opponents may field a full 7 if available.',
      '5.4 10-minute grace for no-shows, then walkover (typically 3–0).',
      '5.5 Team jerseys required; second-listed team changes or wears bibs on a clash.',
      '5.6 Shin guards recommended. No steel studs or barefoot play; plastic/rubber turf shoes preferred. Remove jewelry.',
      '5.7 Only listed officials in the team area. Teams arrange refreshments other than water.',
      '5.8 Smoking, vaping, and alcohol are prohibited at the venue.',
    ],
  },
  {
    title: '6. Match Rules',
    items: [
      '6.1 Laws of the Game adapted for 7-a-side and these by-laws.',
      '6.2 Duration — Early rounds / QF: 10 min halves, 3 min break. Semi-finals: 12 / 4. Final: 15 / 5.',
      '6.3 Level matches: three penalties each, then sudden death.',
      '6.4 Final: if level, two halves of 3 minutes extra time, then penalties as in 6.3.',
      '6.5 Unlimited rolling substitutions from the list of 10, via halfway with referee permission.',
      '6.6 No offside.',
      '6.7 No sliding tackles — direct free kick and possible card. Dangerous play is penalized.',
      '6.8 Referee decisions are final; no video review.',
      '6.9 Committee may amend schedule for delays, weather, or venue issues.',
    ],
  },
  {
    title: '7. Discipline',
    items: [
      '7.1 Two yellows in one match = red. Yellows do not carry between matches.',
      '7.2 Red card: sent off and suspended for the next match; team continues a player short.',
      '7.3 Violent conduct or abuse may bring longer bans or team expulsion.',
      '7.4 Teams are responsible for officials, players, and supporters.',
    ],
  },
  {
    title: '8. Health, Safety and Liability',
    items: [
      '8.1 Play at own risk; each player owns fitness and medical condition.',
      '8.2 First aid is provided. Organizer / Committee are not liable for injuries, medical issues, or lost belongings.',
      '8.3 Teams bear costs from venue or local rule breaches and must care for school property.',
    ],
  },
  {
    title: '9. Appeals and Complaints',
    items: [
      '9.1 Written appeals via the Team Manager within 30 minutes of full time.',
      '9.2 Appeal fee QAR 35 — refunded if upheld.',
      '9.3 On-field referee decisions cannot be appealed.',
      '9.4 Ineligible player findings may disqualify the whole team; opponents advance.',
      '9.5 Gaps in these rules are decided by the Committee; that decision is final.',
    ],
  },
  {
    title: '10. Awards',
    items: [
      'Champions and runners-up trophies / prizes as announced.',
      'Individual awards may include Best Player, Top Scorer, Best Goalkeeper, and Fair Play Team.',
    ],
  },
  {
    title: '11. General',
    items: [
      '11.1 Carry a valid Qatar ID or work visa and present it when asked.',
      '11.2 Sportsmanship, respect, and fellowship are required.',
      '11.3 Players and teams consent to event photos/videos used for promotion.',
      '11.4 The Committee may amend or interpret these rules for smooth running of the Tournament.',
    ],
  },
];

export default function Rules() {
  useReveal();

  return (
    <section className="section rules-page">
      <div className="container">
        <div className="page-hero rules-hero reveal">
          <div>
            <h1>Rules &amp; Regulations</h1>
            <p>
              Masters 7s Football Cup 2026 By-Laws · 7&apos;s knockout · Age 35 and above · Manjappada Qatar Wing
              (KBFC Supporters Club)
            </p>
          </div>
          <a className="btn btn-primary" href={DOCX_HREF} download>
            Download By-Laws (DOCX)
          </a>
        </div>

        <div className="rules-facts">
          {facts.map((fact, index) => (
            <div
              className="rules-fact reveal"
              style={{ '--reveal-delay': `${index * 70}ms` }}
              key={fact.label}
            >
              <span className="muted">{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>

        <div className="rules-explain reveal">
          <div className="section-head">
            <div>
              <h2>Rules at a glance</h2>
              <p>Four picture guides before the full by-laws text.</p>
            </div>
            <Link className="muted" to="/register">
              Register a team →
            </Link>
          </div>
          <div className="rules-explain-grid">
            {explainers.map((card, index) => (
              <article
                className="rules-explain-card reveal"
                style={{ '--reveal-delay': `${120 + index * 90}ms` }}
                key={card.title}
              >
                <div className="rules-explain-media">
                  <img src={card.image} alt={card.alt} loading="lazy" />
                </div>
                <div className="rules-explain-body">
                  <h3>{card.title}</h3>
                  <ul>
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="muted rules-note reveal">
          Items in [brackets] in the official document are defaults or details the Organizing
          Committee may confirm. This page summarises Ver 2.0 — download the DOCX for the signed
          undertaking form.
        </p>

        <div className="rules-sections">
          {sections.map((section, index) => (
            <article
              className="rules-section reveal"
              style={{ '--reveal-delay': `${(index % 4) * 40}ms` }}
              key={section.title}
            >
              <h2>{section.title}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="rules-undertaking reveal">
          <h2>Undertaking by Team Management</h2>
          <p>
            Team managers accept fixture responsibilities, agree to these rules, acknowledge play is
            at own risk, and confirm every player is aged 35+ (born on or before 31 December 1991)
            with genuine documents. Sign the undertaking page in the downloaded By-Laws.
          </p>
          <div className="cta-row">
            <a className="btn btn-ghost" href={DOCX_HREF} download>
              Get the full Ver 2.0 document
            </a>
            <Link className="btn btn-primary" to="/register">
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
