// Crushed, unbranded Michigan returnables, modelled in 3D and rendered as a
// still life. Units are millimetres.
//
// window.renderScene(scene, pass) renders one pass of a composition:
//   'objects' — the cans and bottles, lit, on a transparent background
//   'shadow'  — only the soft shadow they cast on the ground
//   'ids'     — each object in a flat colour of its own (for ink lines
//               where one object overlaps another)
// The finish (paint.cjs) turns these into the drawn look.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ── noise ──────────────────────────────────────────────────────────────
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeNoise(seed) {
  const rnd = mulberry32(seed);
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const grad = (h, x, y, z) => {
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  return (x, y, z) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(p[AA] & 15, x, y, z), grad(p[BA] & 15, x - 1, y, z), u),
        lerp(grad(p[AB] & 15, x, y - 1, z), grad(p[BB] & 15, x - 1, y - 1, z), u), v),
      lerp(lerp(grad(p[AA + 1] & 15, x, y, z - 1), grad(p[BA + 1] & 15, x - 1, y, z - 1), u),
        lerp(grad(p[AB + 1] & 15, x, y - 1, z - 1), grad(p[BB + 1] & 15, x - 1, y - 1, z - 1), u), v),
      w);
  };
}
function ridged(n, x, y, z, octaves = 4, sharp = 2) {
  let sum = 0, amp = 0.55, f = 1;
  for (let i = 0; i < octaves; i++) {
    const v = 1 - Math.abs(n(x * f, y * f, z * f));
    sum += amp * v ** sharp;
    f *= 2.07; amp *= 0.5;
  }
  return sum;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// ── renderer ───────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: true });
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

// ── cans ───────────────────────────────────────────────────────────────
// Real can sizes: radius of the body, height, radius of the neck.
const CAN_SIZES = {
  standard: { R: 33, H: 122, neck: 27.2, vol: '12 FL OZ (355 mL)' },
  tall: { R: 33, H: 168, neck: 27.2, vol: '16 FL OZ (473 mL)' },
  slim: { R: 26.6, H: 134, neck: 25.6, vol: '8.4 FL OZ (250 mL)' },
  mini: { R: 29, H: 103, neck: 25.6, vol: '7.5 FL OZ (222 mL)' },
};

function canProfile(d) {
  const pts = [];
  const push = (r, y) => pts.push(new THREE.Vector2(r, y));
  const top = d.H - 15.4;
  for (let i = 0; i <= 10; i++) { const t = i / 10; push(d.R * 0.712 + d.R * 0.288 * Math.sin(t * Math.PI / 2) ** 1.4, 0.4 + 8 * t ** 1.6); }
  const nWall = Math.round(170 * (top - 8.4) / 98);
  for (let i = 1; i <= nWall; i++) push(d.R, 8.4 + (top - 8.4) * (i / nWall));
  for (let i = 1; i <= 26; i++) { const t = i / 26; push(d.R - (d.R - d.neck) * smooth(0, 1, t), top + 12.4 * t); }
  const n = d.neck;
  push(n + 0.4, d.H - 2.2); push(n + 0.7, d.H - 1.4); push(n + 0.5, d.H - 0.6); push(n - 0.2, d.H - 0.2);
  push(n - 1.0, d.H - 0.4); push(n - 1.6, d.H - 1.2); push(n - 1.8, d.H - 2.2);
  return pts;
}

function labelTexture(cfg, d) {
  const cw = 2048, ch = 1024;
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  const yPx = (mm) => ch * (1 - mm / d.H);
  g.fillStyle = '#c9cdd2'; g.fillRect(0, 0, cw, ch);
  const top = yPx(d.H - 16), bot = yPx(9);
  const grad = g.createLinearGradient(0, top, 0, bot);
  grad.addColorStop(0, cfg.light ?? cfg.color);
  grad.addColorStop(1, cfg.color);
  g.fillStyle = grad; g.fillRect(0, top, cw, bot - top);
  if (cfg.band) {
    const at = d.H - 25;
    g.fillStyle = cfg.band;
    g.fillRect(0, yPx(at) - 18, cw, 18);
    g.fillRect(0, yPx(at - 4) - 6, cw, 6);
  }
  const ink = cfg.ink ?? '#ffffff';
  const circ = 2 * Math.PI * d.R, sx = (ch / d.H) / (cw / circ); // keep text proportions
  g.fillStyle = ink;
  g.save();
  g.scale(sx, 1);
  g.textBaseline = 'middle';
  g.font = '700 34px Helvetica, Arial, sans-serif';
  g.fillText('MI 10¢', (0.43 * cw) / sx, yPx(d.H - 20.5));
  g.font = '600 24px Helvetica, Arial, sans-serif';
  g.fillText(d.vol, (0.5 * cw) / sx, yPx(14));
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function lidTexture() {
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  g.fillStyle = '#d3d6da'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(70,74,80,0.55)'; g.lineWidth = 6;
  g.beginPath(); g.arc(s / 2, s / 2, s * 0.46, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(70,74,80,0.35)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(s / 2, s * 0.30, s * 0.15, s * 0.11, 0, 0, Math.PI * 2); g.stroke();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function tabGeometry(scale) {
  const sh = new THREE.Shape();
  const w = 11 * scale, h = 21 * scale, r = 5 * scale;
  sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  sh.lineTo(w / 2, h / 2 - r); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); sh.lineTo(-w / 2 + r, h / 2);
  sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const hole = new THREE.Path(); hole.absellipse(0, -3.5 * scale, 3.4 * scale, 4.6 * scale, 0, Math.PI * 2, true); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.35, bevelSegments: 2, curveSegments: 18 });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function makeCanCrush(cfg, d) {
  const H = d.H;
  const n = makeNoise(cfg.seed), n2 = makeNoise(cfg.seed + 101);
  const rnd = mulberry32(cfg.seed * 7 + 3);
  const dents = Array.from({ length: cfg.dents ?? 2 }, () => ({
    th: (rnd() - 0.5) * 2.4 + Math.PI, y: H * (0.25 + rnd() * 0.5),
    depth: (cfg.dentDepth ?? 7) * (0.6 + rnd() * 0.6) * (d.R / 33), sth: 0.45 + rnd() * 0.5, sy: 12 + rnd() * 16,
  }));
  const buckle = {
    y: cfg.buckleAt ?? H * (0.47 + rnd() * 0.12), h: cfg.buckleH ?? H * (0.17 + rnd() * 0.06),
    lobes: cfg.lobes ?? 6, amp: (cfg.buckle ?? 5) * (d.R / 33), slope: (rnd() - 0.5) * 16, phi: rnd() * Math.PI * 2,
  };
  const crush = cfg.crush ?? 0.18, twist = cfg.twist ?? 0.25, bend = cfg.bend ?? 0.1;
  const big = (cfg.creases ?? 3.2) * (d.R / 33), oval = cfg.oval ?? 0.08, freq = cfg.freq ?? 0.015;
  return (v) => {
    const r0 = Math.hypot(v.x, v.z);
    let th = Math.atan2(v.x, v.z);
    const y = v.y, t = y / H;
    const wall = smooth(0.05, 0.16, t) * (1 - smooth(0.84, 0.92, t)) * smooth(d.neck * 0.66, d.neck * 1.1, r0);
    let dr = 0;
    for (const dn of dents) {
      const dth = wrap(th - dn.th) / dn.sth, dy = (y - dn.y) / dn.sy;
      dr -= dn.depth * Math.max(0, 1 - Math.sqrt(dth * dth + dy * dy)) ** 0.9;
    }
    const bandY = buckle.y + buckle.slope * Math.cos(th - buckle.phi) + n2(th * 0.8, 3.1, 0) * 4;
    const bv = (y - bandY) / buckle.h;
    if (Math.abs(bv) < 0.75) {
      const row = bv > 0 ? Math.PI / buckle.lobes : 0;
      const lobe = Math.max(0, Math.cos(buckle.lobes * th + row + n2(th, y * 0.05, 1) * 0.9));
      dr -= buckle.amp * lobe ** 0.6 * Math.max(0, 1 - Math.abs(bv) / 0.75) ** 1.1;
    }
    const c = ridged(n, v.x * freq, y * freq * 1.25, v.z * freq, 2, 3.4);
    dr -= big * Math.max(0, c - 0.18) ** 1.05 * 3.6;
    dr += (cfg.fine ?? 0.22) * (ridged(n2, v.x * 0.07, y * 0.09, v.z * 0.07, 2) - 0.45);
    const r = r0 + dr * wall;
    const S = smooth(buckle.y - buckle.h * 0.9, buckle.y + buckle.h * 0.9, y) * 0.75 + smooth(0.1, 0.9, t) * 0.25;
    th += twist * S;
    const x = r * Math.sin(th);
    let z = r * Math.cos(th);
    z *= 1 - oval * wall;
    const yy = y - crush * H * S + n(v.x * 0.03, y * 0.03, v.z * 0.03) * 1.2 * wall;
    const a = bend * S, py = H * 0.42, ry = yy - py;
    v.set(x * Math.cos(a) - ry * Math.sin(a), x * Math.sin(a) + ry * Math.cos(a) + py, z);
  };
}

function deformGeometry(geo, fn) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); fn(v); pos.setXYZ(i, v.x, v.y, v.z); }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}
function fixSeam(geo, segments, nPts) {
  const nrm = geo.attributes.normal;
  for (let j = 0; j < nPts; j++) {
    const a = j, b = segments * nPts + j;
    const x = (nrm.getX(a) + nrm.getX(b)) / 2, y = (nrm.getY(a) + nrm.getY(b)) / 2, z = (nrm.getZ(a) + nrm.getZ(b)) / 2;
    const l = Math.hypot(x, y, z) || 1;
    nrm.setXYZ(a, x / l, y / l, z / l); nrm.setXYZ(b, x / l, y / l, z / l);
  }
  nrm.needsUpdate = true;
}

function buildCan(cfg) {
  const d = CAN_SIZES[cfg.size ?? 'standard'];
  const group = new THREE.Group();
  const crushFn = makeCanCrush(cfg, d);
  const prof = canProfile(d);
  const SEG = 320;
  const body = new THREE.LatheGeometry(prof, SEG);
  const uv = body.attributes.uv, pos = body.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setY(i, pos.getY(i) / d.H);
  deformGeometry(body, crushFn);
  fixSeam(body, SEG, prof.length);
  group.add(new THREE.Mesh(body, new THREE.MeshPhysicalMaterial({
    map: labelTexture(cfg, d), metalness: cfg.metalness ?? 0.82, roughness: cfg.roughness ?? 0.3,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.95, side: THREE.DoubleSide,
  })));
  const silver = new THREE.MeshStandardMaterial({ color: 0xd8dbdf, metalness: 1, roughness: 0.26, envMapIntensity: 1.1 });
  // the domed bottom, so a can lying on its side isn't hollow
  const dome = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; dome.push(new THREE.Vector2(d.R * 0.712 * t, 0.4 + 6.2 * (1 - t * t))); }
  const bottom = new THREE.LatheGeometry(dome, 96);
  deformGeometry(bottom, crushFn);
  group.add(new THREE.Mesh(bottom, new THREE.MeshStandardMaterial({ color: 0xc9cdd2, metalness: 1, roughness: 0.32, envMapIntensity: 1.0, side: THREE.DoubleSide })));
  const lidY = d.H - 2.2;
  const lid = new THREE.CircleGeometry(d.neck - 1.7, 96);
  lid.rotateX(-Math.PI / 2); lid.translate(0, lidY, 0);
  deformGeometry(lid, crushFn);
  group.add(new THREE.Mesh(lid, new THREE.MeshStandardMaterial({ map: lidTexture(), metalness: 1, roughness: 0.3, envMapIntensity: 1.1 })));
  const ts = d.neck / 27.2;
  const tab = tabGeometry(ts); tab.translate(0, lidY + 0.3, 4.5 * ts);
  deformGeometry(tab, crushFn);
  group.add(new THREE.Mesh(tab, silver));
  const rivet = new THREE.CylinderGeometry(1.6 * ts, 1.8 * ts, 1.1, 24); rivet.translate(0, lidY + 0.6, 0);
  deformGeometry(rivet, crushFn);
  group.add(new THREE.Mesh(rivet, silver));
  group.rotation.y = Math.PI + (cfg.turn ?? 0);
  return group;
}

// ── bottles ────────────────────────────────────────────────────────────
// A 20 oz pop bottle: Michigan's deposit covers carbonated drinks, not still
// water, so the bottle is a pop bottle.
const BOT_H = 206;
function bottleProfile() {
  const pts = [];
  const push = (r, y) => pts.push(new THREE.Vector2(r, y));
  push(0, 2.6); push(6, 0.2); push(16, 0.4); push(24, 1.2); push(29.5, 3.2); push(32.6, 7); push(33.8, 11.5);
  for (let i = 1; i <= 110; i++) push(34, 11.5 + (118 - 11.5) * (i / 110));
  for (let i = 1; i <= 16; i++) { const t = i / 16; push(34 - 2.3 * Math.sin(t * Math.PI), 118 + 16 * t); }
  for (let i = 1; i <= 10; i++) push(34, 134 + 13 * (i / 10));
  for (let i = 1; i <= 40; i++) { const t = i / 40; push(12.8 + 21.2 * Math.cos(t * Math.PI / 2) ** 1.25, 147 + 45 * t); }
  push(12.8, 196); push(12.8, 199.6); push(16.6, 200.1); push(16.8, 201.4); push(12.9, 202); push(12.8, 205.6);
  push(11.4, 206); push(10.4, 205.2);
  return pts;
}
function makeBottleCrush(cfg) {
  const n = makeNoise(cfg.seed), n2 = makeNoise(cfg.seed + 101);
  const rnd = mulberry32(cfg.seed * 13 + 5);
  const dents = Array.from({ length: cfg.dents ?? 3 }, () => ({
    th: (rnd() - 0.5) * 2.6 + Math.PI, y: 25 + rnd() * 110,
    depth: (cfg.dentDepth ?? 9) * (0.6 + rnd() * 0.6), sth: 0.5 + rnd() * 0.6, sy: 14 + rnd() * 22,
  }));
  const crush = cfg.crush ?? 0.05, twist = cfg.twist ?? 0.25, bend = cfg.bend ?? 0.04;
  const flat = cfg.flat ?? 0.32, big = cfg.creases ?? 3.4, freq = cfg.freq ?? 0.016;
  return (v) => {
    const r0 = Math.hypot(v.x, v.z);
    let th = Math.atan2(v.x, v.z);
    const y = v.y;
    const wall = smooth(8, 20, y) * (1 - smooth(140, 158, y)) * smooth(18, 30, r0);
    let dr = 0;
    for (const dn of dents) {
      const dth = wrap(th - dn.th) / dn.sth, dy = (y - dn.y) / dn.sy;
      dr -= dn.depth * Math.max(0, 1 - Math.sqrt(dth * dth + dy * dy)) ** 0.9;
    }
    const c = ridged(n, v.x * freq, y * freq * 1.1, v.z * freq, 2, 3.4);
    dr -= big * Math.max(0, c - 0.18) ** 1.05 * 3.6;
    dr += 0.25 * (ridged(n2, v.x * 0.07, y * 0.08, v.z * 0.07, 2) - 0.45);
    const r = r0 + dr * wall;
    const S = smooth(10, 150, y);
    th += twist * S;
    let x = r * Math.sin(th), z = r * Math.cos(th);
    z *= 1 - flat * wall;
    x *= 1 + flat * 0.28 * wall;
    const yy = y - crush * BOT_H * S;
    const a = bend * S, py = 70, ry = yy - py;
    v.set(x * Math.cos(a) - ry * Math.sin(a), x * Math.sin(a) + ry * Math.cos(a) + py, z);
  };
}
function bottleLabel(cfg) {
  const cw = 2048, ch = 512, c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, cfg.light ?? cfg.color); grad.addColorStop(1, cfg.color);
  g.fillStyle = grad; g.fillRect(0, 0, cw, ch);
  if (cfg.band) { g.fillStyle = cfg.band; g.fillRect(0, ch * 0.16, cw, 16); g.fillRect(0, ch * 0.8, cw, 10); }
  g.fillStyle = cfg.ink ?? '#ffffff';
  g.textBaseline = 'middle';
  g.font = '700 40px Helvetica, Arial, sans-serif';
  g.fillText('MI 10¢', cw * 0.44, ch * 0.34);
  g.font = '600 26px Helvetica, Arial, sans-serif';
  g.fillText('20 FL OZ (591 mL)', cw * 0.5, ch * 0.66);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return tex;
}
function plasticMaterial(tint) {
  const m = new THREE.MeshPhysicalMaterial({
    color: tint, metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04,
    transparent: true, premultipliedAlpha: true, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.9,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTint = { value: new THREE.Color(tint) };
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform vec3 uTint;\nvoid main() {')
      .replace('#include <opaque_fragment>', `
        vec3 specAll = totalSpecular;
        #ifdef USE_CLEARCOAT
          specAll += ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
        #endif
        float fres = pow( 1.0 - clamp( abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), 0.0, 1.0 ), 1.7 );
        float baseA = mix( 0.09, 0.66, fres );
        float specL = clamp( max( max( specAll.r, specAll.g ), specAll.b ), 0.0, 1.0 );
        float aOut = clamp( baseA + specL, 0.0, 1.0 );
        gl_FragColor = vec4( ( uTint * 0.42 * baseA + specAll * 1.25 ) / max( aOut, 0.001 ), aOut );
      `);
  };
  return m;
}
function buildBottle(cfg) {
  const group = new THREE.Group();
  const crushFn = makeBottleCrush(cfg);
  const prof = bottleProfile();
  const SEG = 280;
  const body = new THREE.LatheGeometry(prof, SEG);
  deformGeometry(body, crushFn);
  fixSeam(body, SEG, prof.length);
  const bodyMesh = new THREE.Mesh(body, plasticMaterial(cfg.tint ?? '#dfe9ef'));
  bodyMesh.userData.plastic = true;
  group.add(bodyMesh);
  const sleeve = new THREE.CylinderGeometry(34.35, 34.35, 54, SEG, 80, true);
  sleeve.translate(0, 89, 0);
  deformGeometry(sleeve, crushFn);
  group.add(new THREE.Mesh(sleeve, new THREE.MeshPhysicalMaterial({
    map: bottleLabel(cfg), roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2, side: THREE.DoubleSide, envMapIntensity: 1.0,
  })));
  const cap = new THREE.CylinderGeometry(14.2, 14.6, 16, 180, 6, false);
  cap.translate(0, 213.8, 0);
  const cp = cap.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < cp.count; i++) {
    v.fromBufferAttribute(cp, i);
    if (Math.hypot(v.x, v.z) > 13 && v.y < 221.5) { const k = 1 + 0.018 * Math.cos(Math.atan2(v.x, v.z) * 64); cp.setXYZ(i, v.x * k, v.y, v.z * k); }
  }
  deformGeometry(cap, crushFn);
  group.add(new THREE.Mesh(cap, new THREE.MeshPhysicalMaterial({ color: cfg.cap ?? '#c62828', roughness: 0.38, clearcoat: 0.5, envMapIntensity: 1.0 })));
  group.rotation.y = Math.PI + (cfg.turn ?? 0);
  return group;
}

// ── composition ────────────────────────────────────────────────────────
// Each item: { kind, ...looks, at: [x, z], yaw, lean, lie }. "lie" lays it
// on its side; yaw turns it about the vertical; items rest on the ground.
function placeItem(it) {
  const inner = it.kind === 'bottle' ? buildBottle(it) : buildCan(it);
  const tilt = new THREE.Group();
  tilt.add(inner);
  tilt.rotation.z = it.lie ? Math.PI / 2 : THREE.MathUtils.degToRad(it.lean ?? 0);
  const outer = new THREE.Group();
  outer.add(tilt);
  outer.rotation.y = THREE.MathUtils.degToRad(it.yaw ?? 0);
  outer.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(outer);
  outer.position.set(it.at[0] - (box.min.x + box.max.x) / 2, -box.min.y, it.at[1] - (box.min.z + box.max.z) / 2);
  return outer;
}

window.renderScene = (sc, pass = 'objects') => {
  renderer.setSize(sc.w, sc.h);
  const scene = new THREE.Scene();
  scene.environment = pass === 'ids' ? null : envTex;
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(-320, 700, 420);
  key.castShadow = pass === 'shadow';
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 10, far: 3000 });
  key.shadow.radius = 18; key.shadow.blurSamples = 24; key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff4e6, 0.6);
  rim.position.set(260, 160, -160);
  scene.add(rim);

  const items = sc.items.map(placeItem);
  items.forEach((obj, i) => {
    obj.traverse((m) => {
      if (!m.isMesh) return;
      m.castShadow = true;
      if (pass === 'shadow') { m.material.colorWrite = false; m.material.depthWrite = false; }
      if (pass === 'ids') {
        m.material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL((i * 0.137) % 1, 0.9, 0.5), toneMapped: false, side: THREE.DoubleSide });
      }
    });
    scene.add(obj);
  });
  if (pass === 'shadow') {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({ opacity: 0.32 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  const elev = THREE.MathUtils.degToRad(sc.elev ?? 14);
  const [tx, ty, tz] = sc.target;
  // ortho: one fixed pixels-per-millimetre for every render, so single
  // objects drawn separately keep their real sizes relative to each other
  const cam = sc.ortho
    ? new THREE.OrthographicCamera(-sc.w / sc.pxPerMm / 2, sc.w / sc.pxPerMm / 2, sc.h / sc.pxPerMm / 2, -sc.h / sc.pxPerMm / 2, 10, 8000)
    : new THREE.PerspectiveCamera(sc.fov ?? 24, sc.w / sc.h, 10, 8000);
  cam.position.set(tx, ty + Math.sin(elev) * (sc.dist ?? 1500), tz + Math.cos(elev) * (sc.dist ?? 1500));
  cam.lookAt(tx, ty, tz);
  renderer.toneMapping = pass === 'ids' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL('image/png');
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } });
  return url;
};
window.__ready = true;
