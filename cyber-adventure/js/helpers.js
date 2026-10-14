// ============================================================
// CYBER::ADVENTURES — Scene Helpers (shared across all scenes)
// ============================================================

const CHAR_COLORS = {
  kim:    'var(--neon-blue)',
  byte:   'var(--neon-pink)',
  justus: 'var(--neon-yellow)',
  brandt: 'var(--neon-purple)',
  aria:   'var(--neon-cyan)',
  pete:   'var(--neon-green)',
};

/**
 * Create a positioned div with inline styles.
 * pos/left/top/etc. are passed as camelCase style keys.
 */
export function el(tag, styles = {}) {
  const d = document.createElement(tag);
  d.style.position = styles.position || 'absolute';
  Object.keys(styles).forEach(k => {
    const cssProp = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
    d.style.setProperty(cssProp, styles[k]);
  });
  return d;
}

/**
 * CSS-drawn character figure.
 */
export function makeFigure(charKey, pos, flip = false) {
  const c = CHAR_COLORS[charKey] || 'var(--neon-blue)';
  const d = document.createElement('div');
  d.style.cssText = `
    position:absolute;
    left:${pos.left}; bottom:${pos.bottom || '4%'};
    display:flex; flex-direction:column; align-items:center;
    transform:${flip ? 'scaleX(-1)' : 'scaleX(1)'};
    pointer-events:none;
    z-index:150;
  `;
  d.innerHTML = `
    <div style="width:clamp(18px,3.5vw,34px);height:clamp(18px,3.5vw,34px);border-radius:50%;
                border:2px solid ${c};background:rgba(0,20,40,0.85);
                box-shadow:0 0 10px ${c}55;"></div>
    <div style="width:clamp(14px,2.8vw,26px);height:clamp(20px,3.5vw,36px);
                border:2px solid ${c};border-top:none;border-radius:0 0 5px 5px;
                background:rgba(0,20,40,0.6);"></div>
    <div style="display:flex;gap:3px;">
      <div style="width:clamp(6px,1.2vw,10px);height:clamp(12px,2.5vw,22px);
                  border:2px solid ${c};border-top:none;border-radius:0 0 4px 4px;
                  background:rgba(0,20,40,0.5);"></div>
      <div style="width:clamp(6px,1.2vw,10px);height:clamp(12px,2.5vw,22px);
                  border:2px solid ${c};border-top:none;border-radius:0 0 4px 4px;
                  background:rgba(0,20,40,0.5);"></div>
    </div>
  `;
  // Name label
  if (pos.label) {
    const lbl = document.createElement('div');
    lbl.style.cssText = `font-family:'Orbitron',sans-serif;font-size:0.55rem;
                         color:${c};text-align:center;margin-top:3px;letter-spacing:0.1em;`;
    lbl.textContent = pos.label;
    d.appendChild(lbl);
  }
  return d;
}

/** Floor neon line */
export function makeFloor(container) {
  const f = document.createElement('div');
  f.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:2px;
    background:linear-gradient(90deg,transparent,var(--neon-blue),transparent);
    box-shadow:0 0 12px var(--neon-blue);pointer-events:none;`;
  container.appendChild(f);
}

/** Simple monitor element */
export function makeMonitor(styles, contentHtml, color = 'blue') {
  const colors = { blue:'#00d4ff', green:'#00ff88', pink:'#ff2d78' };
  const c = colors[color] || colors.blue;
  const m = el('div', styles);
  m.style.cssText += `background:#020408;border:2px solid ${c};border-radius:4px;
    box-shadow:0 0 16px ${c}66,inset 0 0 20px rgba(0,20,40,0.8);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    overflow:hidden;`;
  m.innerHTML = contentHtml;
  // Scanlines
  const sl = document.createElement('div');
  sl.style.cssText = `position:absolute;inset:0;
    background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.25) 2px,rgba(0,0,0,0.25) 4px);
    pointer-events:none;border-radius:4px;`;
  m.appendChild(sl);
  return m;
}

/** Neon sign */
export function makeSign(text, color = '#ff2d78') {
  const d = document.createElement('div');
  d.style.cssText = `font-family:'Orbitron',sans-serif;font-weight:900;
    font-size:clamp(0.7rem,2vw,1.2rem);
    color:${color};text-shadow:0 0 10px ${color},0 0 30px ${color}55;
    letter-spacing:0.1em;pointer-events:none;`;
  d.textContent = text;
  return d;
}

/** Server rack decorative element */
export function makeServerRack(styles) {
  const r = el('div', styles);
  r.style.cssText += `background:#0d0d18;border:1px solid #223;border-radius:4px;
    box-shadow:0 0 8px rgba(0,212,255,0.2);overflow:hidden;`;
  // Generate LED rows
  for (let i=0; i<6; i++) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:3px;padding:3px 8px;border-bottom:1px solid #1a1a2a;';
    const cols = ['g','b','g','r','b','g'];
    for (let j=0; j<5; j++) {
      const led = document.createElement('div');
      const col = cols[(i*3+j)%cols.length];
      const colors2 = { g:'#00ff88', b:'#00d4ff', r:'#ff2d78' };
      led.style.cssText = `width:6px;height:6px;border-radius:50%;
        background:${colors2[col]};box-shadow:0 0 4px ${colors2[col]};
        animation:blink ${0.8+Math.random()*2}s infinite;`;
      row.appendChild(led);
    }
    r.appendChild(row);
  }
  return r;
}
