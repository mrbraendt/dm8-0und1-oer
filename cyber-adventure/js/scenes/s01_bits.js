// ============================================================
// S01 — PETES STREAM-ARCHIV (Bits & Bytes / ASCII)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor, makeServerRack } from '../helpers.js';

export function build(container, engine) {
  container.className = 'bg-stream-archive';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';

  makeFloor(container);

  // ---- Background: terminal grids ----
  for (let i = 0; i < 5; i++) {
    const term = el('div', {
      left: (i * 20 + 1) + '%', top: '5%',
      width: '17%', height: '55%',
      background: '#030b04',
      border: '1px solid rgba(0,255,136,0.3)',
      borderRadius: '3px',
      boxShadow: '0 0 10px rgba(0,255,136,0.15)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    });
    // fill with fake terminal output
    const lines = ['> ARCHIV SCAN...', '> chunk 0x00ff ok', '> chunk 0x04a2 ok',
      '> ERROR 0x00d4', '> BYTE SIGNATURE DETECTED', '> retrying...'];
    for (let l = 0; l < 12; l++) {
      const line = document.createElement('div');
      line.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:clamp(0.3rem,0.7vw,0.5rem);
        color:${l === 4 ? 'var(--neon-pink)' : 'var(--neon-green)'};
        padding:1px 4px;opacity:${0.3 + Math.random() * 0.7};`;
      line.textContent = lines[l % lines.length];
      term.appendChild(line);
    }
    container.appendChild(term);
  }

  // ---- Main "BYTE was HERE" console ----
  const mainConsole = el('div', {
    left: '15%', bottom: '15%', width: '48%', height: '45%',
    background: '#020c03',
    border: '2px solid var(--neon-green)',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0,255,136,0.4)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
  });
  mainConsole.innerHTML = `
    <div style="background:rgba(0,40,10,0.8);padding:4px 8px;border-bottom:1px solid rgba(0,255,136,0.2);
                font-family:'Orbitron',sans-serif;font-size:0.65rem;color:var(--neon-green);">
      ARCHIV-TERMINAL — CLUE_01.txt
    </div>
    <div style="padding:0.6rem;font-family:'Share Tech Mono',monospace;
                font-size:clamp(0.4rem,0.9vw,0.65rem);color:var(--neon-green);line-height:1.8;">
      <div>Liebe Kim (ja, ich weiß deinen Namen),</div>
      <div style="margin-top:4px;color:var(--neon-pink);">mein nächster Hinweis steckt hier:</div>
      <div style="margin-top:6px;color:#00d4ff;word-break:break-all;font-size:0.9em;">
        01010011 01000011 01001000 01010101<br>
        01001100 01000101
      </div>
      <div style="margin-top:4px;color:#556677;">— BYTE, der Großartige</div>
    </div>
  `;
  // scanline
  const sl = document.createElement('div');
  sl.style.cssText = `position:absolute;inset:0;pointer-events:none;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.2) 2px,rgba(0,0,0,0.2) 4px);`;
  mainConsole.appendChild(sl);
  container.appendChild(mainConsole);

  // ---- Server rack left ----
  const rack = makeServerRack({ left: '2%', bottom: '4%', width: '10%', height: '55%' });
  container.appendChild(rack);

  // ---- Graffiti tag (BYTE's signature) on wall ----
  const tag = el('div', {
    right: '5%', top: '10%',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 'clamp(1rem,3vw,2rem)',
    fontWeight: '900',
    color: 'var(--neon-pink)',
    textShadow: '0 0 15px var(--neon-pink), 0 0 40px rgba(255,45,120,0.3)',
    letterSpacing: '0.08em',
    transform: 'rotate(-5deg)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  });
  tag.textContent = '// BYTE WAS HERE //';
  container.appendChild(tag);

  // ---- Small note/post-it ----
  const note = el('div', {
    right: '6%', bottom: '20%', width: '16%',
    background: '#1a1400',
    border: '1px solid var(--neon-yellow)',
    borderRadius: '2px',
    padding: '0.5rem',
    boxShadow: '0 0 8px rgba(255,224,51,0.2)',
    cursor: 'pointer',
  });
  note.innerHTML = `<div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.4rem,0.8vw,0.6rem);
    color:var(--neon-yellow);line-height:1.6;">
    ★ ASCII = American<br>Standard Code for<br>Information Interchange<br>
    <span style="color:#556677;">A=65, B=66, …<br>a=97, b=98, …</span>
  </div>`;
  container.appendChild(note);

  // ---- KIM and JUSTUS figures ----
  container.appendChild(makeFigure('kim',    { left: '10%', bottom: '4%' }));
  container.appendChild(makeFigure('justus', { left: '25%', bottom: '4%' }, true));

  // ---- ARIA hologram (PETEs KI) ----
  const aria = el('div', {
    right: '18%', bottom: '4%',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '2px',
  });
  aria.innerHTML = `
    <div style="width:clamp(18px,3vw,30px);height:clamp(18px,3vw,30px);border-radius:50%;
                border:2px solid var(--neon-cyan);background:rgba(0,30,40,0.8);
                box-shadow:0 0 12px var(--neon-cyan);
                animation:pulse 2s ease-in-out infinite;"></div>
    <div style="width:clamp(14px,2.5vw,24px);height:clamp(18px,3vw,30px);
                border:2px solid var(--neon-cyan);border-top:none;border-radius:0 0 5px 5px;
                background:rgba(0,20,40,0.5);">
    </div>
    <div style="display:flex;gap:3px;">
      <div style="width:8px;height:18px;border:2px solid var(--neon-cyan);border-top:none;
                  border-radius:0 0 4px 4px;background:rgba(0,20,40,0.4);"></div>
      <div style="width:8px;height:18px;border:2px solid var(--neon-cyan);border-top:none;
                  border-radius:0 0 4px 4px;background:rgba(0,20,40,0.4);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.55rem;color:var(--neon-cyan);
                letter-spacing:0.1em;">ARIA-7</div>
  `;
  container.appendChild(aria);

  // ---- Desks ----
  const desk = el('div', {
    left: '0%', bottom: '0', width: '78%', height: '4%',
    background: '#18181f',
    borderTop: '2px solid #334',
  });
  container.appendChild(desk);

  // ---- Hotspots ----
  engine.addHotspot(mainConsole, 'Archiv-Terminal untersuchen', () => {
    if (state.isPuzzleSolved('s01_ascii')) {
      dialog.show('kim', 'Das Terminal hat mir schon geholfen. BYTE hat uns zur Schule gelockt.');
      return;
    }
    engine.openPuzzle(buildAsciiPuzzle(engine));
  });

  engine.addHotspot(note, 'Notiz lesen', () => {
    dialog.show('aria', 'ASCII steht für "American Standard Code for Information Interchange". Jeder Buchstabe hat eine Zahl. A = 65, B = 66, … Z = 90. Kleinbuchstaben beginnen bei 97. Leerzeichen = 32. Das ist die Basis digitaler Textkommunikation.');
  });

  engine.addHotspot(aria, 'ARIA-7 befragen', () => {
    dialog.sequence([
      { char: 'aria', text: 'Hallo. Ich bin ARIA-7, Pixel_Petes KI-Assistent. Meine Funktion: Alles wörtlich nehmen und keine Witze verstehen.' },
      { char: 'justus', text: 'Witzig! Hey ARIA, hast du eine Kaffeemaschine für mich?' },
      { char: 'aria', text: 'Ich bin eine KI ohne Körper und lebe auf einem Server. Ich kann keine Kaffee produzieren. Ich schlage vor, du kaufst einen Kaffee in einem Laden.' },
      { char: 'justus', text: '...Okay.' },
    ]);
  });

  engine.addHotspot(tag, 'Graffiti-Tag ansehen', () => {
    dialog.show('kim', '"BYTE was here." Sehr dezent. Wer hackert eigentlich Graffiti in Logdateien?');
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— PETEs Stream-Archiv-Server. Grüner Terminal-Glimmer überall. —' },
    { char: 'aria', text: 'Willkommen, Kim. Ich bin ARIA-7. Pete hat gesagt: "Wenn ich verschwinde, hilf der Person, die Binary lesen kann." Du bist hier. Ich helfe.' },
    { char: 'kim', text: 'ARIA — hast du gesehen, wer PETEs Account gehackt hat?' },
    { char: 'aria', text: 'Ich habe eine Entität mit dem Bezeichner "BYTE" beobachtet. Sie hat eine verschlüsselte Nachricht hinterlassen. Im Terminal dort drüben.' },
    { char: 'justus', text: 'Oh, ich geh schon mal schauen — ist das Chip-Ebene oder Software-Ebene da?' },
      { char: 'aria', text: 'Das stimmt so nicht ganz — es gibt mehr als nur "0 oder 1" als Antwort. Zwischen Transistor und Nutzer liegen sieben Ebenen. Aber das kommt später.' },
  ]);
}

// ---- ASCII Puzzle ----
// 01010011 = S, 01000011 = C, 01001000 = H, 01010101 = U, 01001100 = L, 01000101 = E
// = "SCHULE"

// Bytes for "SCHULE"
const ASCII_BYTES = [
  { bin: '01010011', dec: 83, chr: 'S' },
  { bin: '01000011', dec: 67, chr: 'C' },
  { bin: '01001000', dec: 72, chr: 'H' },
  { bin: '01010101', dec: 85, chr: 'U' },
  { bin: '01001100', dec: 76, chr: 'L' },
  { bin: '01000101', dec: 69, chr: 'E' },
];

function buildAsciiPuzzle(engine) {
  return (box) => {
    const cardHTML = ASCII_BYTES.map((b, i) => `
      <div class="byte-card" id="ab-${i}" style="
        display:inline-flex;flex-direction:column;align-items:center;justify-content:space-between;gap:3px;
        min-height:120px;
        background:rgba(0,10,30,0.8);border:1px solid rgba(0,212,255,0.2);
        border-radius:5px;padding:6px 5px;min-width:68px;
        transition:border-color 0.2s, box-shadow 0.2s;
      ">
        <div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;
                    color:var(--neon-blue);letter-spacing:0.03em;line-height:1.5;text-align:center;">
          ${b.bin.slice(0,4)}<br>${b.bin.slice(4)}
        </div>
        <button class="ab-btn" data-i="${i}" style="
          font-family:'Orbitron',sans-serif;font-size:0.48rem;padding:2px 6px;
          border:1px solid rgba(0,255,136,0.4);background:rgba(0,255,136,0.07);
          color:var(--neon-green);cursor:pointer;border-radius:3px;letter-spacing:0.05em;
          transition:background 0.15s;white-space:nowrap;
        ">→ DEZ</button>
        <div id="ab-dec-${i}" style="
          font-family:'Share Tech Mono',monospace;font-size:0.75rem;
          color:var(--neon-blue);font-weight:700;min-height:1.1rem;opacity:0;
          transition:opacity 0.3s;
        ">${b.dec}</div>
        <div id="ab-chr-${i}" style="
          font-family:'Orbitron',sans-serif;font-size:0.85rem;font-weight:900;
          color:var(--neon-pink);min-height:1.3rem;opacity:0;transition:opacity 0.3s;
        ">${b.chr}</div>
      </div>
    `).join('');

    box.innerHTML = `
      <h2>📟 ASCII-DECODER — BYTES HINWEIS</h2>
      <p>BYTE hat den Hinweis als 6 Bytes Binary hinterlassen.<br>
         <strong>Schritt 1:</strong> Klicke „→ DEZ" um Binär → Dezimalzahl umzurechnen.<br>
         <strong>Schritt 2:</strong> Schlage die Dezimalzahl in der ASCII-Tabelle nach → Buchstabe.<br>
         <strong>Schritt 3:</strong> Alle 6 Buchstaben ergeben ein Wort.</p>

      <div style="overflow-x:auto;padding-bottom:4px;">
        <div style="display:flex;gap:6px;flex-wrap:nowrap;width:max-content;margin:0.6rem 0;">
          ${cardHTML}
        </div>
      </div>

      <div class="hint">
        💡 Stellenwerte von links nach rechts: 128 · 64 · 32 · 16 · 8 · 4 · 2 · 1<br>
        Aufaddieren nur wo eine <strong>1</strong> steht.<br>
        Beispiel: <strong>01010011</strong> = 0+64+0+16+0+0+2+1 = <strong>83</strong> = S
      </div>

      <div style="margin-top:0.5rem;padding:0.5rem 0.6rem;background:rgba(0,10,20,0.6);
           border:1px solid rgba(0,212,255,0.15);border-radius:4px;">
        <div style="font-family:'Orbitron',sans-serif;font-size:0.55rem;color:var(--neon-blue);
                    margin-bottom:0.3rem;letter-spacing:0.08em;">ASCII-TABELLE (Großbuchstaben)</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:var(--text-dim);
                    display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:1px 8px;line-height:1.9;">
          ${Array.from({length:26},(_,i)=>65+i)
            .map(n=>`<span><b style="color:var(--neon-blue)">${n}</b> = ${String.fromCharCode(n)}</span>`).join('')}
        </div>
      </div>

      <div style="margin-top:0.6rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
        <button class="puzzle-btn" id="ascii-reveal">👁 ALLE DEZIMALWERTE ANZEIGEN</button>
      </div>

      <p style="margin-top:0.8rem;">Was ergibt der Code? (6 Buchstaben, ein Wort)</p>
      <input type="text" class="puzzle-input" id="ascii-ans" placeholder="z.B. HALLO" autocomplete="off" style="text-transform:uppercase;">
      <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
        <button class="puzzle-btn" id="ascii-check">▸ ENTSCHLÜSSELN</button>
      </div>
      <div class="puzzle-feedback" id="ascii-fb"></div>
    `;

    // Per-card reveal
    box.querySelectorAll('.ab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        document.getElementById(`ab-dec-${i}`).style.opacity = '1';
        btn.textContent = '✓';
        btn.style.borderColor = 'var(--neon-green)';
        btn.style.color = 'var(--neon-green)';
        document.getElementById(`ab-${i}`).style.borderColor = 'rgba(0,212,255,0.5)';
        document.getElementById(`ab-${i}`).style.boxShadow = '0 0 8px rgba(0,212,255,0.12)';
      });
    });

    box.querySelector('#ascii-reveal').onclick = () => {
      box.querySelectorAll('.ab-btn').forEach(btn => btn.click());
    };

    const check = () => {
      const ans = document.getElementById('ascii-ans').value.trim().toUpperCase();
      const fb = document.getElementById('ascii-fb');
      if (ans === 'SCHULE') {
        // Reveal letters on success
        ASCII_BYTES.forEach((_, i) => {
          setTimeout(() => { document.getElementById(`ab-chr-${i}`).style.opacity = '1'; }, i * 100);
        });
        fb.className = 'puzzle-feedback ok';
        fb.textContent = '✓ SCHULE! BYTE versteckt sich in der Schule. Ich dachte, Hacker arbeiten von Hawaii aus.';
        document.getElementById('ascii-check').className = 'puzzle-btn success';
        state.solvedPuzzle('s01_ascii');
        setTimeout(() => {
          engine.closePuzzle();
          engine.notify('📦 ITEM: Turing-Protokoll');
          inventory.addItem('turing_protokoll');
          dialog.sequence([
            { char: 'kim', text: '"SCHULE." BYTE versteckt sich in unserer Schule. Natürlich.' },
            { char: 'aria', text: 'Täter haben oft einen emotionalen Bezug zum Tatort — so steht es in der Verbrechens-Forschung. BYTE-Profil: Klasse-8-Dramatiker.' },
            { char: 'justus', text: 'Ich finde das mega cool von ihm.' },
            { char: 'aria', text: 'Das ist keine sinnvolle Reaktion auf eine Straftat.' },
            { char: 'kim', text: 'Und im Turing-Protokoll steht ein Hinweis auf den Informatikraum. Los.', after: () => engine.loadScene('s02_turing') },
          ]);
        }, 1800);
      } else {
        fb.className = 'puzzle-feedback err';
        fb.textContent = '✗ Nochmal: Addiere die Stellen wo eine 1 steht: Bit 7=64, Bit 6=32… Tipp: 01010011 = 64+16+2+1 = 83 = S';
      }
    };

    document.getElementById('ascii-check').onclick = check;
    document.getElementById('ascii-ans').onkeydown = e => { if (e.key === 'Enter') check(); };
  };
}
