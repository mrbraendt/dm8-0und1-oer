// ============================================================
// S03 — SERVERRAUM (Abstraktionsschichten)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor, makeServerRack } from '../helpers.js';

// Correct order (bottom to top): Transistor, Hardware, Betriebssystem, Software, Nutzer
const LAYERS_CORRECT = ['Transistor', 'Hardware', 'Betriebssystem', 'Software', 'Nutzer'];
const LAYERS_SCRAMBLED = ['Software', 'Transistor', 'Nutzer', 'Hardware', 'Betriebssystem'];

export function build(container, engine) {
  container.className = 'bg-serverraum';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Server racks ----
  let rack0 = null;
  for (let i = 0; i < 4; i++) {
    const r = makeServerRack({
      left: (5 + i * 22) + '%', bottom: '4%',
      width: '16%', height: '70%',
    });
    container.appendChild(r);
    if (i === 0) rack0 = r;
  }

  // ---- BYTE's scrambled layer display (centre) ----
  const dispBox = el('div', {
    left: '30%', bottom: '4%', width: '38%', height: '75%',
    background: 'rgba(5,5,20,0.97)',
    border: '2px solid var(--neon-pink)',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(255,45,120,0.3)',
    display: 'flex', flexDirection: 'column',
    padding: '0.5rem',
    gap: '0.3rem',
    overflow: 'hidden',
  });
  dispBox.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:0.65rem;color:var(--neon-pink);
                border-bottom:1px solid rgba(255,45,120,0.3);padding-bottom:0.3rem;margin-bottom:0.3rem;">
      BYTE_LOCK — SCHICHTDIAGRAMM KAPUTT
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:var(--text-dim);margin-bottom:0.4rem;">
      Ordne die Abstraktionsschichten<br>von unten (Hardware) nach oben (Nutzer).
    </div>
    <div id="layer-display" style="flex:1;display:flex;flex-direction:column;gap:0.3rem;justify-content:center;">
    </div>
  `;
  container.appendChild(dispBox);

  renderLayers(dispBox.querySelector('#layer-display'), engine);

  // ---- Cable spaghetti deco ----
  const cables = el('div', {
    left: '0', bottom: '4%', right: '0', height: '5%',
    pointerEvents: 'none',
  });
  cables.innerHTML = `<div style="width:100%;height:100%;
    background:repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(0,212,255,0.1) 30px,rgba(0,212,255,0.1) 32px),
               repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(0,255,136,0.06) 8px,rgba(0,255,136,0.06) 10px);
  "></div>`;
  container.appendChild(cables);

  // ---- KIM + WOBBLE ----
  container.appendChild(makeFigure('kim',    { left: '5%',  bottom: '4%' }));
  container.appendChild(makeFigure('brandt', { left: '18%', bottom: '4%', label: 'HR. BRANDT' }));

  // Hotspot on the display box
  engine.addHotspot(dispBox, 'Schicht-Puzzle lösen', () => {
    if (state.isPuzzleSolved('s03_layers')) {
      dialog.show('kim', 'Die Schichten sind korrekt sortiert. BYTE hat einen Backup-Drive-Link hinterlassen.');
      return;
    }
    engine.openPuzzle(buildLayerPuzzle(engine));
  });

  // Rack hotspot
  if (rack0) {
    engine.addHotspot(rack0, 'Server-Rack untersuchen', () => {
      dialog.show('aria', 'Dieser Rack enthält 24 physische Server. Jeder Server hat CPU, RAM und Speicher. Das ist die Hardware-Schicht. Darüber liegt das Betriebssystem. Darüber die Anwendungen. Darüber: Sie.');
    });
  }
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— Schulgebäude, Keller. Serverraum. Es summt und blinkt überall. —' },
    { char: 'brandt', text: 'Ah, der Serverraum! Hier läuft alles zusammen — im wörtlichen Sinne! Also, die Schichten der Computerarchitektur—' },
    { char: 'kim', text: 'BYTE hat das Schicht-Diagramm auf dem Hauptserver durcheinander gebracht. Als Schloss.' },
    { char: 'brandt', text: 'Oh! Das ist… eigentlich ein sehr lehrreicher Angriff. Chapeau, BYTE.' },
    { char: 'justus', text: 'Moment — wo bin eigentlich ich?' },
    { char: 'kim', text: 'Du hast im Flur geschlafen. Auf einer Tastatur.' },
  ]);
}

function renderLayers(el, engine) {
  // Just show scrambled preview
  el.innerHTML = LAYERS_SCRAMBLED.map((l, i) => `
    <div style="padding:0.4rem 0.8rem;background:rgba(255,45,120,0.08);
                border:1px solid rgba(255,45,120,0.3);border-radius:3px;
                font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:var(--neon-pink);">
      ${l}
    </div>
  `).join('');
}

function buildLayerPuzzle(engine) {
  return (box) => {
    let items = [...LAYERS_SCRAMBLED];
    let dragIndex = null;

    const render = () => {
      const list = box.querySelector('#layer-list');
      if (!list) return;
      list.innerHTML = '';
      items.forEach((name, i) => {
        const div = document.createElement('div');
        div.className = 'layer-item';
        div.draggable = true;
        div.innerHTML = `<span class="layer-icon">${layerIcon(name)}</span><span>${name}</span>`;
        div.addEventListener('dragstart', () => dragIndex = i);
        div.addEventListener('dragover', e => { e.preventDefault(); div.classList.add('drag-over'); });
        div.addEventListener('dragleave', () => div.classList.remove('drag-over'));
        div.addEventListener('drop', e => {
          e.preventDefault();
          div.classList.remove('drag-over');
          if (dragIndex === null || dragIndex === i) return;
          const moved = items.splice(dragIndex, 1)[0];
          items.splice(i, 0, moved);
          dragIndex = null;
          render();
        });
        list.appendChild(div);
      });
    };

    box.innerHTML = `
      <h2>🗂 ABSTRAKTIONSSCHICHTEN — BYTE-SCHLOSS</h2>
      <p>BYTE hat die 5 Abstraktionsschichten des Computers durcheinandergebracht.
         Ordne sie durch Drag & Drop von <strong style="color:var(--neon-green)">unten → oben</strong>
         (die unterste Zeile = unterste Schicht = Hardware-Basis).</p>

      <div class="hint">
        💡 Denke daran: Ganz unten sind die Transistoren (Schalter), ganz oben ist der Mensch (Nutzer).
        Was liegt zwischen Transistoren und Betriebssystem? Was kommt nach dem Betriebssystem?
      </div>

      <div style="display:flex;align-items:flex-start;gap:1rem;margin:0.8rem 0;flex-wrap:wrap;">
        <div style="display:flex;gap:0.4rem;align-items:flex-start;">
          <div style="display:flex;flex-direction:column;justify-content:space-between;
                      font-family:'Orbitron',sans-serif;font-size:0.48rem;color:var(--text-dim);
                      padding:6px 0;text-align:right;min-width:52px;gap:4px;">
            <span style="color:var(--neon-blue);">① oben<br>= NUTZER</span>
            <span>②</span>
            <span>③</span>
            <span>④</span>
            <span style="color:var(--neon-green);">⑤ unten<br>= TRANSISTOR</span>
          </div>
          <div style="flex:1;min-width:180px;">
            <p style="margin-bottom:0.5rem;font-size:0.85rem;">Reihenfolge per Drag&amp;Drop:</p>
            <div id="layer-list" class="layer-list"></div>
          </div>
        </div>
        <div style="min-width:160px;padding:0.6rem;background:rgba(0,20,40,0.5);border:1px solid rgba(0,212,255,0.15);
                    border-radius:3px;font-size:0.78rem;color:var(--text-dim);line-height:2.1;">
          <div style="color:var(--neon-blue);margin-bottom:0.3rem;font-size:0.68rem;">KORREKTE REIHENFOLGE:</div>
          <span style="color:var(--neon-blue);">① Nutzer</span> — du 👋<br>
          <span>② Software</span> — Apps, Browser<br>
          <span>③ Betriebssystem</span> — Windows/iOS<br>
          <span>④ Hardware</span> — CPU, RAM<br>
          <span style="color:var(--neon-green);">⑤ Transistor</span> — kleinste Einheit
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;">
        <button class="puzzle-btn" id="layer-check">▸ ÜBERPRÜFEN</button>
      </div>
      <div class="puzzle-feedback" id="layer-fb"></div>
    `;

    render();

    box.querySelector('#layer-check').onclick = () => {
      const fb = box.querySelector('#layer-fb');
      const correct = items.every((name, i) => name === LAYERS_CORRECT[LAYERS_CORRECT.length - 1 - i]);
      if (correct) {
        fb.className = 'puzzle-feedback ok';
        fb.textContent = '✓ Korrekt! Von oben nach unten: Nutzer → Software → Betriebssystem → Hardware → Transistor.';
        state.solvedPuzzle('s03_layers');
        setTimeout(() => {
          engine.closePuzzle();
          engine.notify('📦 ITEM: Korrupte Datei');
          inventory.addItem('korrupte_datei');
          dialog.sequence([
            { char: 'kim', text: 'Das Schloss ist offen. BYTE hat einen Link zum nächsten Hinweis hinterlassen: PETEs verschlüsselter Backup-Drive.' },
            { char: 'brandt', text: 'Ausgezeichnet! Und jetzt wisst ihr: Ohne Transistoren gibt es keine Hardware. Ohne Hardware kein OS. Ohne OS keine Software. Ohne Software—' },
            { char: 'kim', text: 'Keinen Hacker. Danke, Herr Brandt.', after: () => engine.loadScene('s04_pixel') },
          ]);
        }, 1800);
      } else {
        fb.className = 'puzzle-feedback err';
        fb.textContent = `✗ Noch nicht korrekt. Tipp: Transistor ist die unterste Schicht (erste Zeile von unten). Nutzer ist ganz oben.`;
      }
    };
  };
}

function layerIcon(name) {
  const icons = { Transistor:'⚡', Hardware:'💻', Betriebssystem:'🐧', Software:'📱', Nutzer:'👤' };
  return icons[name] || '•';
}
