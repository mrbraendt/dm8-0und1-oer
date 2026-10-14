// ============================================================
// S05 — POLIZEISTATION (Halteproblem / PARASIT.EXE)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor } from '../helpers.js';

export function build(container, engine) {
  container.className = 'bg-polizei';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Police reception desk ----
  const desk = el('div', {
    left: '25%', bottom: '0', width: '50%', height: '22%',
    background: '#0e0e1c',
    borderTop: '2px solid #334',
    borderRadius: '4px 4px 0 0',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  });
  desk.innerHTML = `<div style="font-family:'Orbitron',sans-serif;font-size:0.7rem;
    color:rgba(0,212,255,0.4);letter-spacing:0.2em;">POLIZEI E17</div>`;
  container.appendChild(desk);

  // ---- Glitching BIG screen on wall ----
  const bigScreen = el('div', {
    left: '20%', top: '5%', width: '58%', height: '45%',
    background: '#030310',
    border: '3px solid var(--neon-pink)',
    borderRadius: '4px',
    boxShadow: '0 0 25px rgba(255,45,120,0.5), inset 0 0 40px rgba(40,0,20,0.6)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
    background: state.isPuzzleSolved('s05_halt') ? '#000' : '#030310',
    borderColor: state.isPuzzleSolved('s05_halt') ? '#112' : 'var(--neon-pink)',
    boxShadow: state.isPuzzleSolved('s05_halt') ? 'none' : '0 0 25px rgba(255,45,120,0.5), inset 0 0 40px rgba(40,0,20,0.6)',
  });
  if (!state.isPuzzleSolved('s05_halt')) {
    bigScreen.innerHTML = `
      <div style="font-family:'Orbitron',sans-serif;font-size:clamp(0.7rem,2vw,1.1rem);
                  color:var(--neon-pink);text-shadow:0 0 15px var(--neon-pink);
                  font-weight:900;margin-bottom:0.5rem;animation:flicker 2s infinite;">
        ⚠ PARASIT.EXE — INFINITE LOOP ⚠
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.4rem,0.9vw,0.65rem);
                  color:#ff2d78;text-align:center;line-height:1.8;">
        Dieses Programm hält an, wenn es nicht anhält.<br>
        Und es hält nicht an, wenn es anhält.<br>
        <span style="color:#556677;font-size:0.85em;">Systemressourcen: 100.0%</span>
      </div>
      <div style="margin-top:0.8rem;font-family:'Share Tech Mono',monospace;
                  font-size:0.55rem;color:var(--text-dim);">[KLICK → ANALYSIEREN]</div>
    `;
  }
  container.appendChild(bigScreen);

  // ---- ON/OFF Switch below screen ----
  const pwrSwitch = el('div', {
    left: '46%', top: '52%', width: '6%', height: '5%',
    background: '#1a1a2e',
    border: '2px solid #334',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  });
  const isOff = state.isPuzzleSolved('s05_halt');
  pwrSwitch.innerHTML = `<div id="pwr-toggle" style="width:12px;height:12px;background:${isOff ? '#111' : '#ff2d78'};border-radius:2px;box-shadow:${isOff ? 'none' : '0 0 8px #ff2d78'};"></div>`;
  container.appendChild(pwrSwitch);

  const pwrLabel = el('div', {
    left: '46%', top: '57.5%', width: '6%', textAlign: 'center',
    fontFamily: "'Share Tech Mono', monospace", fontSize: '0.5rem', color: 'var(--text-dim)',
  });
  pwrLabel.textContent = 'POWER';
  container.appendChild(pwrLabel);

  // ---- Police officer figure ----
  const cop = el('div', {
    right: '15%', bottom: '22%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    cursor: 'pointer',
  });
  // Just a CSS figure in police-blue
  cop.innerHTML = `
    <div style="width:28px;height:28px;border-radius:50%;border:2px solid #4488ff;
                background:rgba(10,15,40,0.9);box-shadow:0 0 8px rgba(68,136,255,0.4);"></div>
    <div style="width:22px;height:28px;border:2px solid #4488ff;border-top:none;
                border-radius:0 0 5px 5px;background:rgba(10,20,50,0.6);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:7px;height:15px;border:2px solid #4488ff;border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(10,20,50,0.5);"></div>
      <div style="width:7px;height:15px;border:2px solid #4488ff;border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(10,20,50,0.5);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:#4488ff;
                letter-spacing:0.1em;">HAUPTMANN GROSS</div>
  `;
  container.appendChild(cop);

  container.appendChild(makeFigure('kim',  { left: '8%',  bottom: '22%' }));
  const justus = makeFigure('justus', { left: '18%', bottom: '22%' });
  container.appendChild(justus);

  // ---- BYTE note stuck on screen ----
  const byteNote = el('div', {
    right: '5%', top: '20%', width: '14%',
    background: 'rgba(40,0,10,0.95)',
    border: '1px solid var(--neon-pink)',
    padding: '0.5rem',
    borderRadius: '2px',
    boxShadow: '0 0 8px rgba(255,45,120,0.3)',
    cursor: 'pointer',
    transform: 'rotate(3deg)',
  });
  byteNote.innerHTML = `<div style="font-family:'Share Tech Mono',monospace;font-size:0.5rem;
    color:var(--neon-pink);line-height:1.6;">
    Haha!<br>Kannst du mich<br>stoppen?<br>
    (Spoiler: NEIN)<br>MUAHAHA<br>
    <span style="color:#556677;">— BYTE</span>
  </div>`;
  container.appendChild(byteNote);

  // ---- Hotspots ----
  engine.addHotspot(bigScreen, 'PARASIT.EXE analysieren', () => {
    if (state.isPuzzleSolved('s05_halt')) {
      dialog.show('kim', 'Der Bildschirm ist schwarz. Justus hat das Halteproblem auf die harte Tour gelöst: Stecker raus.');
      return;
    }
    engine.openPuzzle(buildHaltingPuzzle(engine));
  });

  engine.addHotspot(pwrSwitch, 'Power-Knopf drücken', () => {
    const toggle = document.getElementById('pwr-toggle');
    if (state.isPuzzleSolved('s05_halt')) {
      dialog.show('justus', 'Lass es aus, Kim. Sonst fängt der Loop wieder von vorne an.');
      return;
    }

    dialog.sequence([
      { char: 'justus', text: 'Soll ich einfach mal...?' },
      { char: 'kim', text: 'Warte, Justus! Wenn man ein unendliches Programm einfach abschaltet, dann...' },
      { char: 'system', text: '*KLICK*' },
      { char: 'gross', text: '"Hey! Der Bildschirm ist schwarz! Es hat aufgehört zu blinken!"' },
      { char: 'kim', text: 'Tatsächlich. Justus, du hast das Halteproblem gerade "gelöst". Nicht mathematisch, aber physikalisch.' },
      { char: 'justus', text: 'Gerne geschehen.', after: () => {
        // Solve puzzle
        state.solvedPuzzle('s05_halt');
        bigScreen.style.background = '#000';
        bigScreen.style.boxShadow = 'none';
        bigScreen.style.borderColor = '#112';
        bigScreen.innerHTML = '';
        const toggle = document.getElementById('pwr-toggle');
        if (toggle) {
          toggle.style.background = '#111';
          toggle.style.boxShadow = 'none';
        }

        engine.notify('📦 ITEM: Deepfake-Screenshot');
        inventory.addItem('deepfake_screenshoot');
        engine.notify('✓ Paradoxon gelöst (durch Abschalten)');

        // Wait a bit then go to next scene
        setTimeout(() => {
          engine.loadScene('s06_ki');
        }, 2000);
      } },
    ]);
  });

  engine.addHotspot(cop, 'Hauptmann Gross ansprechen', () => {
    dialog.sequence([
      { char: 'gross', text: '"Kinder, ihr dürft hier nicht rein. Das ist eine polizeiliche Einrichtung."' },
      { char: 'kim', text: 'Wir können den Virus stoppen. Wir brauchen nur kurz Zugang.' },
      { char: 'gross', text: '"Könnt ihr das auch? Der IT-Typ von vorhin hat einfach immer wieder auf Ausschalten geklickt."' },
      { char: 'justus', text: 'Hat es geholfen?' },
      { char: 'gross', text: '"Sieht so aus."' },
    ]);
  });

  engine.addHotspot(byteNote, 'BYTEs Notiz lesen', () => {
    dialog.show('byte', 'Habe ich erwähnt, dass PARASIT.EXE nicht stoppbar ist? Weil: Halteproblem. Turing hat bewiesen: Es gibt kein Programm, das für jedes andere Programm entscheiden kann, ob es hält oder ewig läuft. Deal with it. — BYTE, der Unaufhaltbare');
  });

  engine.addHotspot(justus, 'Mit Justus reden', () => {
    if (state.isPuzzleSolved('s05_halt')) {
      dialog.show('justus', 'Manchmal ist die einfachste Lösung die beste. Stecker ziehen rules.');
    } else {
      dialog.show('justus', 'Kim, hast du mal versucht, den Power-Knopf da unter dem Schirm zu drücken? Mein Vater sagt immer: Reboot tut gut.');
    }
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— Polizeistation E17. Sämtliche Bildschirme zeigen "PARASIT.EXE". —' },
    { char: 'justus', text: 'Die POLIZEI wurde gehackt! Das ist wie in einem Film!' },
    { char: 'kim', text: 'Ja, einem un-lustigen Film.' },
    { char: 'gross', text: '"Das Ding läuft seit 6 Stunden in einer Endlosschleife. Meine ganze Nacht-Schicht."' },
    { char: 'kim', text: 'Ich kenne das. Das ist BYTEs Handschrift — ein Endlosschleifen-Virus mit eingebautem Widerspruch.' },
  ]);
}

// ---- Halting Problem Quiz ----
function buildHaltingPuzzle(engine) {
  const questions = [
    {
      q: 'Was tut PARASIT.EXE laut BYTEs Beschreibung?',
      opts: [
        { label: 'Es löscht alle Dateien.', wrong: 'Das wäre einfach zu stoppen — Backup einspielen.' },
        { label: 'Es hält an, wenn es nicht anhält — und hält nicht an, wenn es anhält.', correct: true, msg: 'Genau! Das ist ein Widerspruch (Paradoxon) — er macht das Programm unlösbar.' },
        { label: 'Es verschlüsselt Daten per ROT13.', wrong: 'ROT13 ist Verschlüsselung. Das hier ist ein Laufzeit-Problem.' },
      ]
    },
    {
      q: 'Warum kann kein Computer-Programm für jedes beliebige andere Programm entscheiden, ob es hält oder ewig läuft?',
      opts: [
        { label: 'Weil Computer zu langsam sind.', wrong: 'Nein — es ist kein Geschwindigkeitsproblem.' },
        { label: 'Weil es prinzipiell kein Programm geben kann, das das allgemein für jedes beliebige andere Programm löst (Turing 1936).', correct: true, msg: 'Korrekt! Das ist das Halteproblem — ein fundamentaler Beweis der Informatik.' },
        { label: 'Weil der Arbeitsspeicher nie ausreicht.', wrong: 'Auch unbegrenzt RAM würde nichts ändern.' },
      ]
    },
    {
      q: 'Was folgt daraus für PARASIT.EXE?',
      opts: [
        { label: 'Man kann den Stecker ziehen.', wrong: 'Das ist pragmatisch richtig — aber informatisch kein Beweis, dass das Programm "hält".', bonus: 'Hauptmeister Groß ist übrigens schon einen Schritt voraus.' },
        { label: 'Man kann nicht beweisen, dass es aufhört — kein Computer der Welt kann das allgemein entscheiden (das nennt man: unentscheidbar).', correct: true, msg: 'Richtig! BYTE nutzt das Halteproblem als Schloss.' },
        { label: 'Man kann einfach auf Abbrechen drücken.', wrong: 'Technisch yes — theoretisch ist das keine allgemeine Lösung für das Halteproblem.' },
      ]
    },
  ];

  return (box) => {
    let step = 0;
    let score = 0;

    const render = () => {
      if (step >= questions.length) {
        // Done
        if (score >= 2) {
          box.querySelector('#halt-q').innerHTML = `
            <div class="puzzle-feedback ok" style="font-size:1rem;">
              ✓ Verstanden! ${score}/3 Fragen korrekt.<br>
              Das Halteproblem ist unlösbar — kein Programm der Welt kann für jedes andere Programm allgemein entscheiden, ob es anhält.
              BYTE hat das als Machtdemonstration genutzt, aber damit auch bewiesen: Er kennt seine Grenzen nicht.
            </div>
          `;
          state.solvedPuzzle('s05_halt');
          setTimeout(() => {
            engine.closePuzzle();
            engine.notify('📦 ITEM: Deepfake-Screenshot');
            inventory.addItem('deepfake_screenshoot');
            dialog.sequence([
              { char: 'kim', text: 'Das Halteproblem. BYTE hat es genutzt um zu zeigen: "Ihr könnt mich nicht logisch stoppen." Aber er hat trotzdem Spuren hinterlassen.' },
              { char: 'justus', text: 'Ich hab inzwischen den Stecker gezogen.' },
              { char: 'kim', text: 'Justus. Du hast den Virus gestoppt.' },
              { char: 'justus', text: 'War das informatisch relevant?' },
              { char: 'kim', text: 'Überhaupt nicht. Aber effektiv. Weiter — BYTE hat ein KI-Labor in der Nähe erwähnt.', after: () => engine.loadScene('s06_ki') },
            ]);
          }, 2000);
        } else {
          box.querySelector('#halt-q').innerHTML = `
            <div class="puzzle-feedback err">
              Hmm — ${score}/3 Fragen korrekt. Lies die Erklärungen nochmal und versuche es erneut.
              <button class="puzzle-btn" id="halt-retry" style="margin-top:0.5rem;">↺ NOCHMAL</button>
            </div>
          `;
          box.querySelector('#halt-retry').onclick = () => { step = 0; score = 0; render(); };
        }
        return;
      }

      const q = questions[step];
      box.querySelector('#halt-q').innerHTML = `
        <p style="margin-bottom:0.8rem;font-size:0.95rem;">${step + 1}. ${q.q}</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${q.opts.map((o, i) => `
            <button class="scenario-option-btn" data-i="${i}">
              ${String.fromCharCode(65+i)}) ${o.label}
            </button>
          `).join('')}
        </div>
        <div id="halt-opt-fb" class="puzzle-feedback" style="margin-top:0.5rem;"></div>
      `;

      box.querySelectorAll('.scenario-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.i;
          const opt = q.opts[i];
          const fbEl = box.querySelector('#halt-opt-fb');
          box.querySelectorAll('.scenario-option-btn').forEach(b => b.disabled = true);
          if (opt.correct) {
            btn.classList.add('correct');
            fbEl.className = 'puzzle-feedback ok';
            fbEl.textContent = '✓ ' + opt.msg;
            score++;
          } else {
            btn.classList.add('wrong');
            fbEl.className = 'puzzle-feedback err';
            fbEl.textContent = '✗ ' + (opt.wrong || 'Nicht ganz.');
            if (opt.bonus) fbEl.textContent += ' ' + opt.bonus;
          }
          setTimeout(() => { step++; render(); }, 1600);
        });
      });
    };

    box.innerHTML = `
      <h2>💀 PARASIT.EXE — DAS HALTEPROBLEM</h2>
      <p>Um den Virus zu verstehen (und BYTE zu überführen), musst du das
         Halteproblem begreifen. 3 Fragen.</p>
      <div class="hint">
        💡 <strong>Das Halteproblem:</strong> Alan Turing bewies 1936, dass es keinen allgemeinen
        Algorithmus geben kann, der für <em>jedes</em> beliebige Programm entscheidet,
        ob es jemals anhält.<br><br>
        <strong>Der Trick:</strong> Ein Programm, das einen Widerspruch (Paradoxon) enthält — wie "Ich halte an, wenn ich nicht anhalte" — kann logisch niemals von einem anderen Programm bewiesen werden. Es ist "unentscheidbar".
      </div>
      <div id="halt-q" style="margin-top:0.8rem;"></div>
    `;

    render();
  };
}
