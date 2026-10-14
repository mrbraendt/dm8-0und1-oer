// ============================================================
// S07 — BYTES VERSTECK (Kryptographie / ROT13)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor } from '../helpers.js';

const CIPHER_TEXT = 'VASBEZNGVBA';
const PLAIN_TEXT  = 'INFORMATION';

export function build(container, engine) {
  container.className = 'bg-byte-versteck';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Chaotic background deco ----
  for (let i = 0; i < 8; i++) {
    const scrap = el('div', {
      left: (Math.random()*80) + '%',
      top:  (Math.random()*60) + '%',
      fontFamily: "'Share Tech Mono',monospace",
      fontSize: '0.5rem',
      color: `rgba(255,45,120,${0.1+Math.random()*0.25})`,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    });
    scrap.textContent = ['01010100', 'VASBEZ', 'ROT-??', '> HIDE', 'BYTE=1337'][i%5];
    container.appendChild(scrap);
  }

  // ---- BYTE's lair desk ----
  const deskByte = el('div', {
    left: '20%', bottom: '0', width: '55%', height: '5%',
    background: '#1a0810', borderTop: '2px solid var(--neon-pink)',
  });
  container.appendChild(deskByte);

  // ---- The encoded message on wall ----
  const msgWall = el('div', {
    left: '25%', top: '10%', width: '48%', height: '32%',
    background: 'rgba(30,0,10,0.95)',
    border: '2px solid var(--neon-pink)',
    borderRadius: '4px',
    boxShadow: '0 0 25px rgba(255,45,120,0.4)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  });
  msgWall.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:0.7rem;
                color:var(--neon-pink);text-shadow:0 0 10px var(--neon-pink);">
      BYTES GEHEIMBOTSCHAFT
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:clamp(1rem,3vw,2rem);
                font-weight:900;color:var(--neon-pink);
                text-shadow:0 0 20px var(--neon-pink),0 0 60px rgba(255,45,120,0.3);
                letter-spacing:0.15em;">
      ${CIPHER_TEXT}
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.55rem;
                color:var(--text-dim);">[KLICK → ENTSCHLÜSSELN]</div>
  `;
  container.appendChild(msgWall);

  // ---- Desk props: caesar wheel poster ----
  const poster = el('div', {
    left: '5%', top: '15%', width: '16%', height: '40%',
    background: 'rgba(15,0,5,0.9)',
    border: '1px solid rgba(255,45,120,0.25)',
    padding: '0.5rem',
    cursor: 'pointer',
  });
  poster.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:0.55rem;color:var(--neon-pink);margin-bottom:4px;">
      CAESAR-CHIFFRE
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.45rem;color:var(--text-dim);line-height:1.7;">
      A→N, B→O,<br>C→P, ...<br>N→A, O→B,<br>...<br>
      ROT13: +13<br>Selbst-invers!<br>ROT13(ROT13(x))=x
    </div>
  `;
  container.appendChild(poster);

  // ---- BYTE figure (at his lair!) ----
  const byteChar = el('div', {
    right: '10%', bottom: '5%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    cursor: 'pointer',
  });
  byteChar.innerHTML = `
    <div style="width:clamp(22px,4vw,36px);height:clamp(22px,4vw,36px);border-radius:50%;
                border:2px solid var(--neon-pink);background:rgba(50,0,15,0.9);
                box-shadow:0 0 12px var(--neon-pink);"></div>
    <div style="width:clamp(18px,3vw,28px);height:clamp(22px,3.5vw,36px);
                border:2px solid var(--neon-pink);border-top:none;border-radius:0 0 5px 5px;
                background:rgba(40,0,10,0.7);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:9px;height:20px;border:2px solid var(--neon-pink);border-top:none;
                  border-radius:0 0 4px 4px;background:rgba(30,0,8,0.6);"></div>
      <div style="width:9px;height:20px;border:2px solid var(--neon-pink);border-top:none;
                  border-radius:0 0 4px 4px;background:rgba(30,0,8,0.6);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.55rem;color:var(--neon-pink);
                text-shadow:0 0 6px var(--neon-pink);">BYTE</div>
  `;
  container.appendChild(byteChar);

  container.appendChild(makeFigure('kim',    { left: '20%', bottom: '5%' }));
  container.appendChild(makeFigure('justus', { left: '30%', bottom: '5%' }));

  // ---- Hotspots ----
  engine.addHotspot(msgWall, 'Nachricht entschlüsseln', () => {
    if (state.isPuzzleSolved('s07_rot13')) {
      dialog.show('kim', 'INFORMATION. BYTEs Passwort. Bereit für das Finale. Los geht\'s!', [], () => engine.loadScene('s08_finale'));
      return;
    }
    engine.openPuzzle(buildROT13Puzzle(engine));
  });

  engine.addHotspot(poster, 'Caesar-Chiffre-Poster ansehen', () => {
    dialog.show('brandt', 'Die Caesar-Chiffre verschiebt jeden Buchstaben um N Stellen im Alphabet. Bei ROT13 ist N=13. Das Besondere: Da das Alphabet 26 Buchstaben hat, ist ROT13 selbst-invers — ROT13 zweimal anwenden ergibt wieder den Klartext. A↔N, B↔O, C↔P, ...');
  });

  engine.addHotspot(byteChar, 'BYTE ansprechen', () => {
    dialog.sequence([
      { char: 'byte', text: 'Ihr habt es hierher geschafft! Beeindruckend. Wirklich. Aber ihr werdet meinen Code NIE knacken.' },
      { char: 'kim', text: 'Es ist ROT13, BYTE.' },
      { char: 'byte', text: '...Was?' },
      { char: 'justus', text: 'ROT13 ist die zweit-einfachste Verschlüsselungs-Methode der Welt.' },
      { char: 'byte', text: 'Ich dachte... also... es klingt so tech.' },
    ]);
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— BYTEs Versteck. Eine umfunktionierte Abstellkammer im Schulkeller. Es riecht nach Chips. —' },
    { char: 'kim', text: 'Das ist... kleiner als erwartet.' },
    { char: 'justus', text: 'Er hat Poster von sich selbst aufgehängt.' },
    { char: 'byte', text: 'WILLKOMMEN in meiner Festung! Ich habe meine wichtigste Botschaft mit der UNBREAKABLE-Chiffre verschlüsselt!' },
    { char: 'kim', text: 'Das ist ROT13.' },
    { char: 'byte', text: '— mit der UNBREAKABLE ROT13-Chiffre, die ich persönlich verbes–– also. Knackt das, wenn ihr könnt!' },
  ]);
}

function buildROT13Puzzle(engine) {
  return (box) => {
    const rot13 = s => s.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0)-65+13)%26+65));
    let currentShift = 0;

    const render = () => {
      const decoded = applyShift(CIPHER_TEXT, currentShift);
      const shiftEl = box.querySelector('#shift-val');
      const decEl   = box.querySelector('#decoded-text');
      const wheelEl = box.querySelector('#caesar-wheel');
      if (shiftEl) shiftEl.textContent = currentShift;
      if (decEl)   decEl.textContent   = decoded;
      if (wheelEl) drawWheel(wheelEl, currentShift);
    };

    box.innerHTML = `
      <h2>🔐 CAESAR-CHIFFRE — BYTES GEHEIMNIS</h2>
      <p>BYTE hat einen Text mit einer Caesar-Verschiebung verschlüsselt.
         Probiere verschiedene Verschiebungswerte, bis ein echtes Wort erscheint.</p>

      <div style="margin:0.8rem 0;">
        <p style="font-size:0.85rem;color:var(--text-dim);">Verschlüsselter Text:</p>
        <div class="caesar-display">${CIPHER_TEXT}</div>
        <p style="font-size:0.85rem;color:var(--text-dim);margin-top:0.5rem;">Entschlüsselt (Shift = <span id="shift-val">0</span>):</p>
        <div class="decoded-display" id="decoded-text">${CIPHER_TEXT}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.8rem;">
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;" class="rot-buttons">
          <button class="puzzle-btn" data-shift="1">ROT-1</button>
          <button class="puzzle-btn" data-shift="3">ROT-3</button>
          <button class="puzzle-btn" data-shift="7">ROT-7</button>
          <button class="puzzle-btn" data-shift="10">ROT-10</button>
          <button class="puzzle-btn" data-shift="13">ROT-13</button>
          <button class="puzzle-btn" data-shift="18">ROT-18</button>
          <button class="puzzle-btn" data-shift="20">ROT-20</button>
        </div>
        <div>
          <label style="font-size:0.8rem;color:var(--text-dim);">oder direkt eingeben (1–25):</label>
          <input type="range" id="shift-slider" min="0" max="25" value="0"
            style="width:80%;accent-color:var(--neon-pink);vertical-align:middle;margin:0 0.5rem;">
        </div>
      </div>

      <div class="hint">
        💡 ROT13: jeder Buchstabe wird um 13 Stellen verschoben.<br>
        A→N, N→A, B→O, O→B, … (da 26÷2=13, gilt ROT13(ROT13(x))=x)<br>
        Probiere ROT-13 und schau, was erscheint!
      </div>

      <canvas id="caesar-wheel" width="180" height="180"
        style="display:block;margin:0.5rem auto;border:1px solid rgba(255,45,120,0.2);border-radius:50%;"></canvas>

      <p style="margin-top:0.5rem;font-size:0.85rem;">Wenn du das Lösungswort erkannt hast:</p>
      <input type="text" class="puzzle-input" id="rot-answer" placeholder="Entschlüsseltes Wort" style="text-transform:uppercase;">
      <div style="margin-top:0.5rem;">
        <button class="puzzle-btn" id="rot-check">▸ BESTÄTIGEN</button>
      </div>
      <div class="puzzle-feedback" id="rot-fb"></div>
    `;

    // Shift buttons
    box.querySelectorAll('[data-shift]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentShift = +btn.dataset.shift;
        box.querySelector('#shift-slider').value = currentShift;
        render();
      });
    });

    // Slider
    box.querySelector('#shift-slider').addEventListener('input', e => {
      currentShift = +e.target.value;
      render();
    });

    box.querySelector('#rot-check').addEventListener('click', () => {
      const ans = box.querySelector('#rot-answer').value.trim().toUpperCase();
      const fb  = box.querySelector('#rot-fb');
      if (ans === PLAIN_TEXT) {
        fb.className = 'puzzle-feedback ok';
        fb.textContent = `✓ "${PLAIN_TEXT}"! ROT13 war BYTEs "unbreakable" Schlusskette. Touché.`;
        state.solvedPuzzle('s07_rot13');
        setTimeout(() => {
          engine.closePuzzle();
          engine.notify('📦 ITEM: Passwort-Zettel');
          inventory.addItem('passwort_zettel');
          dialog.sequence([
            { char: 'kim', text: '"INFORMATION" — das ist BYTEs Passwort für PETEs Account. Fast geschafft.' },
            { char: 'byte', text: 'Das kann nicht sein. ROT13 ist mathematisch unbrechbar.' },
            { char: 'aria', text: 'Korrektur: ROT13 hat 0 Bits echter Zufälligkeit (Entropie). Es ist vollständig unsicher.' },
            { char: 'byte', text: '...Ich glaube, ich muss kurz sitzen.' },
            { char: 'kim', text: 'Los. Finales Protokoll. Lass uns PETEs Account zurückholen.', after: () => engine.loadScene('s08_finale') },
          ]);
        }, 1800);
      } else {
        fb.className = 'puzzle-feedback err';
        fb.textContent = `✗ "${ans}" ist nicht korrekt. Tipp: Probiere ROT-13 und lies den entschlüsselten Text!`;
      }
    });

    box.querySelector('#rot-answer').addEventListener('keydown', e => {
      if (e.key === 'Enter') box.querySelector('#rot-check').click();
    });

    render();
  };
}

function applyShift(text, shift) {
  return text.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0)-65+shift)%26+65));
}

function drawWheel(canvas, shift) {
  const ctx  = canvas.getContext('2d');
  const W    = canvas.width, H = canvas.height;
  const cx   = W/2, cy = H/2, r = (W/2)*0.85;
  ctx.clearRect(0,0,W,H);

  // Two rings: outer=plain, inner=shifted
  for (let i=0; i<26; i++) {
    const angle = (i/26)*Math.PI*2 - Math.PI/2;
    // Outer ring
    const ox = cx + r*Math.cos(angle);
    const oy = cy + r*Math.sin(angle);
    ctx.font = `bold ${W*0.07}px 'Share Tech Mono',monospace`;
    const plain = String.fromCharCode(65+i);
    ctx.fillStyle = '#00d4ff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(plain, ox, oy);

    // Inner ring (shifted)
    const ir = r*0.6;
    const sx = cx + ir*Math.cos(angle);
    const sy = cy + ir*Math.sin(angle);
    const shifted = String.fromCharCode((i+shift)%26+65);
    ctx.fillStyle = '#ff2d78';
    ctx.fillText(shifted, sx, sy);
  }
  // Center label
  ctx.font = `${W*0.06}px 'Orbitron',sans-serif`;
  ctx.fillStyle = 'rgba(255,45,120,0.6)';
  ctx.fillText(`+${shift}`, cx, cy);
}
