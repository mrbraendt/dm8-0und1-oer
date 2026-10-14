// ============================================================
// S06 — KI-LABOR (KI & Bias)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';
import { el, makeFigure, makeFloor } from '../helpers.js';

export function build(container, engine) {
  container.className = 'bg-ki-lab';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';
  makeFloor(container);

  // ---- Lab equipment background ----
  for (let i = 0; i < 3; i++) {
    const panel = el('div', {
      left: (5 + i * 30) + '%', top: '8%', width: '24%', height: '40%',
      background: 'rgba(30,0,40,0.5)',
      border: '1px solid rgba(204,102,255,0.2)',
      borderRadius: '4px',
    });
    panel.innerHTML = `<div style="padding:0.4rem;font-family:'Share Tech Mono',monospace;
      font-size:0.5rem;color:rgba(204,102,255,0.5);line-height:1.6;">
      NEURAL NET ${i+1}<br>
      ${Array.from({length:12},()=>Math.random()>0.7?'██':'░░').join(' ')}<br>
      LOSS: ${(0.1+Math.random()*0.5).toFixed(3)}<br>
      ACC:  ${(60+Math.random()*35).toFixed(1)}%
    </div>`;
    container.appendChild(panel);
  }

  // ---- Big "BYTE's DEEPFAKES" gallery ----
  const gallery = el('div', {
    left: '15%', bottom: '15%', width: '65%', height: '40%',
    background: 'rgba(10,0,20,0.9)',
    border: '2px solid var(--neon-purple)',
    borderRadius: '4px',
    boxShadow: '0 0 20px rgba(204,102,255,0.3)',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    padding: '0.8rem',
    cursor: 'pointer',
    overflow: 'hidden',
    zIndex: 100,
  });
  gallery.innerHTML = `
    <div style="text-align:center;flex:1;">
      <div style="font-family:'Orbitron',sans-serif;font-size:0.65rem;color:var(--neon-purple);margin-bottom:0.4rem;animation:pulse 2s infinite;">
        ⚠ BYTEs DEEPFAKES — ANALYSE ERFORDERLICH ⚠
      </div>
      <div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;opacity:0.8;">
        ${['😈 7 Finger?', '🤖 3 Augen!', '🦊 2 Nasen!'].map(l => `
          <div style="width:clamp(50px,10vw,80px);height:clamp(50px,10vw,80px);
                      background:rgba(40,0,60,0.6);border:1px solid rgba(204,102,255,0.4);
                      border-radius:4px;display:flex;align-items:center;justify-content:center;
                      flex-direction:column;font-size:0.7rem;text-align:center;
                      color:var(--text-bright);gap:2px;">
            ${l}
          </div>
        `).join('')}
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:0.55rem;
                  color:var(--neon-purple);margin-top:0.4rem;text-shadow:0 0 5px var(--neon-purple);">[KLICK → ANALYSIEREN]</div>
    </div>
  `;
  container.appendChild(gallery);

  // ---- Info terminal ----
  const infoTerm = el('div', {
    left: '2%', bottom: '15%', width: '12%', height: '35%',
    background: 'rgba(5,0,10,0.95)',
    border: '1px solid rgba(204,102,255,0.3)',
    borderRadius: '3px',
    padding: '0.4rem',
    cursor: 'pointer',
  });
  infoTerm.innerHTML = `<div style="font-family:'Share Tech Mono',monospace;font-size:0.5rem;
    color:rgba(204,102,255,0.7);line-height:1.7;">
    KI-FAKTEN:<br>
    ▸ KI lernt aus Daten<br>
    ▸ Schlechte Daten →<br>  schlechte KI<br>
    ▸ KI erfindet Fakten (Halluzinieren)<br>
    ▸ Bias = Lernverzerrung durch einseitige Daten<br>
    <span style="color:#556677;">[KLICK]</span>
  </div>`;
  container.appendChild(infoTerm);

  container.appendChild(makeFigure('kim',  { left: '4%',  bottom: '15%' }));
  container.appendChild(makeFigure('justus',{ left: '12%', bottom: '15%'}));

  // BYTE appears as hologram here
  const byteHolo = el('div', {
    right: '5%', bottom: '15%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
  });
  byteHolo.innerHTML = `
    <div style="width:30px;height:30px;border-radius:50%;border:2px solid var(--neon-pink);
                background:rgba(40,0,15,0.8);box-shadow:0 0 12px var(--neon-pink);
                animation:flicker 3s infinite;"></div>
    <div style="width:24px;height:30px;border:2px solid var(--neon-pink);border-top:none;
                border-radius:0 0 5px 5px;background:rgba(30,0,10,0.6);
                animation:flicker 3s infinite;opacity:0.7;"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:7px;height:16px;border:2px solid var(--neon-pink);border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(30,0,10,0.5);"></div>
      <div style="width:7px;height:16px;border:2px solid var(--neon-pink);border-top:none;
                  border-radius:0 0 3px 3px;background:rgba(30,0,10,0.5);"></div>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:var(--neon-pink);
                text-shadow:0 0 4px var(--neon-pink);animation:flicker 4s infinite;">BYTE [HOLO]</div>
  `;
  container.appendChild(byteHolo);

  // ---- Hotspots ----
  engine.addHotspot(gallery, 'Deepfakes analysieren', () => {
    engine.openPuzzle(buildKiPuzzle(engine));
  });

  engine.addHotspot(infoTerm, 'KI-Info-Terminal lesen', () => {
    dialog.show('brandt', 'KI-Systeme lernen aus Trainingsdaten. Sind diese Daten einseitig — zum Beispiel überwiegend von einer Gruppe — dann lernt die KI diese Lernverzerrung mit. Das nennt man Bias. Eine KI, die nur Programmier-Foren kennt, denkt vielleicht, alle Informatiker sind männlich. Außerdem: KI erfindet manchmal Fakten, die plausibel klingen aber falsch sind — das nennt man Halluzinieren.');
  });

  engine.addHotspot(byteHolo, 'BYTE-Hologramm ansprechen', () => {
    dialog.sequence([
      { char: 'byte', text: 'HA! Ihr denkt ihr könnt mich finden? Schaut euch an — das bin ich auf jedem Kontinent gleichzeitig!' },
      { char: 'kim', text: '...BYTE, auf dem dritten Foto hast du sieben Finger.' },
      { char: 'byte', text: 'Das sind meine... Bonus-Finger. Für produktiveres Tippen.' },
      { char: 'justus', text: 'Und auf dem zweiten hast du drei Augen.' },
      { char: 'byte', text: 'Bye. [VERBINDUNG GETRENNT]' },
    ]);
  });
}

export function onEnter(engine) {
  dialog.sequence([
    { char: 'system', text: '— Privates KI-Forschungslabor. Überall Neural-Net-Visualisierungen und lila Neonlicht. —' },
    { char: 'byte', text: 'Willkommen in meinem Reich! Meine KI hat 1000 Fotos von mir generiert — ein perfektes Alibi!' },
    { char: 'kim', text: 'BYTE, wir sehen die Fehler in deinen Bildern. Zeit für einen Realitätscheck.' },
  ]);
}

function buildKiPuzzle(engine) {
  const questions = [
    {
      q: 'BYTE behauptet: "Meine KI hat beweisend festgestellt, dass ich unschuldig bin." Ist das glaubwürdig?',
      opts: [
        { label: 'Ja — KI lügt nie.', wrong: 'KI-Systeme können falsche Fakten erfinden (halluzinieren) — das klingt plausibel, ist aber trotzdem falsch.' },
        { label: 'Nein — KI kann falsche Fakten erfinden (Halluzinieren).', correct: true, msg: 'Genau! KI-Systeme sind keine neutralen Beweismittel.' },
        { label: 'Ja — wenn man genug GPU hat.', wrong: 'GPU-Leistung ändert nichts an der Zuverlässigkeit von Ausgaben.' },
      ]
    },
    {
      q: 'BYTEs KI hat ausschließlich aus seinen eigenen Social-Media-Posts gelernt. Welches Problem entsteht?',
      opts: [
        { label: 'Die KI ist zu gut.', wrong: 'Zu viel eigene Daten führen nicht zu besseren Ergebnissen, sondern zu Bias.' },
        { label: 'Die KI hat Bias (= Lernverzerrung) — sie kennt nur BYTEs Weltsicht.', correct: true, msg: 'Richtig! Einseitige Trainingsdaten erzeugen verzerrte Modelle.' },
        { label: 'Keine Probleme — mehr Daten sind immer besser.', wrong: 'Mehr Daten helfen nur, wenn sie vielfältig und repräsentativ sind.' },
      ]
    },
    {
      q: 'Ein KI-Bild zeigt BYTE an 10 verschiedenen Orten gleichzeitig. Wie wertvoll ist das als Alibi?',
      opts: [
        { label: 'Sehr wertvoll — KI macht keine Fehler.', wrong: 'Generative KI erfindet Bilder basierend auf Wahrscheinlichkeiten — kein Foto-Beweis.' },
        { label: 'Nicht wertvoll — KI-generierte Bilder sind kein Beweis für reale Anwesenheit.', correct: true, msg: 'Genau! Generierte Bilder belegen keine physische Existenz an einem Ort.' },
        { label: 'Vielleicht — kommt auf die Auflösung an.', wrong: 'Auflösung ändert nichts an der grundsätzlichen Unzuverlässigkeit als Beweis.' },
      ]
    },
  ];

  return (box) => {
    let step = 0, score = 0;

    const render = () => {
      box.scrollTop = 0;
      
      if (step >= questions.length) {
        let resultHtml = `
          <div style="text-align:center; padding:1rem;">
            <h2 style="color:var(--neon-blue); margin-bottom:1rem;">🤖 ANALYSE-ERGEBNIS</h2>
            <div class="puzzle-feedback ${score >= 2 ? 'ok' : 'err'}" style="padding:1rem; margin-bottom:1rem;">
              ${score} von ${questions.length} Hinweisen korrekt erkannt.
            </div>
        `;

        if (score >= 2) {
          resultHtml += `
            <p style="font-size:1.1rem; line-height:1.5;">KI-Modelle können "halluzinieren" und Bias aufweisen. 
            BYTEs Alibi ist als technisches Artefakt entlarvt.</p>
          </div>`;
          box.innerHTML = resultHtml;
          state.solvedPuzzle('s06_ki');
          setTimeout(() => {
            engine.closePuzzle();
            engine.notify('📦 ITEM: Verschlüsselter Brief');
            inventory.addItem('geheimbrief');
            dialog.sequence([
              { char: 'kim', text: 'Sieben Finger, drei Augen... BYTE, deine KI halluziniert schlimmer als ein schlafender Toaster.' },
              { char: 'byte', text: 'Pah! Das sind... künstlerische Freiheiten! Aber meinen Brief knackt ihr nie!' },
              { char: 'justus', text: 'ROT13? Ernsthaft? Das haben wir in der dritten Klasse gelöst.', after: () => engine.loadScene('s07_krypto') },
            ]);
          }, 2500);
        } else {
          resultHtml += `
            <p>Nicht genug Beweise! Analysiere die Bilder und die Info-Terminals im Labor genauer.</p>
            <button class="puzzle-btn" id="ki-retry" style="margin-top:1.5rem; width:100%; padding:1rem;">↺ NEU STARTEN</button>
          </div>`;
          box.innerHTML = resultHtml;
          box.querySelector('#ki-retry').onclick = () => { step = 0; score = 0; render(); };
        }
        return;
      }

      const q = questions[step];
      box.innerHTML = `
        <div style="max-width:800px; margin:0 auto;">
          <h2 style="color:var(--neon-purple); margin-bottom:0.5rem; font-size:1.2rem;">KI-LABOR: ANALYSE ${step+1}/${questions.length}</h2>
          <div style="background:rgba(0,0,0,0.3); padding:1.2rem; border-radius:4px; border-left:4px solid var(--neon-blue); margin-bottom:1.5rem;">
            <p style="font-size:1.15rem; line-height:1.4; margin:0;">${q.q}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.7rem;">
            ${q.opts.map((o,i) => `
              <button class="scenario-option-btn" data-i="${i}" style="text-align: left; padding: 1.1rem; font-size:1.05rem; background:rgba(0,212,255,0.05); border:1px solid rgba(0,212,255,0.2);">
                <span style="color:var(--neon-blue); font-weight:bold; margin-right:0.5rem;">${String.fromCharCode(65+i)}</span> ${o.label}
              </button>
            `).join('')}
          </div>
          <div id="ki-opt-fb" class="puzzle-feedback" style="margin-top:1.5rem; min-height: 3.5rem; display:none; padding:1rem;"></div>
        </div>
      `;

      box.querySelectorAll('.scenario-option-btn').forEach(btn => {
        btn.onclick = () => {
          const opt = q.opts[+btn.dataset.i];
          box.querySelectorAll('.scenario-option-btn').forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.5';
          });
          btn.style.opacity = '1';
          
          const fb = box.querySelector('#ki-opt-fb');
          fb.style.display = 'block';
          
          if (opt.correct) {
            btn.style.borderColor = 'var(--neon-green)';
            btn.style.background = 'rgba(0,255,136,0.1)';
            fb.className = 'puzzle-feedback ok';
            fb.textContent = '✓ ' + opt.msg;
            score++;
          } else {
            btn.style.borderColor = 'var(--neon-pink)';
            btn.style.background = 'rgba(255,45,120,0.1)';
            fb.className = 'puzzle-feedback err';
            fb.textContent = '✗ ' + (opt.wrong || 'Das ist leider falsch.');
          }
          setTimeout(() => { step++; render(); }, 2200);
        };
      });
    };

    render();
  };
}
