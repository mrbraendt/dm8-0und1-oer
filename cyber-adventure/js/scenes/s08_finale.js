// ============================================================
// S08 — FINALES PROTOKOLL (Datenschutz + Abschluss)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor } from '../helpers.js';

export function build(container, engine) {
  container.className = 'bg-finale';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Big studio backdrop ----
  const stage = el('div', {
    left: '10%', top: '5%', width: '78%', height: '55%',
    background: 'linear-gradient(135deg,rgba(0,40,40,0.6),rgba(40,0,40,0.4))',
    border: '2px solid rgba(0,212,255,0.3)',
    borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '0.5rem',
    overflow: 'hidden',
  });
  stage.innerHTML = `
    <div id="pete-screen" style="font-family:'Orbitron',sans-serif;font-size:clamp(0.7rem,2vw,1.2rem);
                color:var(--neon-green);text-shadow:0 0 15px var(--neon-green);font-weight:900;">
      PIXEL_PETE STUDIO
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.4rem,1vw,0.7rem);
                color:var(--text-dim);">— warte auf Account-Rückgabe —</div>
  `;
  container.appendChild(stage);

  // ---- PETE's welcome hologram (appears after solve) ----
  const peteHolo = el('div', {
    left: '38%', bottom: '5%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    opacity: '0.4',
    cursor: 'pointer',
    transition: 'opacity 0.4s',
  });
  peteHolo.id = 'pete-holo';
  peteHolo.innerHTML = `
    <div style="width:clamp(22px,4vw,36px);height:clamp(22px,4vw,36px);border-radius:50%;
                border:2px solid var(--neon-green);background:rgba(0,30,10,0.8);
                box-shadow:0 0 12px var(--neon-green);"></div>
    <div style="width:clamp(18px,3vw,28px);height:clamp(22px,3.5vw,36px);
                border:2px solid var(--neon-green);border-top:none;border-radius:0 0 5px 5px;
                background:rgba(0,20,8,0.6);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:8px;height:18px;border:2px solid var(--neon-green);border-top:none;
                  border-radius:0 0 4px 4px;background:rgba(0,20,8,0.5);"></div>
      <div style="width:8px;height:18px;border:2px solid var(--neon-green);border-top:none;
                  border-radius:0 0 4px 4px;background:rgba(0,20,8,0.5);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:var(--neon-green);">
      PIXEL_PETE
    </div>
  `;
  container.appendChild(peteHolo);

  // ---- Terminal for password reset ----
  const terminal = el('div', {
    left: '5%', bottom: '5%', width: '28%', height: '45%',
    background: 'rgba(0,10,5,0.97)',
    border: '2px solid var(--neon-green)',
    borderRadius: '4px',
    boxShadow: '0 0 15px rgba(0,255,136,0.3)',
    padding: '0.6rem',
    cursor: 'pointer',
    overflow: 'hidden',
  });
  terminal.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:0.6rem;color:var(--neon-green);
                padding-bottom:0.3rem;border-bottom:1px solid rgba(0,255,136,0.2);margin-bottom:0.4rem;">
      ACCOUNT-RECOVERY TERMINAL
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.5rem;color:var(--neon-green);line-height:1.8;">
      > User: pixel_pete<br>
      > Status: GESPERRT<br>
      > Neues PW erforderlich<br>
      > Stärke: KRITISCH<br>
      <span style="color:#556677;">[KLICK → DATENSCHUTZ-PRÜFUNG]</span>
    </div>
  `;
  container.appendChild(terminal);

  // ---- BYTE sitting in corner ----
  const byteDefeated = el('div', {
    right: '5%', bottom: '5%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    opacity: '0.7',
    cursor: 'pointer',
  });
  byteDefeated.innerHTML = `
    <div style="width:28px;height:28px;border-radius:50%;border:2px solid var(--neon-pink);
                background:rgba(20,0,8,0.9);box-shadow:0 0 6px rgba(255,45,120,0.3);"></div>
    <div style="width:22px;height:26px;border:2px solid var(--neon-pink);border-top:none;
                border-radius:0 0 5px 5px;background:rgba(15,0,5,0.7);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:7px;height:14px;border:2px solid var(--neon-pink);border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(15,0,5,0.6);"></div>
      <div style="width:7px;height:14px;border:2px solid var(--neon-pink);border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(15,0,5,0.6);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:rgba(255,45,120,0.5);">
      byte ...
    </div>
  `;
  container.appendChild(byteDefeated);

  container.appendChild(makeFigure('kim',    { left: '22%', bottom: '5%' }));
  container.appendChild(makeFigure('justus', { left: '30%', bottom: '5%' }));

  // ---- Hotspots ----
  engine.addHotspot(terminal, 'Account zurücksetzen', () => {
    if (state.isPuzzleSolved('s08_datenschutz')) {
      dialog.show('kim', 'PETEs Account ist zurückgesetzt. Fertig!');
      return;
    }
    engine.openPuzzle(buildDataschutzPuzzle(engine, peteHolo, stage));
  });

  engine.addHotspot(byteDefeated, 'BYTE ansprechen (endlich)', () => {
    if (!state.isPuzzleSolved('s08_datenschutz')) {
      dialog.sequence([
        { char: 'byte', text: 'Ich sage nichts ohne Anwalt.' },
        { char: 'kim', text: 'Du bist 14.' },
        { char: 'byte', text: '...Ohne Elternteil.' },
      ]);
    } else {
      dialog.sequence([
        { char: 'byte', text: 'Also... ich wollte eigentlich nur zeigen, dass ich das kann. Die Bits und Bytes, die Turing-Maschine, die Schichten — ich hab das alles in der Schule gelernt und... niemand hat es bemerkt.' },
        { char: 'kim', text: 'Wir haben es bemerkt.' },
        { char: 'justus', text: 'Alter, du hast die Polizei gehackt. Das ist mega.' },
        { char: 'byte', text: 'Wirklich?' },
        { char: 'aria', text: 'Es ist illegal. Aber technisch eindrucksvoll.' },
        { char: 'byte', text: '...Ich glaube, ich brauche ein Hobby, das weniger Aktion mit der Polizei bedeutet.' },
        { char: 'brandt', text: 'Ich habe zufällig morgen eine AG "Ethical Hacking". 14 Uhr. Raum 104.' },
      ]);
    }
  });

  engine.addHotspot(peteHolo, 'PETE ansprechen', () => {
    if (!state.isPuzzleSolved('s08_datenschutz')) {
      dialog.show('pete', 'Kim... ist das du? Ich bin noch im Limbo-Modus... mein Account... bitte...');
    } else {
      dialog.show('pete', 'ICH BIN ZURÜCK! Danke Kim! Danke Justus! Danke ARIA! Danke Herr Brandt! … Danke sogar BYTE? Irgendwie? Der heutigen Stream widme ich dem Halteproblem.');
    }
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— PETEs Streaming-Studio. Leer, still. Auf dem Hauptbildschirm: "ACCOUNT GESPERRT". —' },
    { char: 'justus', text: 'Wir haben es fast geschafft.' },
    { char: 'kim', text: 'Wir brauchen ein neues, sicheres Passwort für PETEs Account — und wir müssen drei Datenschutz-Fragen korrekt beantworten um die DSGVO-Konformität zu bestätigen.' },
    { char: 'aria', text: 'Das Recovery-Terminal akzeptiert nur Passwörter mit ausreichender Zufälligkeit (Entropie). Ich empfehle mindestens 50 Bit.' },
    { char: 'justus', text: '"pete123" ist sein altes Passwort. Ich hab\'s auf einem Zettel gefunden.' },
    { char: 'kim', text: 'Justus. Wir reden danach über Datenschutz.' },
  ]);
}

function buildDataschutzPuzzle(engine, peteHolo, stage) {
  return (box) => {

    // ---- Part 1: Password entropy ----
    const pwScenarios = [
      {
        q: 'Welches Passwort wäre für PETEs Account am sichersten?',
        opts: [
          { label: 'pete123', wrong: 'Zu kurz, zu vorhersehbar. Rate auf Rate 1.' },
          { label: 'PassWort!', wrong: 'Besser, aber Wörterbuchangriff möglich.' },
          { label: 'K7#mP!v2qX&3', correct: true, msg: 'Zufällig, lang, Sonderzeichen — hohe Zufälligkeit (Entropie) — schwer zu knacken!' },
          { label: 'PixelPete2026', wrong: 'Bezug zur Person = vorhersehbar für Angreifer.' },
        ]
      },
      {
        q: 'BYTE hat PETEs Account-Daten veröffentlicht. Was kann PETE tun?',
        opts: [
          { label: 'Nichts — Daten im Internet sind für immer da.', wrong: 'Er kann nach DSGVO Art. 17 "Recht auf Vergessen" beantragen und Strafanzeige erstatten.' },
          { label: 'DSGVO-Beschwerde einreichen + Anzeige erstatten.', correct: true, msg: 'Korrekt! Das Recht auf Löschung (Art. 17 DSGVO) und Strafverfolgung sind die richtigen Schritte.' },
          { label: 'Passwort ändern und fertig.', wrong: 'PW-Änderung schützt den Account — aber die veröffentlichten Daten bleiben. DSGVO und Anzeige sind nötig.' },
        ]
      },
      {
        q: 'Welche Info sollte PETE NIEMALS online teilen?',
        opts: [
          { label: 'Seinen Streaming-Namen.', wrong: 'Öffentlicher Name ist i.d.R. unproblematisch.' },
          { label: 'Seinen vollständigen Namen, Adresse UND Geburtsdatum zusammen.', correct: true, msg: 'Die Kombination ermöglicht Identitätsdiebstahl. Jede Info allein ist weniger kritisch.' },
          { label: 'Sein liebstes Spiel.', wrong: 'Spielpräferenzen sind i.d.R. harmlose öffentliche Info.' },
        ]
      },
    ];

    let step = 0, score = 0;

    const render = () => {
      if (step >= pwScenarios.length) {
        if (score >= 2) {
          box.querySelector('#ds-q').innerHTML = `
            <div class="puzzle-feedback ok" style="font-size:0.95rem;">
              ✓ ${score}/3 korrekt! Datenschutz-Prüfung bestanden.<br><br>
              PETEs Account wird zurückgesetzt. Ein starkes Passwort wurde generiert.
              BYTE wird zur Rechenschaft gezogen — und hat morgen offenbar Interesse an einer Ethical-Hacking-AG.
            </div>
          `;
          state.solvedPuzzle('s08_datenschutz');

          // Unlock PETE
          setTimeout(() => {
            peteHolo.style.opacity = '1';
            peteHolo.style.boxShadow = '0 0 20px var(--neon-green)';
            stage.querySelector('#pete-screen').style.color = 'var(--neon-green)';
            stage.querySelector('#pete-screen').textContent = '🟢 PIXEL_PETE — LIVE';
          }, 500);

          setTimeout(() => {
            engine.closePuzzle();
            engine.notify('🎉 PIXEL_PETE IST ZURÜCK!', 5000);
            dialog.sequence([
              { char: 'system', text: '— PIXEL_PETE ist online. 2.4M Zuschauer. Er tippt gerade seinen Titel: "Ich wurde gehackt — und eine 14-jährige hat mich gerettet." —' },
              { char: 'pete', text: 'KIM! Du hast es geschafft! Ich bin zurück!' },
              { char: 'kim', text: 'Ändere dein Passwort. Sofort. Kein "pete123" mehr.' },
              { char: 'pete', text: 'Wie wäre "K7#mP!v2qX&3"? Das hab ich mir irgendwo aufgeschrieben.' },
              { char: 'justus', text: '...auf einem Zettel?' },
              { char: 'pete', text: 'An meinem Monitor.' },
              { char: 'aria', text: 'Das ist ein kritischer Datenschutzverstoß. Aber statistisch normal.' },
              { char: 'byte', text: 'Äh... also... tut mir leid. Wirklich. Können wir... Freunde sein? Ich bring Chips. Immer.' },
              { char: 'kim', text: 'Wir reden. Aber du begleitest uns morgen zur Datenschutzbeauftragten.' },
              { char: 'byte', text: 'Deal.' },
              { char: 'system', text: '— ENDE — Alle Themen gelernt: Bits & Bytes, Turing, Abstraktionsschichten, Pixel, Halteproblem, KI & Bias, Kryptographie, Datenschutz. —' },
              { char: 'system', text: 'Herzlichen Glückwunsch! Du hast CYBER::ADVENTURES abgeschlossen. 🎉', after: () => showCredits(engine) },
            ]);
          }, 1800);
        } else {
          box.querySelector('#ds-q').innerHTML = `
            <div class="puzzle-feedback err">
              ${score}/3 korrekt. Nochmal!
              <button class="puzzle-btn" id="ds-retry" style="margin-top:0.5rem;">↺ WIEDERHOLEN</button>
            </div>
          `;
          box.querySelector('#ds-retry').onclick = () => { step = 0; score = 0; render(); };
        }
        return;
      }

      const q = pwScenarios[step];
      box.querySelector('#ds-q').innerHTML = `
        <p style="margin-bottom:0.8rem;">${step+1}. ${q.q}</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${q.opts.map((o,i) => `
            <button class="scenario-option-btn" data-i="${i}">
              ${String.fromCharCode(65+i)}) ${o.label}
            </button>
          `).join('')}
        </div>
        <div id="ds-opt-fb" class="puzzle-feedback" style="margin-top:0.4rem;"></div>
      `;

      box.querySelectorAll('.scenario-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const opt = q.opts[+btn.dataset.i];
          box.querySelectorAll('.scenario-option-btn').forEach(b => b.disabled = true);
          const fb = box.querySelector('#ds-opt-fb');
          if (opt.correct) {
            btn.classList.add('correct');
            fb.className = 'puzzle-feedback ok';
            fb.textContent = '✓ ' + opt.msg;
            score++;
          } else {
            btn.classList.add('wrong');
            fb.className = 'puzzle-feedback err';
            fb.textContent = '✗ ' + opt.wrong;
          }
          setTimeout(() => { step++; render(); }, 1700);
        });
      });
    };

    box.innerHTML = `
      <h2>🔑 FINALES PROTOKOLL — DATENSCHUTZ & PASSWORT</h2>
      <p>Bevor PETEs Account zurückgesetzt werden kann, müssen drei Datenschutz-Fragen
         korrekt beantwortet werden. Das System ist sehr streng.</p>
      <div class="hint">
        💡 DSGVO = Datenschutz-Grundverordnung der EU.<br>
        Passwort-Entropie = Maß für die Zufälligkeit eines Passworts (in Bit).<br>
        Je mehr zufällige Zeichen, desto länger zum Knacken → desto sicherer.
      </div>
      <div id="ds-q" style="margin-top:0.8rem;"></div>
    `;

    render();
  };
}

function showCredits(engine) {
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.add('active');
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '2rem';
  overlay.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:clamp(1.5rem,5vw,2.5rem);font-weight:900;
                color:var(--neon-blue);text-shadow:0 0 20px var(--neon-blue);margin-bottom:1rem;
                letter-spacing:0.1em;text-align:center;">
      CYBER<span style="color:var(--neon-pink)">::</span>ADVENTURES
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:1rem;color:var(--neon-green);
                text-shadow:0 0 10px var(--neon-green);margin-bottom:2rem;letter-spacing:0.15em;">
      — ABGESCHLOSSEN —
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.85rem;color:var(--text);
                max-width:500px;line-height:2;text-align:center;">
      <div style="color:var(--neon-blue);margin-bottom:0.5rem;">Gelernte Themen:</div>
      ✓ Bits & Bytes / ASCII &nbsp; ✓ Turing-Maschinen<br>
      ✓ Abstraktionsschichten &nbsp; ✓ Pixel & Bitmaps<br>
      ✓ Halteproblem &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✓ KI & Bias<br>
      ✓ Caesar / ROT13 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ✓ Datenschutz / DSGVO
    </div>
    <div style="margin-top:2rem;font-family:'Share Tech Mono',monospace;font-size:0.8rem;
                color:var(--text-dim);text-align:center;line-height:1.8;">
      Informatik Klasse 8 · CYBER::KLASSE<br>
      Weiter zur Lernwebsite → <a href="../index.html"
        style="color:var(--neon-blue);text-decoration:none;">index.html</a> |
      3D-Turm → <a href="../cyber-3d/index.html"
        style="color:var(--neon-green);text-decoration:none;">CYBER::TOWER</a>
    </div>
    <button onclick="location.reload()" style="
      margin-top:2rem;font-family:'Orbitron',sans-serif;font-size:0.9rem;
      padding:0.8rem 2rem;background:rgba(0,212,255,0.1);
      border:2px solid var(--neon-blue);color:var(--neon-blue);cursor:pointer;
      letter-spacing:0.1em;">
      ↺ NOCHMAL SPIELEN
    </button>
  `;
}
