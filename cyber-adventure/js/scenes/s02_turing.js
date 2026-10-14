// ============================================================
// S02 — SCHUL-INFORMATIKRAUM (Turing-Maschine)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor } from '../helpers.js';

export function build(container, engine) {
  container.className = 'bg-school-room';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Rows of school computers (background) ----
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 5; col++) {
      const desk = el('div', {
        left: (8 + col * 18) + '%',
        bottom: (25 + row * 25) + '%',
        width: '14%', height: '8%',
        background: '#14141e',
        borderTop: '1px solid #334',
      });
      const mon = el('div', {
        left: (10 + col * 18) + '%',
        bottom: (33 + row * 25) + '%',
        width: '10%', height: '14%',
        background: '#060610',
        border: '1px solid rgba(0,212,255,0.25)',
        borderRadius: '2px',
      });
      mon.innerHTML = `<div style="font-size:0.3rem;color:rgba(0,212,255,0.4);
        font-family:'Share Tech Mono',monospace;padding:2px;text-align:center;">
        ${col === 2 && row === 0 ? '<span style="color:#ff2d78;font-size:0.5rem;">BYTE</span>' : '>_'}
      </div>`;
      container.appendChild(desk);
      container.appendChild(mon);
    }
  }

  // ---- Whiteboard ----
  const board = el('div', {
    left: '20%', top: '5%', width: '55%', height: '30%',
    background: '#0f0f1a',
    border: '2px solid #445',
    borderRadius: '3px',
  });
  board.innerHTML = `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;
                align-items:center;justify-content:center;gap:0.4rem;padding:0.5rem;">
      <div style="font-family:'Orbitron',sans-serif;font-size:clamp(0.5rem,1.5vw,0.9rem);
                  color:var(--neon-purple);text-shadow:0 0 8px var(--neon-purple);">
        TURING-MASCHINE
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.35rem,0.8vw,0.55rem);
                  color:var(--text-dim);line-height:1.6;text-align:center;">
        Zustand × Eingabe → Ausgabe, Bewegung, neuer Zustand<br>
        Das einfachste denkbare "Programm" — und trotzdem: alles berechenbar.
      </div>
    </div>
  `;
  container.appendChild(board);

  // ---- BYTE's hacked terminal (puzzle trigger) ----
  const hackTerminal = el('div', {
    left: '60%', bottom: '15%', width: '25%', height: '40%',
    background: '#020a0a',
    border: '2px solid var(--neon-pink)',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(255,45,120,0.4)',
    cursor: 'pointer',
    overflow: 'hidden',
  });
  hackTerminal.innerHTML = `
    <div style="background:rgba(40,0,10,0.8);padding:4px 8px;border-bottom:1px solid rgba(255,45,120,0.3);
                font-family:'Orbitron',sans-serif;font-size:0.6rem;color:var(--neon-pink);">
      BYTE_VM.exe — SPERRPROTOKOLL
    </div>
    <div style="padding:0.5rem;font-family:'Share Tech Mono',monospace;
                font-size:clamp(0.35rem,0.8vw,0.55rem);color:var(--neon-pink);line-height:1.8;">
      > TM-Regeln gesperrt.<br>
      > Konfiguriere die Maschine<br>
      > korrekt, um Clue_02 zu<br>
      > entschlüsseln.<br>
      > Ich erwarte dich, Kim.<br>
      > — BYTE, der Unbesiegbare
    </div>
  `;
  container.appendChild(hackTerminal);

  // ---- HR. BRANDT figure (appears suddenly) ----
  const brandt = makeFigure('brandt', { left: '2%', bottom: '4%', label: 'HR. BRANDT' });
  container.appendChild(brandt);

  // ---- KIM + JUSTUS ----
  container.appendChild(makeFigure('kim',    { left: '40%', bottom: '4%' }));
  container.appendChild(makeFigure('justus', { left: '52%', bottom: '4%' }, true));

  // ---- Hotspots ----
  engine.addHotspot(hackTerminal, 'BYTE-Terminal hacken', () => {
    if (state.isPuzzleSolved('s02_turing')) {
      dialog.show('kim', 'Diese Turing-Maschine läuft jetzt korrekt. BYTE hat das Schicht-Diagramm im Serverraum versteckt.');
      return;
    }
    engine.openPuzzle(buildTuringPuzzle(engine));
  });

  engine.addHotspot(brandt, 'Herr Brandt ansprechen', () => {
    dialog.sequence([
      { char: 'brandt', text: 'Kim! Justus! Was macht ihr hier nach der Schule? Pixel_Pete vermisst? Das erkläre ich euch natürlich sofort! Also, eine Turing-Maschine, das ist...' },
      { char: 'justus', text: 'Herr Brandt — wir wissen schon was eine Turing-Maschine ist.' },
      { char: 'brandt', text: 'Wunderbar! Also. Eine Turing-Maschine hat ein Band aus Symbolen. Einen Schreib-Lese-Kopf. Und Regeln der Form: "Lese X → Schreibe Y → Bewege dich → Neuer Zustand." Klar?' },
      { char: 'kim', text: '...Ja, klar.' },
      { char: 'brandt', text: 'Ich erkläre es nochmal mit Folie.' },
    ]);
  });

  engine.addHotspot(board, 'Whiteboard lesen', () => {
    dialog.show('brandt', 'Die wichtigste Erkenntnis von Alan Turing: Jeder Algorithmus — egal wie komplex — lässt sich als Turing-Maschine beschreiben. Das bedeutet: Was ein Computer tun kann, kann JEDER Computer tun. Alles eine Frage der Regeln.');
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— Schulgebäude. Informatikraum. Die Deckenlichter flackern. —' },
    { char: 'justus', text: 'Die Schule — nach 22 Uhr. Das ist schon irgendwie creepy.' },
    { char: 'brandt', text: 'KIM! JUSTUS! Ich habe noch gesessen und Aufgabenblätter für morgen kopiert — was macht ihr hier?' },
    { char: 'kim', text: 'Herr Brandt! BYTE hat PETEs Account gehackt und einen Hinweis hier hinterlassen — an einem der Terminals.' },
    { char: 'brandt', text: 'BYTE? Das klingt nach einem Informatik-Affinen. Interessant. Das erkläre ich euch natürlich!' },
    { char: 'justus', text: '...Nicht schon wieder die Folie.' },
  ]);
}

// ---- Turing Machine Puzzle ----
// Goal: configure a "bit-inverter" TM: 0→1→R, 1→0→R, _→_→H
function buildTuringPuzzle(engine) {
  return (box) => {
    const INIT_TAPE = ['1','0','1','1','0'];

    let tape, head, halted, stepLog;
    let running = false;

    const reset = () => {
      tape    = [...INIT_TAPE, '_', '_', '_'];
      head    = 0;
      halted  = false;
      stepLog = [];
    };
    reset();

    const readRules = () => [
      { read: '0', write: box.querySelector('#rw0').value, move: box.querySelector('#rm0').value },
      { read: '1', write: box.querySelector('#rw1').value, move: box.querySelector('#rm1').value },
      { read: '_', write: '_', move: 'H' },
    ];

    const renderTape = () => {
      const tapeEl = box.querySelector('#tm-tape');
      if (!tapeEl) return;
      tapeEl.innerHTML = '';
      // Show all cells from 0 to the furthest written, always keeping 2 blank cells visible at the end
      const lastNonBlank = tape.reduce((acc, v, i) => (v !== '_' ? i : acc), -1);
      const endIdx = Math.min(tape.length - 1, Math.max(lastNonBlank + 2, head + 1));
      for (let i = 0; i <= endIdx; i++) {
        const cell = document.createElement('div');
        cell.className = 'turing-cell' + (i === head ? ' head' : '');
        cell.textContent = tape[i] !== undefined ? tape[i] : '_';
        tapeEl.appendChild(cell);
      }
      // Scroll the head into view smoothly
      const headEl = tapeEl.querySelector('.head');
      if (headEl) headEl.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    };

    const renderLog = () => {
      const logEl = box.querySelector('#tm-log');
      if (!logEl) return;
      if (stepLog.length === 0) {
        logEl.innerHTML = '<span style="color:var(--text-dim);font-size:0.75rem;">— noch keine Schritte —</span>';
        return;
      }
      const last4 = stepLog.slice(-4);
      logEl.innerHTML = last4.map((entry, i) => `
        <div style="opacity:${0.35 + ((i+1)/last4.length)*0.65};font-size:0.75rem;
                    color:${entry.type==='halt'?'var(--neon-green)':'var(--text-dim)'};">
          ${entry.text}
        </div>
      `).join('');
    };

    const doStep = () => {
      if (halted) return false;
      const rules = readRules();
      const sym   = tape[head] !== undefined ? tape[head] : '_';
      const rule  = rules.find(r => r.read === sym);
      if (!rule) {
        halted = true;
        stepLog.push({ text: `⚠ Kein Regel für "${sym}" — Maschine stoppt.`, type: 'halt' });
        renderTape(); renderLog(); return false;
      }
      const oldSym = sym;
      tape[head] = rule.write;
      if (rule.move === 'H') {
        halted = true;
        stepLog.push({ text: `Lese "${oldSym}" → schreibe "${rule.write}" → HALT ✓`, type: 'halt' });
        renderTape(); renderLog(); return false;
      }
      head += rule.move === 'R' ? 1 : -1;
      if (head < 0) head = 0;
      if (head >= tape.length) tape.push('_');
      stepLog.push({
        text: `Lese "${oldSym}" → schreibe "${rule.write}" → Kopf geht ${rule.move==='R'?'rechts ▶':'links ◀'}`,
        type: 'step',
      });
      renderTape(); renderLog(); return true;
    };

    const checkResult = () => {
      const result = tape.slice(0, 5).join('');
      const fb = box.querySelector('#tm-fb');
      if (!fb) return;
      if (result === '01001') {
        fb.className = 'puzzle-feedback ok';
        fb.textContent = '✓ Perfekt! Band 10110 ist korrekt umgekehrt zu 01001. Das Schloss ist offen.';
        state.solvedPuzzle('s02_turing');
        setTimeout(() => {
          engine.closePuzzle();
          engine.notify('📦 ITEM: Schicht-Diagramm');
          inventory.addItem('schicht_diagram');
          dialog.sequence([
            { char: 'kim',    text: 'Die Turing-Maschine hat einen versteckten Hinweis ausgespuckt: Serverraum, Erdgeschoss.' },
            { char: 'brandt', text: 'Wunderbar! Das ist genau das Prinzip — jedes Rechenproblem lässt sich in solche einfachen Regeln zerlegen—' },
            { char: 'justus', text: 'Herr Brandt, wir müssen jetzt wirklich los.' },
            { char: 'brandt', text: 'Natürlich! Ich erkläre auf dem Weg! Alan Turing hat 1936…', after: () => engine.loadScene('s03_server') },
          ]);
        }, 1800);
      } else {
        fb.className = 'puzzle-feedback err';
        fb.textContent = `✗ Band-Ergebnis: "${result}" — korrekt wäre "01001". Sind beide Schreib-Regeln richtig eingestellt?`;
      }
    };

    box.innerHTML = `
      <h2>⚙ TURING-MASCHINE — BYTES SPERRPROTOKOLL</h2>
      <p>Eine Turing-Maschine liest das Band Feld für Feld — der <span style="color:var(--neon-green)">grüne Kasten</span>
         ist der Lese-Kopf. Er folgt Regeln: <em>„Wenn ich X lese → schreibe Y → gehe weiter."</em><br>
         Programmiere die Maschine so, dass sie alle Bits <strong style="color:var(--neon-blue)">umdreht</strong>:
         jede <strong>1 → wird zur 0</strong>, jede <strong>0 → wird zur 1</strong>.</p>

      <div style="margin:0.8rem 0;">
        <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:4px;">
          Band (grüner Kasten = aktuell gelesenes Feld):
        </div>
        <div id="tm-tape" class="turing-tape-display"></div>
        <div style="font-size:0.7rem;margin-top:4px;font-family:var(--font-mono);">
          Start: <strong style="color:var(--neon-blue);">1 0 1 1 0</strong>
          &nbsp;&nbsp;→&nbsp;&nbsp;
          Ziel: <strong style="color:var(--neon-green);">0 1 0 0 1</strong>
        </div>
      </div>

      <div style="margin:0.8rem 0;">
        <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:0.5rem;">
          Regeln einstellen — was soll die Maschine tun?
        </div>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">

          <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;
                      background:rgba(0,20,40,0.7);border:1px solid rgba(0,212,255,0.25);
                      border-radius:4px;flex-wrap:wrap;">
            <span style="font-family:var(--font-mono);font-size:0.9rem;min-width:10ch;">
              Lese <strong style="color:var(--neon-blue);">0</strong> →
            </span>
            <label style="font-size:0.78rem;color:var(--text-dim);">Schreibe:</label>
            <select id="rw0" class="puzzle-input" style="width:55px;display:inline;">
              <option value="0" selected>0</option>
              <option value="1">1</option>
            </select>
            <label style="font-size:0.78rem;color:var(--text-dim);">  Dann gehe:</label>
            <select id="rm0" class="puzzle-input" style="width:80px;display:inline;">
              <option value="R" selected>Rechts</option>
              <option value="L">Links</option>
              <option value="H">Halt</option>
            </select>
          </div>

          <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;
                      background:rgba(0,20,40,0.7);border:1px solid rgba(0,212,255,0.25);
                      border-radius:4px;flex-wrap:wrap;">
            <span style="font-family:var(--font-mono);font-size:0.9rem;min-width:10ch;">
              Lese <strong style="color:var(--neon-blue);">1</strong> →
            </span>
            <label style="font-size:0.78rem;color:var(--text-dim);">Schreibe:</label>
            <select id="rw1" class="puzzle-input" style="width:55px;display:inline;">
              <option value="0">0</option>
              <option value="1" selected>1</option>
            </select>
            <label style="font-size:0.78rem;color:var(--text-dim);">  Dann gehe:</label>
            <select id="rm1" class="puzzle-input" style="width:80px;display:inline;">
              <option value="R" selected>Rechts</option>
              <option value="L">Links</option>
              <option value="H">Halt</option>
            </select>
          </div>

          <div style="display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.8rem;
                      background:rgba(0,10,5,0.5);border:1px solid rgba(0,255,136,0.15);
                      border-radius:4px;opacity:0.6;">
            <span style="font-family:var(--font-mono);font-size:0.9rem;min-width:10ch;">
              Lese <strong style="color:var(--neon-green);">_</strong> →
            </span>
            <span style="font-size:0.78rem;color:var(--neon-green);">
              Schreibe _ → Halt &nbsp;
              <span style="color:var(--text-dim);">(Bandende — fix, kein Ändern nötig)</span>
            </span>
          </div>
        </div>
      </div>

      <div class="hint">
        💡 Ziel-Regeln: Wenn Kopf <strong>0</strong> liest → schreibe <strong>1</strong>, gehe Rechts.
        Wenn Kopf <strong>1</strong> liest → schreibe <strong>0</strong>, gehe Rechts.
        Die _ -Regel stoppt die Maschine automatisch am Bandende.
      </div>

      <div style="margin:0.6rem 0;padding:0.4rem 0.7rem;background:rgba(0,5,15,0.8);
                  border:1px solid rgba(0,212,255,0.1);border-radius:3px;min-height:60px;">
        <div style="font-size:0.62rem;color:var(--text-dim);margin-bottom:2px;">PROTOKOLL DER SCHRITTE:</div>
        <div id="tm-log"></div>
      </div>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="puzzle-btn" id="tm-step">▷ EIN SCHRITT</button>
        <button class="puzzle-btn" id="tm-run">▶▶ AUSFÜHREN</button>
        <button class="puzzle-btn danger" id="tm-reset">↺ NOCHMAL</button>
      </div>
      <div class="puzzle-feedback" id="tm-fb"></div>
    `;

    renderTape();
    renderLog();

    box.querySelector('#tm-step').onclick = () => {
      if (running) return;
      if (halted) { checkResult(); return; }
      const cont = doStep();
      if (!cont) setTimeout(checkResult, 200);
    };

    box.querySelector('#tm-run').onclick = () => {
      if (running) return;
      reset(); renderTape(); renderLog();
      const fb = box.querySelector('#tm-fb');
      if (fb) { fb.textContent = ''; fb.className = 'puzzle-feedback'; }
      running = true;
      let limit = 30;
      const runStep = () => {
        if (halted || limit <= 0) { running = false; setTimeout(checkResult, 300); return; }
        const cont = doStep();
        limit--;
        if (cont) setTimeout(runStep, 200);
        else { running = false; setTimeout(checkResult, 300); }
      };
      runStep();
    };

    box.querySelector('#tm-reset').onclick = () => {
      running = false; reset(); renderTape(); renderLog();
      const fb = box.querySelector('#tm-fb');
      if (fb) { fb.textContent = ''; fb.className = 'puzzle-feedback'; }
    };
  };
}
