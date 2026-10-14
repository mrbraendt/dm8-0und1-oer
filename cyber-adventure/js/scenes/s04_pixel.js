// ============================================================
// S04 — PETES BACKUP-DRIVE (Pixel / Bitmaps)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor } from '../helpers.js';

// 5×5 Schlüssel-Symbol (1=ein, 0=aus)
const KEY_PATTERN = [
  [0,0,1,0,0],
  [0,1,1,1,0],
  [1,1,0,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

export function build(container, engine) {
  container.className = 'bg-pixel-drive';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Desk ----
  const desk = el('div', {
    left: '15%', bottom: '0', width: '70%', height: '6%',
    background: '#14121e', borderTop: '2px solid #334',
  });
  container.appendChild(desk);

  // ---- External drive props ----
  for (let i = 0; i < 3; i++) {
    const drive = el('div', {
      left: (20 + i * 18) + '%', bottom: '6%', width: '12%', height: '8%',
      background: '#1a1828',
      border: `1px solid rgba(${i===1?'255,45,120':'0,212,255'},0.3)`,
      borderRadius: '3px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    });
    drive.innerHTML = `<div style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;
      color:${i===1?'var(--neon-pink)':'var(--neon-blue)'};text-align:center;letter-spacing:0.05em;">
      ${i===1 ? '⚠ KAPUTT' : 'BACKUP_' + i}
    </div>`;
    container.appendChild(drive);
  }

  // ---- Large corrupted screen showing the puzzle ----
  const screen = el('div', {
    left: '28%', bottom: '12%', width: '42%', height: '55%',
    background: '#030308',
    border: '2px solid var(--neon-blue)',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(0,212,255,0.3), inset 0 0 30px rgba(0,30,60,0.6)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
  });
  screen.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:clamp(0.5rem,1.2vw,0.75rem);
                color:var(--neon-blue);text-shadow:0 0 8px var(--neon-blue);margin-bottom:0.5rem;">
      BACKUP_FILE — KORRUPT
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2px;margin-bottom:0.5rem;">
      ${KEY_PATTERN.flat().map(v => `
        <div style="width:clamp(12px,2vw,22px);height:clamp(12px,2vw,22px);
                    background:${v ? 'rgba(0,212,255,0.6)' : 'rgba(0,10,20,0.9)'};
                    border:1px solid rgba(0,212,255,0.2);border-radius:1px;
                    ${v?'box-shadow:0 0 4px rgba(0,212,255,0.4);':''}"></div>
      `).join('')}
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.55rem;color:var(--text-dim);">
      [KLICK → PUZZLE]
    </div>
  `;
  container.appendChild(screen);

  // ---- Sticky note from ARIA ----
  const note2 = el('div', {
    left: '6%', top: '20%', width: '18%',
    background: '#0a0a14',
    border: '1px solid rgba(0,255,240,0.3)',
    padding: '0.5rem',
    borderRadius: '2px',
    boxShadow: '0 0 6px rgba(0,255,240,0.15)',
  });
  note2.innerHTML = `<div style="font-family:'Share Tech Mono',monospace;font-size:0.55rem;
    color:var(--neon-cyan);line-height:1.7;">
    Pixel = Picture Element.<br>Jeder Pixel hat eine Farbe.<br>
    Hier: nur 0 (aus) oder 1 (an).<br>= 1-Bit-Grafik.<br><br>
    <span style="color:#556677;">— ARIA-7</span>
  </div>`;
  container.appendChild(note2);

  // ---- ARIA hologram ----
  const aria = el('div', {
    right: '8%', bottom: '6%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    cursor: 'pointer',
  });
  aria.innerHTML = `
    <div style="width:28px;height:28px;border-radius:50%;border:2px solid var(--neon-cyan);
                background:rgba(0,30,40,0.8);box-shadow:0 0 12px var(--neon-cyan);
                animation:pulse 2s ease-in-out infinite;"></div>
    <div style="width:22px;height:28px;border:2px solid var(--neon-cyan);border-top:none;
                border-radius:0 0 5px 5px;background:rgba(0,20,40,0.5);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:7px;height:16px;border:2px solid var(--neon-cyan);border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(0,20,40,0.4);"></div>
      <div style="width:7px;height:16px;border:2px solid var(--neon-cyan);border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(0,20,40,0.4);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:var(--neon-cyan);">ARIA-7</div>
  `;
  container.appendChild(aria);

  container.appendChild(makeFigure('kim', { left: '15%', bottom: '6%' }));

  // ---- Hotspots ----
  engine.addHotspot(screen, 'Backup-Datei reparieren', () => {
    if (state.isPuzzleSolved('s04_pixel')) {
      dialog.show('kim', 'Das Pixel-Muster ist korrekt. Der Backup ist entschlüsselt.');
      return;
    }
    engine.openPuzzle(buildPixelPuzzle(engine));
  });

  engine.addHotspot(aria, 'ARIA-7 befragen', () => {
    dialog.sequence([
      { char: 'aria', text: 'Ich bin ARIA-7. Meine Aufgabe war es, PETEs Dateien vor unbefugtem Zugriff zu schützen. Das habe ich mit einem Pixel-Schloss getan.' },
      { char: 'kim', text: 'Ein Pixel-Schloss?' },
      { char: 'aria', text: 'Korrekt. Das Ziel-Bild ist ein Schlüssel-Symbol. 5×5 Pixel. 1-Bit-Tiefe. Reproduziere das Muster, um Zugriff zu erhalten.' },
    ]);
  });

  engine.addHotspot(note2, 'Notiz von ARIA lesen', () => {
    dialog.show('aria', 'Ein Bild ist ein Raster aus Pixeln. Bei 1 Bit pro Pixel: entweder 0 (aus/schwarz) oder 1 (an/weiß). 8 Pixel × 8 Pixel ergeben 64 Bit = 8 Byte an Daten. Je mehr Bits pro Pixel, desto mehr Farben.');
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— PETEs privater Arbeitsraum in der Schule. Überall Kabel und Backup-Drives. —' },
    { char: 'aria', text: 'Ich habe die Backup-Datei mit einem Pixel-Schloss gesichert. Rekonstruiere das Muster exakt, dann öffnet sich der Container.' },
    { char: 'kim', text: 'Ein Schloss aus Pixeln. Klever.' },
    { char: 'aria', text: 'Ich schlage vor, du nimmst dir Zeit. BYTE hat daneben noch einen Hinweis hinterlassen. Wie immer sehr theatralisch.' },
  ]);
}

function buildPixelPuzzle(engine) {
  return (box) => {
    let grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    let painting = null; // null | 0 | 1 — what we're painting in current drag

    const render = () => {
      const gridEl = box.querySelector('#pixel-grid');
      gridEl.innerHTML = '';
      gridEl.style.display = 'grid';
      gridEl.style.gridTemplateColumns = 'repeat(5, 1fr)';
      gridEl.style.gap = '3px';
      gridEl.style.width = 'fit-content';
      gridEl.style.margin = '0 auto';

      grid.forEach((row, y) => {
        row.forEach((val, x) => {
          const cell = document.createElement('div');
          cell.style.cssText = `
            width:clamp(28px,5vw,46px);height:clamp(28px,5vw,46px);
            background:${val ? 'var(--neon-blue)' : 'rgba(0,10,20,0.9)'};
            border:1px solid rgba(0,212,255,${val ? '0.6' : '0.15'});
            cursor:pointer;border-radius:2px;
            box-shadow:${val ? '0 0 6px rgba(0,212,255,0.5)' : 'none'};
            transition:background 0.1s;
          `;
          cell.addEventListener('mousedown', () => {
            painting = val === 0 ? 1 : 0;
            grid[y][x] = painting;
            render();
          });
          cell.addEventListener('mouseenter', () => {
            if (painting !== null) { grid[y][x] = painting; render(); }
          });
          gridEl.appendChild(cell);
        });
      });
    };

    box.innerHTML = `
      <h2>🖼 PIXEL-SCHLOSS — BACKUP REPARIEREN</h2>
      <p>Rekonstruiere das Schlüssel-Symbol (5×5 Pixel).
         Klicke oder ziehe um Pixel ein- und auszuschalten.</p>

      <div style="display:flex;gap:1.5rem;align-items:flex-start;margin:0.8rem 0;flex-wrap:wrap;">
        <div>
          <p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:0.5rem;">Ziel-Bild:</p>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:2px;">
            ${KEY_PATTERN.flat().map(v => `
              <div style="width:22px;height:22px;
                background:${v?'rgba(0,212,255,0.5)':'rgba(0,10,20,0.9)'};
                border:1px solid rgba(0,212,255,0.2);border-radius:1px;">
              </div>
            `).join('')}
          </div>
        </div>
        <div style="flex:1;">
          <p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:0.5rem;">Deine Eingabe:</p>
          <div id="pixel-grid"></div>
        </div>
      </div>

      <div class="hint">
        💡 Binär für Zeile 1: ${KEY_PATTERN[0].join(' ')} = ${parseInt(KEY_PATTERN[0].join(''),2).toString().padStart(2,'0')}
      </div>

      <div style="margin-top:0.8rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="puzzle-btn" id="px-check">▸ ÜBERPRÜFEN</button>
        <button class="puzzle-btn danger" id="px-clear">↺ ALLES LÖSCHEN</button>
      </div>
      <div class="puzzle-feedback" id="px-fb"></div>
    `;

    document.addEventListener('mouseup', () => { painting = null; }, { once: false });

    render();

    box.querySelector('#px-clear').onclick = () => {
      grid = Array.from({ length: 5 }, () => Array(5).fill(0));
      render();
    };

    box.querySelector('#px-check').onclick = () => {
      const fb = box.querySelector('#px-fb');
      const correct = grid.every((row, y) => row.every((val, x) => val === KEY_PATTERN[y][x]));
      if (correct) {
        fb.className = 'puzzle-feedback ok';
        fb.textContent = '✓ Pixel-Muster korrekt! Backup-Datei entschlüsselt. BYTE hinterlässt einen Link zur Polizei-Datenbank.';
        state.solvedPuzzle('s04_pixel');
        setTimeout(() => {
          engine.closePuzzle();
          engine.notify('📦 ITEM: Paradox-Notiz');
          inventory.addItem('paradox_notiz');
          dialog.sequence([
            { char: 'aria', text: 'Backup erfolgreich entschlüsselt. Inhalt: BYTEs nächster Hinweis verweist auf Polizeistation E17. Dort wurde ein seltsamer Virus gemeldet.' },
            { char: 'kim', text: 'Ein Virus in der Polizeistation. Na toll. Los.', after: () => engine.loadScene('s05_halt') },
          ]);
        }, 1800);
      } else {
        const matches = grid.flat().filter((v,i) => v === KEY_PATTERN.flat()[i]).length;
        fb.className = 'puzzle-feedback err';
        fb.textContent = `✗ ${matches}/25 Pixel korrekt. Vergleiche mit dem Ziel-Muster links.`;
      }
    };
  };
}
