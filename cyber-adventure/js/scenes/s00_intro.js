// ============================================================
// S00 — KIMS ZIMMER (Intro)
// ============================================================

import { dialog }    from '../dialog.js';
import { state }     from '../state.js';
import { inventory } from '../inventory.js';

export function build(container, engine) {
  container.className = 'bg-kims-room';
  container.style.cssText += 'width:100%;height:100%;position:relative;overflow:hidden;';

  // ---- City skyline behind window ----
  const window_ = el('div', {
    left:'55%', top:'8%', width:'30%', height:'45%',
    background:'#030308',
    border:'3px solid #223',
    borderRadius:'4px',
    overflow:'hidden',
    boxShadow:'inset 0 0 30px rgba(0,50,100,0.4)',
  });
  // Buildings
  for (let i=0; i<8; i++) {
    const h = 30 + Math.random()*50;
    const b = el('div', {
      position:'absolute',
      bottom:'0', left:(i*12.5)+'%', width:'10%', height:h+'%',
      background:'#0a0a18',
      borderTop: `2px solid rgba(${i%2?'0,212,255':'255,45,120'},0.4)`,
    });
    // random lit windows
    for (let w=0; w<3; w++) {
      const win = el('div', {
        position:'absolute',
        width:'20%', height:'8%',
        top:(10+w*30)+'%', left:'30%',
        background: Math.random()>0.5 ? 'rgba(0,212,255,0.4)' : 'rgba(255,224,51,0.3)',
        borderRadius:'1px',
      });
      b.appendChild(win);
    }
    window_.appendChild(b);
  }
  // Stars in the night sky — top 35% only, above all buildings
  for (let s = 0; s < 28; s++) {
    const star = document.createElement('div');
    const size = Math.random() < 0.25 ? 2 : 1;
    star.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:#fff;
      left:${(Math.random()*92+2).toFixed(1)}%;
      top:${(Math.random()*33+2).toFixed(1)}%;
      z-index:10;
      opacity:${(Math.random()*0.5+0.4).toFixed(2)};
      animation: starTwinkle ${(1.5+Math.random()*3).toFixed(1)}s ease-in-out infinite alternate;
      animation-delay:${(Math.random()*3).toFixed(1)}s;
    `;
    window_.appendChild(star);
  }

  // Rain effect
  const rain = el('div', {
    position:'absolute', inset:'0',
    backgroundImage:'repeating-linear-gradient(175deg, transparent, transparent 4px, rgba(0,100,200,0.07) 4px, rgba(0,100,200,0.07) 5px)',
    pointerEvents:'none',
  });
  window_.appendChild(rain);
  container.appendChild(window_);

  // Window frame
  const winFrame = el('div', {
    left:'54%', top:'7%', width:'32%', height:'47%',
    border:'4px solid #334',
    borderRadius:'4px',
    pointerEvents:'none',
  });
  container.appendChild(winFrame);

  // ---- Desk ----
  const desk = el('div', {
    left:'2%', bottom:'0', width:'55%', height:'4%',
    background:'#1a1820',
    borderTop:'2px solid #334',
  });
  container.appendChild(desk);

  // ---- Gaming chair ----
  const chair = el('div', {
    left:'10%', bottom:'4%', width:'14%', height:'30%',
    background:'#14121e',
    border:'2px solid #334',
    borderRadius:'8px 8px 0 0',
  });
  const chairBack = el('div', {
    position:'absolute', top:'-40%', left:'10%', width:'80%', height:'45%',
    background:'#1a1828',
    border:'2px solid #334',
    borderRadius:'6px 6px 0 0',
    borderBottom:'none',
  });
  chair.appendChild(chairBack);
  container.appendChild(chair);

  // ---- Main monitor (cracked / glitching) ----
  const mon = el('div', {
    left:'20%', bottom:'4%', width:'20%', height:'28%',
    background:'#020408',
    border:'3px solid #00d4ff',
    borderRadius:'4px',
    boxShadow:'0 0 20px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.15), inset 0 0 30px rgba(0,30,60,0.8)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    gap:'6px',
    overflow:'hidden',
    cursor:'pointer',
  });
  mon.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:clamp(0.5rem,1.5vw,0.9rem);color:#00d4ff;
                text-shadow:0 0 10px #00d4ff;letter-spacing:0.12em;text-align:center;">
      PIXEL_PETE LIVE
    </div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.4rem,1vw,0.65rem);
                color:#ff2d78;text-align:center;letter-spacing:0.08em;animation:flicker 3s infinite;">
      ⚠ VERBINDUNG UNTERBROCHEN ⚠
    </div>
    <div id="binary-msg" style="font-family:'Share Tech Mono',monospace;
                font-size:clamp(0.35rem,0.8vw,0.55rem);color:#00ff88;
                text-align:center;padding:0 0.5rem;line-height:1.8;word-break:break-all;
                text-shadow:0 0 5px rgba(0,255,136,0.5);">
      01000010 01011001 01010100 01000101 00100000<br>
      01010111 01000001 01010010 00100000<br>
      01001000 01001001 01000101 01010010
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:clamp(0.3rem,0.7vw,0.5rem);
                color:#556677;margin-top:4px;letter-spacing:0.1em;">
      [KLICK ZUM UNTERSUCHEN]
    </div>
  `;
  // Scanline overlay
  const scanlines = el('div', {
    position:'absolute', inset:'0',
    backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.3) 2px,rgba(0,0,0,0.3) 4px)',
    pointerEvents:'none',
    borderRadius:'4px',
  });
  mon.appendChild(scanlines);
  container.appendChild(mon);

  // ---- Small second monitor (social feed) ----
  const mon2 = el('div', {
    left:'49%', bottom:'4%', width:'5%', height:'20%',
    background:'#040408',
    border:'2px solid #334',
    borderRadius:'3px',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    gap:'2px',
    boxShadow:'0 0 6px rgba(255,45,120,0.2)',
  });
  mon2.innerHTML = `
    <div style="font-size:0.4rem;color:#ff2d78;text-align:center;word-break:break-all;padding:2px;">
      🔴LIVE<br>▶ 0 👀
    </div>
  `;
  container.appendChild(mon2);

  // ---- Neon sign on wall ----
  const sign = el('div', {
    left:'2%', top:'10%',
    fontFamily:"'Orbitron',sans-serif",
    fontSize:'clamp(0.7rem,2vw,1.2rem)',
    fontWeight:'900',
    color:'#ff2d78',
    textShadow:'0 0 10px #ff2d78, 0 0 30px rgba(255,45,120,0.4)',
    letterSpacing:'0.1em',
    animation:'flicker 5s infinite',
    pointerEvents:'none',
  });
  sign.textContent = 'KIM\'S ZIMMER';
  container.appendChild(sign);

  // ---- Poster on wall — centered above monitor ----
  const poster = el('div', {
    left:'22%', top:'30%', width:'14%', height:'26%',
    background:'linear-gradient(135deg,#0d0418,#180430)',
    border:'1px solid #443',
    borderRadius:'2px',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexDirection:'column', gap:'4px',
  });
  poster.innerHTML = `
    <div style="font-size:clamp(0.4rem,1vw,0.7rem);color:#cc66ff;text-align:center;
                font-family:'Orbitron',sans-serif;letter-spacing:0.05em;">PIXEL<br>PETE</div>
    <div style="font-size:1rem;">🎮</div>
    <div style="font-size:0.3rem;color:#556677;">subscriber: 2.4M</div>
  `;
  container.appendChild(poster);

  // ---- Floor line ----
  const floor = el('div', {
    position:'absolute', bottom:'0', left:'0', right:'0', height:'2px',
    background:'linear-gradient(90deg,transparent,#00d4ff,transparent)',
    boxShadow:'0 0 12px #00d4ff',
  });
  container.appendChild(floor);

  // ---- Sofa on the right ----
  const sofa = el('div', {
    right:'12%', bottom:'0', width:'18%', height:'15%',
    background:'#1a1030',
    border:'2px solid #443366',
    borderRadius:'6px 6px 0 0',
    boxShadow:'inset 0 0 10px rgba(120,60,200,0.15)',
  });
  // Sofa back
  const sofaBack = el('div', {
    position:'absolute', top:'-55%', left:'-1px', right:'-1px',
    height:'60%',
    background:'#22143a',
    border:'2px solid #443366',
    borderBottom:'none',
    borderRadius:'6px 6px 0 0',
  });
  sofa.appendChild(sofaBack);
  // Sofa cushion
  const sofaCushion = el('div', {
    position:'absolute', top:'10%', left:'5%', width:'90%', height:'40%',
    background:'#2a1845',
    border:'1px solid #554477',
    borderRadius:'3px',
  });
  sofa.appendChild(sofaCushion);
  // Left armrest
  const armL = el('div', {
    position:'absolute', top:'-20%', left:'-1px', width:'12%', height:'110%',
    background:'#22143a',
    border:'2px solid #443366',
    borderRadius:'4px 0 0 0',
  });
  sofa.appendChild(armL);
  // Right armrest
  const armR = el('div', {
    position:'absolute', top:'-20%', right:'-1px', width:'12%', height:'110%',
    background:'#22143a',
    border:'2px solid #443366',
    borderRadius:'0 4px 0 0',
  });
  sofa.appendChild(armR);
  container.appendChild(sofa);

  // ---- Plant next to sofa ----
  const plantPot = el('div', {
    right:'31%', bottom:'0', width:'4%', height:'8%',
    background:'#3a1a0a',
    border:'1px solid #6a3010',
    borderRadius:'2px 2px 4px 4px',
    display:'flex', alignItems:'center', justifyContent:'center',
  });
  container.appendChild(plantPot);
  // Plant stem + leaves
  const plantLeaves = el('div', {
    right:'31%', bottom:'8%', width:'4%', height:'18%',
    display:'flex', alignItems:'flex-end', justifyContent:'center',
    pointerEvents:'none',
  });
  plantLeaves.innerHTML = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="width:2px;height:100%;background:#1a5c10;position:absolute;bottom:0;"></div>
      <div style="position:absolute;bottom:65%;left:-12px;width:14px;height:8px;
                  background:#1e7a14;border-radius:50% 50% 0 50%;transform:rotate(-30deg);
                  box-shadow:0 0 4px rgba(0,255,80,0.2);"></div>
      <div style="position:absolute;bottom:65%;right:-12px;width:14px;height:8px;
                  background:#1e7a14;border-radius:50% 50% 50% 0;transform:rotate(30deg);
                  box-shadow:0 0 4px rgba(0,255,80,0.2);"></div>
      <div style="position:absolute;bottom:82%;left:-8px;width:12px;height:7px;
                  background:#24941a;border-radius:50% 50% 0 50%;transform:rotate(-20deg);
                  box-shadow:0 0 4px rgba(0,255,80,0.2);"></div>
      <div style="position:absolute;bottom:82%;right:-8px;width:12px;height:7px;
                  background:#24941a;border-radius:50% 50% 50% 0;transform:rotate(20deg);
                  box-shadow:0 0 4px rgba(0,255,80,0.2);"></div>
      <div style="position:absolute;bottom:96%;left:50%;transform:translateX(-50%);
                  width:10px;height:10px;background:#2ab020;border-radius:50%;
                  box-shadow:0 0 6px rgba(0,255,80,0.3);"></div>
    </div>
  `;
  container.appendChild(plantLeaves);

  // ---- KIM figure (player char) ----
  const kim = makeFigure('kim', { left:'16%', bottom:'4%' });
  container.appendChild(kim);

  // ---- JUSTUS figure ----
  const justus = makeFigure('justus', { left:'32%', bottom:'4%' }, true);
  container.appendChild(justus);

  // ---- Phone on desk ----
  const phone = el('div', {
    left:'6%', bottom:'4%', width:'3%', height:'5%',
    background:'#111',
    border:'1px solid #00ff88',
    borderRadius:'2px',
    boxShadow:'0 0 8px rgba(0,255,136,0.3)',
    cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'0.5rem',
  });
  phone.textContent = '📱';
  container.appendChild(phone);

  // ---- Hotspots ----

  engine.addHotspot(mon, 'Monitor untersuchen', () => {
    dialog.sequence([
      { char:'kim', text: 'Moment — das ist kein Verbindungsfehler. Das sind Binary-Zeichen.' },
      { char:'justus', text: 'War doch klar! Morse-Code! Ich rufe jetzt die Polizei.' },
      { char:'kim', text: 'Justus. Das ist kein Morse-Code. Und ruf nicht die Polizei.' },
      { char:'kim', text: 'Ich muss rausfinden, was BYTE da verschlüsselt hat. Mal den Decoder aufmachen.', after: () => engine.openPuzzle(buildBinaryPuzzle(engine, container)) },
    ]);
  });

  engine.addHotspot(poster, 'PIXEL_PETE-Poster', () => {
    dialog.show('kim', 'Pixel_Pete. 14 Jahre alt, 2.4 Millionen Abonnenten und erklärt Minecraft-Redstone besser als manche Physiklehrer. Hat gestern seinen letzten Stream unterbrochen — mitten im Satz.');
  });

  engine.addHotspot(phone, 'Handy', () => {
    if (!state.getFlag('read_voicemail')) {
      dialog.sequence([
        { char:'system', text: '📨 VOICEMAIL von PIXEL_PETE — 22:47 Uhr' },
        { char:'pete', text: 'Kim! Hier ist PETE. Jemand hat meine Accounts — warte, was ist das — das ist Binary! Das bedeutet... Oh nein. Nein nein nein—' },
        { char:'system', text: '[AUFNAHME ENDET]' },
        { char:'kim', text: 'Okay. Das war nicht gut. Ich muss den Binary-Code auf dem Monitor entschlüsseln.' },
      ]);
      state.setFlag('read_voicemail');
    } else {
      dialog.show('pete', 'Hinterlass mir 5 Sterne und ich bin gerettet. … Warum hat der das gesagt?');
    }
  });

  engine.addHotspot(justus, 'Mit Justus reden', () => {
    dialog.show('justus', 'Ich hab gelesen, Hacker machen das immer aus purer Langeweile — weil sie zu gut sind und sich langweilen. Das stand jedenfalls in Hackers Weekly.');
  });
}

// ---- Intro dialog ----
export function onEnter(engine) {
  dialog.sequence([
    { char:'system', text: '— 23:04 Uhr. Kims Zimmer. —' },
    { char:'kim', text: 'Okay. Schön normaler Abend. Pixel_Pete streamt, ich schaue zu — und dann friert der Stream ein.' },
    { char:'justus', text: 'Ich sag\'s dir: Das ist wieder die WLAN-Drosselung. Hast du mal den Router neu gestartet?' },
    { char:'kim', text: 'Das ist kein Verbindungsproblem, Justus. Siehst du diese Nullen und Einsen auf dem Bildschirm?' },
    { char:'justus', text: 'Ja? Sieht hübsch aus.' },
      { char:'kim', text: 'Das ist eine Nachricht — in Binary-Code. Jemand, der sich BYTE nennt, hat PETEs Stream übernommen. Ich muss das entschlüsseln.' },
  ]);
}

// ---- Binary Decoder Puzzle ----
// Cipher: "BYTE WAR HIER"
// B=01000010(66) Y=01011001(89) T=01010100(84) E=01000101(69)
// ' '=00100000(32)
// W=01010111(87) A=01000001(65) R=01010010(82)
// ' '=00100000(32)
// H=01001000(72) I=01001001(73) E=01000101(69) R=01010010(82)

const BINARY_BYTES = [
  { bin: '01000010', dec: 66,  chr: 'B' },
  { bin: '01011001', dec: 89,  chr: 'Y' },
  { bin: '01010100', dec: 84,  chr: 'T' },
  { bin: '01000101', dec: 69,  chr: 'E' },
  { bin: '00100000', dec: 32,  chr: ' ', label: '␣' },
  { bin: '01010111', dec: 87,  chr: 'W' },
  { bin: '01000001', dec: 65,  chr: 'A' },
  { bin: '01010010', dec: 82,  chr: 'R' },
  { bin: '00100000', dec: 32,  chr: ' ', label: '␣' },
  { bin: '01001000', dec: 72,  chr: 'H' },
  { bin: '01001001', dec: 73,  chr: 'I' },
  { bin: '01000101', dec: 69,  chr: 'E' },
  { bin: '01010010', dec: 82,  chr: 'R' },
];

function buildBinaryPuzzle(engine, container) {
  return (box) => {

    // Build byte-card table
    const tableHTML = BINARY_BYTES.map((b, i) => `
      <div class="byte-card" id="bc-${i}" style="
        display:inline-flex;flex-direction:column;align-items:center;justify-content:space-between;gap:3px;
        background:rgba(0,20,10,0.7);border:1px solid rgba(0,255,136,0.25);
        border-radius:5px;padding:6px 4px;min-width:68px;min-height:120px;cursor:pointer;
        transition:border-color 0.2s, box-shadow 0.2s;
        ${b.dec === 32 ? 'opacity:0.65;' : ''}
      ">
        <div class="bc-bin" style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;
                  color:var(--neon-green);letter-spacing:0.05em;line-height:1.4;text-align:center;">
          ${b.bin.slice(0,4)}<br>${b.bin.slice(4)}
        </div>
        <button class="bc-btn" data-i="${i}" style="
          font-family:'Orbitron',sans-serif;font-size:0.48rem;padding:2px 6px;
          border:1px solid rgba(0,212,255,0.4);background:rgba(0,212,255,0.07);
          color:var(--neon-blue);cursor:pointer;border-radius:3px;letter-spacing:0.05em;
          transition:background 0.15s;white-space:nowrap;
        ">→ DEZ</button>
        <div class="bc-dec" id="bc-dec-${i}" style="
          font-family:'Share Tech Mono',monospace;font-size:0.75rem;
          color:var(--neon-blue);font-weight:700;min-height:1.1rem;opacity:0;
          transition:opacity 0.3s;
        ">${b.dec}</div>
        <div class="bc-chr" id="bc-chr-${i}" style="
          font-family:'Orbitron',sans-serif;font-size:0.85rem;font-weight:900;
          color:var(--neon-pink);min-height:1.3rem;opacity:0;
          transition:opacity 0.3s;letter-spacing:0.05em;
        ">${b.label || b.chr}</div>
      </div>
    `).join('');

    box.innerHTML = `
      <h2>🔍 BINARY DECODER</h2>
      <p>BYTEs Hackernachricht vom Monitor — 13 Byte, 3 Wörter.<br>
         <strong>Schritt 1:</strong> Klicke auf „→ DEZ" um den Binärwert in eine Dezimalzahl umzurechnen.<br>
         <strong>Schritt 2:</strong> Schlage die Zahl in der ASCII-Tabelle nach → du bekommst den Buchstaben.<br>
         <strong>Schritt 3:</strong> Alle Buchstaben ergeben die versteckte Nachricht.</p>

      <div style="overflow-x:auto;padding-bottom:6px;">
        <div style="display:flex;gap:6px;flex-wrap:nowrap;width:max-content;margin-top:0.6rem;">
          ${tableHTML}
        </div>
      </div>

      <div class="hint" style="margin-top:0.7rem;">
        💡 Wie rechnet man Binär → Dezimal?<br>
        Jede Stelle hat einen Wert (von rechts): 128 · 64 · 32 · 16 · 8 · 4 · 2 · 1<br>
        Beispiel: <strong>01000001</strong> = 0+64+0+0+0+0+0+1 = <strong>65</strong> = A
      </div>

      <div id="ascii-ref" style="margin-top:0.7rem;padding:0.6rem;
           background:rgba(0,10,20,0.6);border:1px solid rgba(0,212,255,0.15);border-radius:4px;">
        <div style="font-family:'Orbitron',sans-serif;font-size:0.55rem;color:var(--neon-blue);
                    margin-bottom:0.4rem;letter-spacing:0.08em;">ASCII-TABELLE (Ausschnitt)</div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:0.62rem;color:var(--text-dim);
                    display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:2px 8px;
                    line-height:1.9;">
          ${[
            [32,'␣ (Leerzeichen)'],[65,'A'],[66,'B'],[67,'C'],[68,'D'],[69,'E'],
            [70,'F'],[71,'G'],[72,'H'],[73,'I'],[74,'J'],[75,'K'],[76,'L'],
            [77,'M'],[78,'N'],[79,'O'],[80,'P'],[81,'Q'],[82,'R'],[83,'S'],
            [84,'T'],[85,'U'],[86,'V'],[87,'W'],[88,'X'],[89,'Y'],[90,'Z'],
          ].map(([n,l]) => `<span><b style="color:var(--neon-blue)">${n}</b> = ${l}</span>`).join('')}
        </div>
      </div>

      <div style="margin-top:1rem;">
        <p style="margin-bottom:0.4rem;">Was steht in der Nachricht?</p>
        <input type="text" class="puzzle-input" id="binary-answer"
               placeholder="z.B. HALLO WELT" autocomplete="off">
        <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
          <button class="puzzle-btn" id="binary-check">▸ ÜBERPRÜFEN</button>
          <button class="puzzle-btn" id="binary-reveal-all" style="opacity:0.6;font-size:0.65rem;">
            👁 ALLE DEZIMALWERTE ZEIGEN
          </button>
        </div>
        <div class="puzzle-feedback" id="binary-feedback"></div>
      </div>
    `;

    // Reveal decimal on button click
    box.querySelectorAll('.bc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const i = +btn.dataset.i;
        const decEl = document.getElementById(`bc-dec-${i}`);
        decEl.style.opacity = '1';
        btn.textContent = '✓';
        btn.style.borderColor = 'var(--neon-green)';
        btn.style.color = 'var(--neon-green)';
        btn.style.background = 'rgba(0,255,136,0.08)';
        document.getElementById(`bc-${i}`).style.borderColor = 'rgba(0,212,255,0.5)';
        document.getElementById(`bc-${i}`).style.boxShadow = '0 0 8px rgba(0,212,255,0.15)';
      });
    });

    // Reveal all decimals (helper for slow starters)
    document.getElementById('binary-reveal-all').addEventListener('click', () => {
      box.querySelectorAll('.bc-btn').forEach(btn => btn.click());
    });

    document.getElementById('binary-check').addEventListener('click', () => {
      const ans = document.getElementById('binary-answer').value.trim().toUpperCase();
      const fb  = document.getElementById('binary-feedback');
      if (ans === 'BYTE WAR HIER' || ans === 'BYTE WAR HIER.') {
        fb.className = 'puzzle-feedback ok';
        fb.textContent = '✓ Richtig! "BYTE WAR HIER" — alle 13 Bytes korrekt entschlüsselt.';
        document.getElementById('binary-check').className = 'puzzle-btn success';
        // Reveal all letters as celebration
        BINARY_BYTES.forEach((_, i) => {
          setTimeout(() => {
            document.getElementById(`bc-dec-${i}`).style.opacity = '1';
            document.getElementById(`bc-chr-${i}`).style.opacity = '1';
          }, i * 80);
        });
        setTimeout(() => {
          engine.closePuzzle();
          engine.notify('📦 ITEM ERHALTEN: BYTEs Visitenkarte');
          inventory.addItem('visitenkarte_byte');
          state.solvedPuzzle('s00_binary');
          dialog.sequence([
            { char:'kim', text: '"BYTE WAR HIER." — Das ist die Nachricht. Jemand nennt sich BYTE und hat PETEs Stream gekapert.' },
            { char:'justus', text: 'Cool. Vielleicht wollte er nur kurz Hallo sagen?' },
            { char:'kim', text: 'Er hat eine Webseite hinterlassen: stream-archiv-pete.local — PETEs eigener Backup-Server. Ich gehe rein.' },
            { char:'justus', text: 'Ich komme mit! Ich habe Takis.', after: () => engine.loadScene('s01_bits') },
          ]);
        }, BINARY_BYTES.length * 80 + 800);
      } else {
        fb.className = 'puzzle-feedback err';
        fb.textContent = '✗ Noch nicht ganz. Rechne jeden Binärblock in eine Zahl um, dann schlag in der ASCII-Tabelle nach.';
      }
    });

    document.getElementById('binary-answer').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('binary-check').click();
    });
  };
}

// ---- Helpers ----
function el(tag, styles = {}) {
  const d = document.createElement(tag);
  d.style.position = styles.position || 'absolute';
  Object.keys(styles).forEach(k => {
    if (k !== 'position') {
      const cssProp = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
      d.style[cssProp] = styles[k];
    }
  });
  return d;
}

function makeFigure(charCss, pos, flip = false) {
  const colors = {
    kim: 'var(--neon-blue)',
    byte: 'var(--neon-pink)',
    justus: 'var(--neon-yellow)',
    brandt: 'var(--neon-purple)',
    aria: 'var(--neon-cyan)',
    pete: 'var(--neon-green)',
  };
  const c = colors[charCss] || 'var(--neon-blue)';
  const d = document.createElement('div');
  d.style.cssText = `
    position:absolute;
    left:${pos.left}; bottom:${pos.bottom};
    display:flex; flex-direction:column; align-items:center;
    transform:${flip ? 'scaleX(-1)' : 'scaleX(1)'};
  `;
  d.innerHTML = `
    <div style="width:clamp(20px,4vw,36px);height:clamp(20px,4vw,36px);border-radius:50%;
                border:2px solid ${c};background:rgba(0,20,40,0.8);
                box-shadow:0 0 10px ${c}66;"></div>
    <div style="width:clamp(16px,3vw,28px);height:clamp(22px,4vw,38px);
                border:2px solid ${c};border-top:none;border-radius:0 0 5px 5px;
                background:rgba(0,20,40,0.6);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:clamp(7px,1.5vw,11px);height:clamp(14px,3vw,24px);
                  border:2px solid ${c};border-top:none;border-radius:0 0 4px 4px;
                  background:rgba(0,20,40,0.5);"></div>
      <div style="width:clamp(7px,1.5vw,11px);height:clamp(14px,3vw,24px);
                  border:2px solid ${c};border-top:none;border-radius:0 0 4px 4px;
                  background:rgba(0,20,40,0.5);"></div>
    </div>
  `;
  return d;
}
