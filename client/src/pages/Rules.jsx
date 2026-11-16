const META = [
  { label: 'Venue', value: 'Park House School, Abu Hamour, Doha — Qatar' },
  { label: 'Tournament date', value: '11 December 2026' },
  { label: 'Match start', value: '03:00 PM' },
  { label: 'Registration', value: '70135305' },
];

const SECTIONS = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'format', title: '2. Tournament Format' },
  { id: 'eligibility', title: '3. Eligibility' },
  { id: 'registration', title: '4. Team Registration' },
  { id: 'match-day', title: '5. Match Day Procedures' },
  { id: 'match-rules', title: '6. Match Rules' },
  { id: 'discipline', title: '7. Discipline' },
  { id: 'health', title: '8. Health, Safety and Liability' },
  { id: 'appeals', title: '9. Appeals and Complaints' },
  { id: 'awards', title: '10. Awards' },
  { id: 'general', title: '11. General' },
  { id: 'undertaking', title: 'Undertaking by Team Management' },
];

const DURATIONS = [
  { stage: 'Early rounds / Quarterfinals', duration: '[10] minutes per half, [3]-minute break' },
  { stage: 'Semi-finals', duration: '[12] minutes per half, [4]-minute break' },
  { stage: 'Final', duration: '[15] minutes per half, [5]-minute break' },
];

export default function Rules() {
  return (
    <section className="section">
      <div className="container rules-page">
        <div className="page-hero">
          <p className="rules-kicker">Masters Cup 2026 · Ver 2.0</p>
          <h1>Rules &amp; Regulations</h1>
          <p>
            By-laws for the Manjappada Master&apos;s Cup 2026 — a 7&apos;s knockout football tournament
            for players aged 35 and above, organized by Manjappada Qatar Wing (KBFC Supporters Club).
          </p>
        </div>

        <div className="rules-toolbar">
          <p className="rules-note">
            Items in <span className="rules-bracket">[brackets]</span> are suggested defaults or
            details to be confirmed by the Organizing Committee.
          </p>
          <a
            className="btn btn-ghost on-light"
            href="/masters-cup-2026-rules-bylaws-ver2.docx"
            download
          >
            Download Ver 2.0
          </a>
        </div>

        <dl className="rules-meta">
          {META.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <nav className="rules-toc" aria-label="Rules sections">
          <h2>Contents</h2>
          <ol>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="rules-body">
          <section id="introduction" className="rules-section">
            <h2>1. Introduction</h2>
            <ol className="rules-clauses">
              <li>
                Manjappada Qatar Wing (KBFC Supporters Club), referred to as the Organizer, is pleased
                to announce the Masters Cup 2026, a 7&apos;s knockout football tournament for veteran
                players aged 35 and above (the Tournament).
              </li>
              <li>
                The Organizing Committee (the Committee) reserves the right to amend the rules or match
                schedules.
              </li>
              <li>
                The fixture draw will be held on <span className="rules-bracket">[date]</span> in the
                presence of the Team Manager or a representative of each team.
              </li>
            </ol>
          </section>

          <section id="format" className="rules-section">
            <h2>2. Tournament Format</h2>
            <ol className="rules-clauses">
              <li>
                The Tournament is a 7-a-side competition: 6 field players and 1 goalkeeper on the field
                at any time, unless a player has been red-carded.
              </li>
              <li>
                The Tournament follows a single-elimination knockout format. A team that loses a match
                is eliminated.
              </li>
              <li>
                16 teams will participate. If the number of teams is not a power of two, byes will be
                allocated by draw of lots. No team may receive more than one bye.
              </li>
              <li>
                Fixtures will be decided by draw of lots. The stages will be{' '}
                <span className="rules-bracket">
                  [Round of 16 / Quarterfinals / Semi-finals / Final]
                </span>
                , a <span className="rules-bracket">[third-place match, if scheduled]</span>.
              </li>
            </ol>
          </section>

          <section id="eligibility" className="rules-section">
            <h2>3. Eligibility</h2>
            <ol className="rules-clauses">
              <li>
                <strong>Age:</strong> Every player must be aged 35 or above, i.e. born on or before 31
                December 1991.
              </li>
              <li>
                <strong>Proof of age:</strong> The date of birth shown on the player&apos;s Qatar ID, or
                passport where the ID does not show it, is final. The Committee may verify any
                player&apos;s documents at any time.
              </li>
              <li>
                <strong>Residency:</strong> Every player must hold a valid Qatar ID (QID) or residence
                permit. Indian nationals only.
              </li>
              <li>A player may play for only one team in the Tournament.</li>
              <li>
                <strong>Fitness:</strong> Each player confirms that he is medically fit to play. A
                medical check-up before the Tournament is strongly recommended.
              </li>
            </ol>
          </section>

          <section id="registration" className="rules-section">
            <h2>4. Team Registration</h2>
            <ol className="rules-clauses">
              <li>
                A team may register a maximum of <span className="rules-bracket">[12]</span> players
                and 1 official (Team Manager), a total of <span className="rules-bracket">[13]</span>{' '}
                persons.
              </li>
              <li>
                The following must be submitted with the team registration:
                <ul>
                  <li>Completed registration form with the player list</li>
                  <li>Copy of Qatar ID for every player (and passport copy where required)</li>
                  <li>One passport-size photo per player</li>
                  <li>Copy of these Rules signed by the Team Manager</li>
                  <li>Signed Undertaking by Team Management (last page)</li>
                </ul>
              </li>
              <li>
                A non-refundable registration fee of QAR <span className="rules-bracket">[350]</span>{' '}
                must be paid to the Committee before 30 November 2026. Mode of payment:{' '}
                <span className="rules-bracket">[cash / bank transfer]</span>.
              </li>
              <li>
                Team registration closes on 27 November 2026. Player list closes on 30 November 2026.
                After the draw, changes to the player list are permitted only with Committee approval.
              </li>
              <li>
                Defaulting teams will not be included in the draw or may be substituted at the
                discretion of the Committee.
              </li>
              <li>For enquiries / registration, contact 70135305.</li>
            </ol>
          </section>

          <section id="match-day" className="rules-section">
            <h2>5. Match Day Procedures</h2>
            <ol className="rules-clauses">
              <li>
                Before every match, the team submits a playing list of 10 players (7 + 3) from its
                registered squad.
              </li>
              <li>
                Teams must report to the admin desk at least 30 minutes before match time. Players must
                present their Qatar ID at the registration desk.
              </li>
              <li>
                A minimum of 5 players must be available for a match to start. The opposing team may
                play with its full 7 players if available.
              </li>
              <li>
                Match schedules must be followed strictly. A 10-minute grace period is allowed for a
                no-show. After that, a walkover is awarded to the opposing team, with a score of{' '}
                <span className="rules-bracket">[3–0]</span>.
              </li>
              <li>
                All players must wear team jerseys. If jerseys clash, the team listed second changes or
                wears bibs provided by the Organizer.
              </li>
              <li>
                Shin guards are strongly recommended. Steel-stud shoes and barefoot play are not
                allowed. Plastic or rubber turf shoes are preferred. Jewelry and other dangerous items
                must be removed.
              </li>
              <li>
                Only team officials listed in the registration may sit in the team area. Refreshments
                other than water must be arranged by team officials.
              </li>
              <li>Smoking, vaping and alcohol are strictly prohibited at the venue.</li>
            </ol>
          </section>

          <section id="match-rules" className="rules-section">
            <h2>6. Match Rules</h2>
            <ol className="rules-clauses">
              <li>
                The match follows the standard Laws of the Game, adapted for 7-a-side and the rules
                below.
              </li>
              <li>
                Match duration:
                <div className="rules-table-wrap">
                  <table className="rules-table">
                    <thead>
                      <tr>
                        <th>Stage</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DURATIONS.map((row) => (
                        <tr key={row.stage}>
                          <td>{row.stage}</td>
                          <td>{row.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </li>
              <li>
                <strong>Draws:</strong> If a match is level at the end of regular time, each team takes
                three penalty kicks. If still level, sudden-death penalties follow until one team
                scores and the other does not in the same round.
              </li>
              <li>
                <strong>Final:</strong> If the Final is level at the end of regular time,{' '}
                <span className="rules-bracket">[two halves of 3 minutes]</span> extra time are played,
                followed by penalties as in 6.3.
              </li>
              <li>
                <strong>Substitutions:</strong> Unlimited rolling substitutions are allowed from the
                playing list of 10, through the halfway line with the referee&apos;s permission.
                Players may enter and leave the field multiple times.
              </li>
              <li>There is no offside rule.</li>
              <li>
                <strong>Safety:</strong> Sliding tackles are not permitted. A sliding tackle will be
                penalized with a direct free kick and may be carded. Dangerous play or excessive force
                will be penalized.
              </li>
              <li>
                The referee&apos;s decisions on the field are final and binding. Video, photographs or
                other external evidence will not be used to review or overturn a decision.
              </li>
              <li>
                In case of delays or weather or venue issues, the Committee may amend the schedule.
              </li>
            </ol>
          </section>

          <section id="discipline" className="rules-section">
            <h2>7. Discipline</h2>
            <ol className="rules-clauses">
              <li>
                A player receiving two yellow cards in the same match receives a red card and is sent
                off. Yellow cards do not carry forward to later matches.
              </li>
              <li>
                A player receiving a red card (direct or after a second yellow) is sent off immediately
                and is suspended from the team&apos;s next match. No substitute is allowed; the team
                completes the match with one player fewer.
              </li>
              <li>
                Violent conduct, abusive language, or abuse of referees, officials or opponents may lead
                to a longer suspension or expulsion of the player or the team, at the Committee&apos;s
                discretion.
              </li>
              <li>Teams are responsible for the conduct of their officials, players and supporters.</li>
            </ol>
          </section>

          <section id="health" className="rules-section">
            <h2>8. Health, Safety and Liability</h2>
            <ol className="rules-clauses">
              <li>
                Participation is at the player&apos;s own risk. Each player is responsible for his own
                fitness and medical condition.
              </li>
              <li>
                The Organizer provides first aid support. The Organizer and the Committee are not
                responsible for injuries, medical issues, or loss of personal belongings.
              </li>
              <li>
                Any costs, penalties or liabilities arising from violation of venue rules or local
                regulations are borne by the responsible team. Teams must take care of school property
                and facilities.
              </li>
            </ol>
          </section>

          <section id="appeals" className="rules-section">
            <h2>9. Appeals and Complaints</h2>
            <ol className="rules-clauses">
              <li>
                Any appeal or complaint must be submitted in writing to the Dispute Committee through
                the Team Manager only, within <span className="rules-bracket">[30 minutes]</span> of
                the end of the match.
              </li>
              <li>
                An appeal fee of QAR <span className="rules-bracket">[35]</span> applies. It is
                refunded if the appeal is upheld.
              </li>
              <li>Referee decisions on the field cannot be appealed (see 6.8).</li>
              <li>
                If the Committee finds at any stage that a player is ineligible (including age), the
                entire team may be disqualified, even if it won the match. The losing team advances to
                the next round.
              </li>
              <li>
                Any situation not covered by these rules will be decided by the Committee. The
                Committee&apos;s decision is final and binding.
              </li>
            </ol>
          </section>

          <section id="awards" className="rules-section">
            <h2>10. Awards</h2>
            <ul className="rules-bullets">
              <li>
                Champions and Runners-up:{' '}
                <span className="rules-bracket">[trophies / prize money]</span>
              </li>
              <li>
                Individual awards:{' '}
                <span className="rules-bracket">
                  [Best Player, Top Scorer, Best Goalkeeper, Fair Play Team]
                </span>
              </li>
            </ul>
          </section>

          <section id="general" className="rules-section">
            <h2>11. General</h2>
            <ol className="rules-clauses">
              <li>
                All players must always carry a valid Qatar ID or work visa and present it when
                requested by the Committee.
              </li>
              <li>
                Teams must maintain the spirit of sportsmanship, respect and fellowship throughout the
                Tournament.
              </li>
              <li>
                Players and teams consent to photos and videos taken at the event being used by the
                Organizer and its sponsors for promotion.
              </li>
              <li>
                The Committee reserves the right to amend, modify or interpret these rules at any time
                for the smooth conduct of the Tournament.
              </li>
            </ol>
            <p className="rules-closing">
              Thank you for your support and understanding.
              <br />
              <strong>
                Masters Cup 2026 Organizing Committee · Manjappada Qatar Wing (KBFC Supporters Club),
                Doha, Qatar
              </strong>
            </p>
          </section>

          <section id="undertaking" className="rules-section rules-undertaking">
            <h2>Undertaking by Team Management</h2>
            <ol className="rules-undertaking-list">
              <li>
                I accept full responsibility on behalf of my team to fulfil all fixtures for the
                competition.
              </li>
              <li>I and my team agree to abide by the rules of the competition.</li>
              <li>
                I acknowledge that participation is at our own risk, and that the sole responsibility
                for any injuries or medical issues lies with the respective player. The Organizer and
                the Organizing Committee shall not be held responsible for the same.
              </li>
              <li>
                I confirm that all players on my team are aged 35 or above (born on or before 31
                December 1991) and that the documents submitted are genuine.
              </li>
            </ol>
            <div className="rules-signoff">
              <p>Name of Team Manager: ______________________________________</p>
              <p>Signature: ________________________</p>
              <p>Team: ______________________________________</p>
              <p>Date: ________________________</p>
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}
