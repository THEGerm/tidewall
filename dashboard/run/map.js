// The risograph city map (docs/dashboard.md, "The map", step D2b).
// Tidewall printed in four inks, the way the Ancient Egypt poster is printed
// (AI-Chart Projects/GERM-ART-0016, Germ's own work, MIT): the scene is drawn
// as coverage into offscreen separations, each ink gets its own halftone screen
// with press defects, and the inks multiply onto cream paper.
//
//   const map = TidewallMap.mount(el, { seed: "run-id", onDistrict: (name) => {} });
//   map.update(state);        // re-prints the sheet for that day
//   map.highlight(["Port"]);  // ring districts; [] clears
//   map.destroy();
//
// state = { day, open, nature, events, turf, prison, treasury, live }.
// No libraries, images, fonts or network. All randomness is seeded from the
// seed string (the city) plus the day (the events and the press), so a day
// always prints the same.

(function () {
  "use strict";

  /* ---------- press: inks, paper, seeded randomness, noise ---------- */

  const TAU = Math.PI * 2, D2R = Math.PI / 180, C30 = Math.cos(Math.PI / 6);
  // a = screen angle (deg), o = misregistration of the drum (sheet units)
  const INKS = [
    { n: "Lapis", c: [33, 50, 122], a: 45, o: [0, 0] },
    { n: "Carnelian", c: [217, 71, 46], a: 75, o: [1.1, -0.7] },
    { n: "Ochre", c: [240, 178, 50], a: 0, o: [-0.8, 1.0] },
    { n: "Turquoise", c: [24, 160, 156], a: 15, o: [0.7, 1.15] },
  ];
  const PAPER = [246, 237, 215];
  const CELL = 2.6; // halftone cell, sheet units
  const ABS = INKS.map((k) => k.c.map((v) => 1 - v / 255));
  const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif';
  const DISTRICTS = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"];
  const FAM = new Set(["Port", "Hightown", "Old Quarter"]);

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash3(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return h >>> 0;
  }
  function strHash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Tileable value noise, 256 x 256, 0..1: paper grain, ink density, dropout.
  const NS = 256, NM = 255, NZ = new Float32Array(NS * NS);
  (function () {
    const r = mulberry(1979);
    const oct = [[64, 0.34], [32, 0.24], [16, 0.17], [8, 0.12], [4, 0.08], [2, 0.05]];
    for (const [P, w] of oct) {
      const L = NS / P, g = new Float32Array(L * L);
      for (let i = 0; i < g.length; i++) g[i] = r();
      for (let y = 0; y < NS; y++) {
        const gy = y / P, y0 = Math.floor(gy), fy = gy - y0, sy = fy * fy * (3 - 2 * fy);
        for (let x = 0; x < NS; x++) {
          const gx = x / P, x0 = Math.floor(gx), fx = gx - x0, sx = fx * fx * (3 - 2 * fx);
          const a = g[(y0 % L) * L + (x0 % L)], b = g[(y0 % L) * L + ((x0 + 1) % L)];
          const c = g[((y0 + 1) % L) * L + (x0 % L)], d = g[((y0 + 1) % L) * L + ((x0 + 1) % L)];
          NZ[y * NS + x] += w * (a + (b - a) * sx + (c + (d - c) * sx - a - (b - a) * sx) * sy);
        }
      }
    }
    let lo = 1e9, hi = -1e9;
    for (const v of NZ) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    for (let i = 0; i < NZ.length; i++) NZ[i] = (NZ[i] - lo) / (hi - lo);
  })();
  function nz(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const x0 = xi & NM, y0 = yi & NM, x1 = (x0 + 1) & NM, y1 = (y0 + 1) & NM;
    const a = NZ[y0 * NS + x0], b = NZ[y0 * NS + x1], c = NZ[y1 * NS + x0], d = NZ[y1 * NS + x1];
    const t = a + (b - a) * fx;
    return t + (c + (d - c) * fx - t) * fy;
  }
  const COS = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) COS[i] = Math.cos((i / 1024) * TAU);

  // Separations to planes. A.rgb = Lapis, Carnelian, Ochre coverage; B.r = Turquoise.
  // Writes five RGBA planes: paper (grained cream) and one per ink (white where
  // there is no ink), so the inks can multiply at their own offsets later.
  function screen(A, B, w, h, x0, y0, p, out) {
    const inv = 1 / p, cpx = CELL * p;
    const dm = cpx < 1.8 ? 0 : cpx > 3.6 ? 1 : (cpx - 1.8) / 1.8; // dots vs averaged tone
    const K = Math.max(1, cpx * 0.6); // dot edge sharpness
    const ca = [], sa = [];
    for (let k = 0; k < 4; k++) { const a = INKS[k].a * D2R; ca[k] = Math.cos(a) / CELL; sa[k] = Math.sin(a) / CELL; }
    const paper = out[0];
    for (let k = 1; k < 5; k++) out[k].fill(0xffffffff);
    for (let j = 0; j < h; j++) {
      const wy = y0 + (j + 0.5) * inv;
      for (let i = 0; i < w; i++) {
        const wx = x0 + (i + 0.5) * inv, q = j * w + i, q4 = q * 4;
        const pg = 0.94 + 0.06 * nz(wx * 1.9, wy * 1.9);
        paper[q] = 0xff000000 | (((PAPER[2] * pg) | 0) << 16) | (((PAPER[1] * pg) | 0) << 8) | ((PAPER[0] * pg) | 0);
        let n1 = -1, n2 = 0;
        for (let k = 0; k < 4; k++) {
          let c = k < 3 ? A[q4 + k] : B[q4];
          if (c < 3) continue;
          if (n1 < 0) { n1 = nz(wx * 0.045, wy * 0.045); n2 = 1 - nz(wy * 0.045 + 61, wx * 0.045 + 23); }
          c /= 255;
          const solid = c > 0.95;
          // uneven ink laydown across the drum
          c *= 0.88 + 0.22 * (k === 0 ? n1 : k === 1 ? n2 : k === 2 ? 1 - n1 : 1 - n2);
          let cc = c;
          if (dm > 0) {
            const u = wx * ca[k] + wy * sa[k], v = wy * ca[k] - wx * sa[k];
            const iu = Math.floor(u + 0.5), iv = Math.floor(v + 0.5);
            const hh = hash3(iu, iv, k);
            const fu = u - iu - ((hh & 255) / 255 - 0.5) * 0.18;
            const fv = v - iv - (((hh >>> 8) & 255) / 255 - 0.5) * 0.18;
            const s = 0.5 + 0.25 * (COS[((fu * 1024) | 0) & 1023] + COS[((fv * 1024) | 0) & 1023]);
            const cj = c * (1 + (((hh >>> 16) & 255) / 255 - 0.5) * 0.16) * 1.1 - 0.035;
            let d = (cj - (1 - s)) * K + 0.5;
            d = d < 0 ? 0 : d > 1 ? 1 : d;
            if (solid) d = 1;
            cc = c + (d - c) * dm;
          }
          if (c > 0.6) { // dropout: the drum starves in big solids
            const qn = nz(wx * 0.5 + k * 97, wy * 0.5 + k * 13) * 0.55 + nz(wx * 2.4 + k * 7, wy * 2.4 + k * 41) * 0.45;
            const lim = (0.36 * (c - 0.6)) / 0.4;
            if (qn < lim) cc *= 0.15 + 0.85 * (qn / lim) * (qn / lim);
          }
          if (cc <= 0) continue;
          if (cc > 1) cc = 1;
          const a = ABS[k];
          out[k + 1][q] = 0xff000000 | (((255 * (1 - cc * a[2])) | 0) << 16) | (((255 * (1 - cc * a[1])) | 0) << 8) | ((255 * (1 - cc * a[0])) | 0);
        }
      }
    }
  }

  /* ---------- pen: a display list of inked polygons, with a hand wobble ---------- */

  const LINE = [1, 0, 0, 0];
  const INKCACHE = new Map();
  function inkS(i, ko) {
    const key = i[0].toFixed(3) + i[1].toFixed(3) + i[2].toFixed(3) + i[3].toFixed(3) + (ko ? "k" : "o");
    let v = INKCACHE.get(key);
    if (!v) {
      const A = "rgb(" + ((i[0] * 255) | 0) + "," + ((i[1] * 255) | 0) + "," + ((i[2] * 255) | 0) + ")";
      const B = ko || i[3] > 0 ? "rgb(" + ((i[3] * 255) | 0) + ",0,0)" : null;
      v = [A, B];
      INKCACHE.set(key, v);
    }
    return v;
  }
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  function shd(i, a, warm) { // darken with lapis (and a little carnelian if warm)
    const w = warm == null ? 0.25 : warm;
    return [cl(i[0] + a), cl(i[1] + a * w), i[2], i[3]];
  }
  const tint = (i, s) => [i[0] * s, i[1] * s, i[2] * s, i[3] * s];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];

  class Pen {
    constructor(seed) { this.ops = []; this.seed = seed; this.n = 0; this.grey = null; }
    wr() { return mulberry(hash3(this.seed, this.n++, 7919)); }
    push(pts, ink, ko) {
      if (this.grey) ink = this.grey(ink);
      if (!ko && ink[0] + ink[1] + ink[2] + ink[3] <= 0) return;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i], y = pts[i + 1];
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      const s = inkS(ink, ko);
      this.ops.push({ p: pts, a: s[0], b: s[1], ko: !!ko, x0, y0, x1, y1, path: null });
    }
    // closed filled polygon; o: {ko, wob, line, li}
    poly(pts, ink, o) {
      o = o || {};
      const r = this.wr();
      const amp = o.wob == null ? 0.35 : o.wob;
      const q = amp > 0 ? wobble(pts, true, amp, r, o.step || 4) : pts;
      this.push(q, ink, o.ko !== false);
      if (o.line) this.outline(pts, o.line, o.li || LINE);
    }
    // tapered, wobbling stroke along an open polyline
    stroke(pts, w, ink, o) {
      o = o || {};
      if (pts.length < 4) return;
      const r = this.wr();
      const amp = o.wob == null ? 0.42 : o.wob;
      const ext = o.ext == null ? 0.5 : o.ext;
      const P = pts.slice();
      if (ext > 0) { // hand overshoot
        const n = P.length;
        let dx = P[0] - P[2], dy = P[1] - P[3], l = Math.hypot(dx, dy) || 1, e = ext * r() * w;
        P[0] += (dx / l) * e; P[1] += (dy / l) * e;
        dx = P[n - 2] - P[n - 4]; dy = P[n - 1] - P[n - 3]; l = Math.hypot(dx, dy) || 1; e = ext * r() * w;
        P[n - 2] += (dx / l) * e; P[n - 1] += (dy / l) * e;
      }
      const L = plen(P, false);
      if (L < 0.01) return;
      const S = resample(P, false, Math.max(0.6, Math.min(3.2, L / 10)));
      const N = S.length / 2;
      const f1 = 0.06 + r() * 0.07, f2 = 0.17 + r() * 0.12, f3 = 0.05 + r() * 0.08;
      const p1 = r() * TAU, p2 = r() * TAU, p3 = r() * TAU;
      const poly = new Float32Array(N * 4);
      const taper = o.taper !== false, tmin = o.tmin == null ? 0.18 : o.tmin;
      let s = 0;
      for (let i = 0; i < N; i++) {
        const ia = Math.max(0, i - 1), ib = Math.min(N - 1, i + 1);
        let tx = S[ib * 2] - S[ia * 2], ty = S[ib * 2 + 1] - S[ia * 2 + 1];
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        if (i > 0) s += Math.hypot(S[i * 2] - S[i * 2 - 2], S[i * 2 + 1] - S[i * 2 - 1]);
        const t = N > 1 ? i / (N - 1) : 0.5;
        let tw = 1;
        if (taper) tw = tmin + (1 - tmin) * Math.pow(Math.min(1, t / 0.24), 0.6) * Math.pow(Math.min(1, (1 - t) / 0.24), 0.6);
        const hw = w * 0.5 * tw * (1 + 0.2 * Math.sin(s * f3 + p3));
        const off = amp * (0.65 * Math.sin(s * f1 + p1) + 0.35 * Math.sin(s * f2 + p2));
        const cx = S[i * 2] - ty * off, cy = S[i * 2 + 1] + tx * off;
        poly[i * 2] = cx - ty * hw; poly[i * 2 + 1] = cy + tx * hw;
        const k = (2 * N - 1 - i) * 2;
        poly[k] = cx + ty * hw; poly[k + 1] = cy - tx * hw;
      }
      this.push(poly, ink || LINE, !!o.ko);
    }
    // hand-drawn outline of a closed polygon: a few overlapping tapered strokes
    outline(pts, w, ink) {
      const n = pts.length / 2;
      if (n > 8) {
        const L = plen(pts, true);
        const k = Math.max(2, Math.min(4, Math.round(L / 60)));
        const S = resample(pts, true, Math.max(1, L / 64));
        const M = S.length / 2;
        for (let c = 0; c < k; c++) {
          const a = Math.floor((c * M) / k), b = Math.floor(((c + 1) * M) / k) + 2;
          const seg = [];
          for (let i = a; i <= b; i++) { const j = i % M; seg.push(S[j * 2], S[j * 2 + 1]); }
          this.stroke(seg, w, ink, { ext: 0.3 });
        }
      } else {
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          this.stroke([pts[i * 2], pts[i * 2 + 1], pts[j * 2], pts[j * 2 + 1]], w, ink, { ext: 0.9 });
        }
      }
    }
    ell(cx, cy, rx, ry, ink, o) { this.poly(ellipse(cx, cy, rx, ry, 0, Math.max(10, Math.min(40, ((rx + ry) * 0.8) | 0))), ink, o); }
    dot(cx, cy, r, ink, ko) { this.push(ellipse(cx, cy, r, r, 0, 8), ink, !!ko); }
    // stepped halftone light: concentric overprinted rings, ink steps up toward the source
    rings(cx, cy, r0, r1, n, ink, sy) {
      sy = sy || 1;
      for (let i = 0; i < n; i++) {
        const rr = r1 - ((r1 - r0) * i) / (n - 1 || 1);
        this.poly(ellipse(cx, cy, rr, rr * sy, 0, 40), ink, { ko: false, wob: 0.6 });
      }
    }
    // text in one ink, knocked out of the inks under it
    text(str, x, y, size, ink, o) {
      o = o || {};
      const font = (o.italic ? "italic " : "") + (o.bold ? "600 " : "") + size + "px " + SERIF;
      const w = textW(str, font), al = o.align || "center";
      const x0 = al === "center" ? x - w / 2 : al === "right" ? x - w : x;
      const s = inkS(ink, true);
      this.ops.push({ t: str, x, y, size, font, al, a: s[0], b: s[1], ko: true, x0, y0: y - size, x1: x0 + w, y1: y + size * 0.3 });
    }
  }

  let MC = null;
  function textW(str, font) {
    if (!MC) MC = document.createElement("canvas").getContext("2d");
    MC.font = font;
    return MC.measureText(str).width;
  }
  function plen(P, closed) {
    let L = 0;
    for (let i = 2; i < P.length; i += 2) L += Math.hypot(P[i] - P[i - 2], P[i + 1] - P[i - 1]);
    if (closed) L += Math.hypot(P[0] - P[P.length - 2], P[1] - P[P.length - 1]);
    return L;
  }
  function resample(P, closed, step) {
    const out = [];
    const n = P.length / 2, segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const ax = P[i * 2], ay = P[i * 2 + 1], j = (i + 1) % n, bx = P[j * 2], by = P[j * 2 + 1];
      const l = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.ceil(l / step));
      for (let s = 0; s < k; s++) out.push(ax + ((bx - ax) * s) / k, ay + ((by - ay) * s) / k);
    }
    if (!closed) out.push(P[P.length - 2], P[P.length - 1]);
    return out;
  }
  function wobble(P, closed, amp, r, step) {
    const S = resample(P, closed, step);
    const N = S.length / 2;
    const f1 = 0.05 + r() * 0.06, f2 = 0.15 + r() * 0.1, p1 = r() * TAU, p2 = r() * TAU;
    const out = new Float32Array(S.length);
    let s = 0;
    for (let i = 0; i < N; i++) {
      const ia = (i - 1 + N) % N, ib = (i + 1) % N;
      let tx = S[ib * 2] - S[ia * 2], ty = S[ib * 2 + 1] - S[ia * 2 + 1];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      if (i > 0) s += Math.hypot(S[i * 2] - S[i * 2 - 2], S[i * 2 + 1] - S[i * 2 - 1]);
      const off = amp * (0.7 * Math.sin(s * f1 + p1) + 0.3 * Math.sin(s * f2 + p2));
      out[i * 2] = S[i * 2] - ty * off; out[i * 2 + 1] = S[i * 2 + 1] + tx * off;
    }
    return out;
  }
  function ellipse(cx, cy, rx, ry, rot, n) {
    n = n || 24;
    const c = Math.cos(rot), s = Math.sin(rot), out = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      out[i * 2] = cx + x * c - y * s; out[i * 2 + 1] = cy + x * s + y * c;
    }
    return out;
  }
  // Catmull-Rom through flat points
  function spline(P, closed, k) {
    k = k || 4;
    const n = P.length / 2, out = [];
    const g = (i) => (closed ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i)));
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
      for (let s = 0; s < k; s++) {
        const t = s / k, t2 = t * t, t3 = t2 * t;
        for (let e = 0; e < 2; e++) {
          const p0 = P[a * 2 + e], p1 = P[b * 2 + e], p2 = P[c * 2 + e], p3 = P[d * 2 + e];
          out.push(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3));
        }
      }
    }
    if (!closed) out.push(P[P.length - 2], P[P.length - 1]);
    return out;
  }

  /* ---------- the island: ground plan, iso projection, inks ---------- */

  // Ground units. x runs down-right on the sheet, y down-left, z up.
  // The island is 0..450 square, the sea 540 square around it. The harbour cuts
  // in from the front corner. Families hold the right half (x > y), Saltdogs the left.
  const LAND = 16, OX = 600, OY = 150, SC = 1.2;
  const q = (x, y, z) => [OX + (x - y) * C30 * SC, OY + ((x + y) * 0.5 - (z || 0)) * SC];
  function qp(L, z) {
    const o = [];
    for (const p of L) { const s = q(p[0], p[1], p.length > 2 ? p[2] : z || 0); o.push(s[0], s[1]); }
    return o;
  }
  const rect = (x, y, dx, dy) => [[x, y], [x + dx, y], [x + dx, y + dy], [x, y + dy]];

  const POLY = {
    Port: [[200, 110], [450, 110], [450, 380], [400, 380], [400, 200], [200, 200]],
    Hightown: rect(280, 0, 170, 110),
    "Old Quarter": rect(110, 0, 170, 110),
    Lowtown: rect(0, 110, 110, 170),
    Market: rect(0, 280, 110, 170),
    Seawall: [[110, 200], [200, 200], [200, 400], [380, 400], [380, 450], [110, 450]],
  };
  const PRISON = rect(0, 0, 110, 110), COUNCIL = rect(110, 110, 90, 90);
  const WATER = [[200, 200], [400, 200], [400, 380], [450, 380], [450, 450], [380, 450], [380, 400], [200, 400]];
  const ANCHOR = { Port: [320, 152], Hightown: [366, 52], "Old Quarter": [196, 54], Lowtown: [54, 196], Market: [54, 366], Seawall: [152, 320], prison: [50, 50], council: [155, 155] };
  // labels sit out on the sea, with a leader to the shore
  const LABEL = {
    "Old Quarter": [[196, -30], [196, 0]], Hightown: [[478, 30], [450, 50]], Port: [[480, 250], [450, 250]],
    Lowtown: [[-30, 196], [0, 196]], Market: [[30, 478], [50, 450]], Seawall: [[250, 480], [250, 450]],
  };

  const K = {
    sea: [0.3, 0, 0, 0.6], seaD: [0.62, 0, 0, 0.72], bed: [0.12, 0.12, 0.45, 0.06], wave: [0.55, 0, 0, 0.25],
    stone: [0.3, 0.14, 0.2, 0.06], stoneD: [0.45, 0.2, 0.2, 0.08], wall: [0.38, 0.06, 0.1, 0.12],
    street: [0.03, 0.06, 0.2, 0], plaza: [0.02, 0.03, 0.12, 0],
    civ: [0.04, 0.03, 0.1, 0.02], civRoof: [0.55, 0.04, 0.04, 0.14],
    green: [0.1, 0, 0.55, 0.62], greenD: [0.3, 0, 0.5, 0.65], wood: [0.25, 0.45, 0.6, 0],
    win: [0.66, 0.2, 0.1, 0.12], lit: [0, 0.14, 0.85, 0], lamp: [0, 0.03, 0.13, 0],
    fam: [0.05, 0.9, 0.2, 0], salt: [0.12, 0, 0.05, 0.9],
  };
  function palette(d) {
    if (FAM.has(d)) return { wall: [0.04, 0.4, 0.3, 0], wall2: [0.02, 0.22, 0.38, 0], roof: [0.14, 0.82, 0.42, 0], roof2: [0.32, 0.6, 0.18, 0], ground: [0.02, 0.13, 0.22, 0] };
    return { wall: [0.05, 0.03, 0.18, 0.3], wall2: [0.02, 0.02, 0.3, 0.12], roof: [0.2, 0, 0.04, 0.76], roof2: [0.42, 0, 0, 0.5], ground: [0.03, 0, 0.12, 0.16] };
  }
  // a closed district prints in a cold lapis grey
  const GREY = (i) => { const l = i[0] + 0.55 * (i[1] + i[2] + i[3]); return l <= 0 ? i : [cl(0.16 + l * 0.62), i[1] * 0.1, i[2] * 0.1, i[3] * 0.1]; };

  // A vertical prism over a convex ground polygon: sides that face the viewer, lit top, key lines.
  function prism(P, poly, z0, z1, ink, o) {
    o = o || {};
    const n = poly.length, lw = o.lw == null ? 0.7 : o.lw, li = o.li || LINE, wob = o.wob == null ? 0.25 : o.wob;
    let cx = 0, cy = 0;
    for (const p of poly) { cx += p[0]; cy += p[1]; }
    cx /= n; cy /= n;
    const vis = [];
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n];
      let nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      if (nx + ny > 0.02) vis.push([i, (i + 1) % n, (nx - ny + 1) / 2]);
    }
    for (const [i, j, t] of vis) {
      const a = poly[i], b = poly[j];
      P.poly(qp([[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]]), o.side ? o.side(t) : shd(ink, 0.07 + 0.17 * t), { wob });
    }
    if (!o.noTop) P.poly(qp(poly, z1), o.top || ink, { wob });
    if (lw > 0) {
      if (!o.noTop) P.outline(qp(poly, z1), lw, li);
      const vert = new Set();
      for (const [i, j] of vis) {
        const a = poly[i], b = poly[j];
        P.stroke(qp([[a[0], a[1], z0], [b[0], b[1], z0]]), lw, li);
        vert.add(i); vert.add(j);
      }
      for (const i of vert) P.stroke(qp([[poly[i][0], poly[i][1], z0], [poly[i][0], poly[i][1], z1]]), lw * 0.85, li);
    }
  }
  const box = (P, x, y, dx, dy, z0, h, ink, o) => prism(P, rect(x, y, dx, dy), z0, z0 + h, ink, o);
  const ngon = (cx, cy, r, n, a0) => { const o = []; for (let i = 0; i < n; i++) { const a = (a0 || 0) + (i / n) * TAU; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  // a rotated ground polygon from local (u along heading, v across)
  const rot = (cx, cy, ang, L) => { const c = Math.cos(ang), s = Math.sin(ang); return L.map(([u, v]) => [cx + u * c - v * s, cy + u * s + v * c]); };

  // gable roof over a box top; ax = ridge direction
  function gable(P, x, y, dx, dy, z, h, ax, roof, wall) {
    const e = 1.2;
    if (ax === "x") {
      const ym = y + dy / 2;
      P.poly(qp([[x - e, y - e, z], [x + dx + e, y - e, z], [x + dx + e, ym, z + h], [x - e, ym, z + h]]), tint(roof, 0.8), { wob: 0.2 });
      const front = qp([[x - e, y + dy + e, z], [x + dx + e, y + dy + e, z], [x + dx + e, ym, z + h], [x - e, ym, z + h]]);
      P.poly(front, roof, { wob: 0.2 });
      P.poly(qp([[x + dx, y, z], [x + dx, y + dy, z], [x + dx, ym, z + h]]), shd(wall, 0.24), { wob: 0.15 });
      P.stroke(qp([[x - e, ym, z + h], [x + dx + e, ym, z + h]]), 0.6, LINE);
      P.stroke(qp([[x - e, y + dy + e, z], [x + dx + e, y + dy + e, z]]), 0.6, LINE);
      P.stroke(qp([[x + dx + e, y + dy + e, z], [x + dx + e, ym, z + h], [x + dx + e, y - e, z]]), 0.55, LINE);
    } else {
      const xm = x + dx / 2;
      P.poly(qp([[x - e, y - e, z], [x - e, y + dy + e, z], [xm, y + dy + e, z + h], [xm, y - e, z + h]]), tint(roof, 0.8), { wob: 0.2 });
      P.poly(qp([[x + dx + e, y - e, z], [x + dx + e, y + dy + e, z], [xm, y + dy + e, z + h], [xm, y - e, z + h]]), shd(roof, 0.12), { wob: 0.2 });
      P.poly(qp([[x, y + dy, z], [x + dx, y + dy, z], [xm, y + dy, z + h]]), shd(wall, 0.1), { wob: 0.15 });
      P.stroke(qp([[xm, y - e, z + h], [xm, y + dy + e, z + h]]), 0.6, LINE);
      P.stroke(qp([[x + dx + e, y - e, z], [x + dx + e, y + dy + e, z]]), 0.6, LINE);
      P.stroke(qp([[x - e, y + dy + e, z], [xm, y + dy + e, z + h], [x + dx + e, y + dy + e, z]]), 0.55, LINE);
    }
  }
  // windows on the two faces the viewer sees
  function windows(P, r, x, y, dx, dy, z0, z1, litP, step) {
    step = step || 7;
    for (let v = z0 + 4; v + 3.4 < z1 - 1.5; v += step) {
      for (let u = x + 3; u + 2.4 < x + dx - 1.5; u += 6) {
        P.poly(qp([[u, y + dy, v], [u + 2.4, y + dy, v], [u + 2.4, y + dy, v + 3.4], [u, y + dy, v + 3.4]]), r() < litP ? K.lit : K.win, { wob: 0.05 });
      }
      for (let u = y + 3; u + 2.4 < y + dy - 1.5; u += 6) {
        P.poly(qp([[x + dx, u, v], [x + dx, u + 2.4, v], [x + dx, u + 2.4, v + 3.4], [x + dx, u, v + 3.4]]), r() < litP ? K.lit : tint(K.win, 1.15), { wob: 0.05 });
      }
    }
  }

  /* ---------- the city: one display list per day ---------- */

  function build(st, citySeed, daySeed, lay) {
    const P = new Pen(daySeed);
    const r = mulberry(citySeed); // the city's layout never changes between days
    const er = mulberry(daySeed); // the day's events
    const open = new Set(st.open || DISTRICTS);
    const closed = (d) => !open.has(d);
    const T = []; // depth-sorted things: [depth, draw]
    const add = (depth, d, f) => T.push([depth, d, f]);
    const ts = lay.ts;

    // the sea: a cut-away slab with its water section
    const S0 = -50, S1 = 500;
    P.poly(qp([[S1, S0, -40], [S1, S1, -40], [S1, S1, 0], [S1, S0, 0]]), K.seaD, { wob: 0.3 });
    P.poly(qp([[S0, S1, -40], [S1, S1, -40], [S1, S1, 0], [S0, S1, 0]]), shd(K.sea, 0.12), { wob: 0.3 });
    P.poly(qp([[S1, S0, -40], [S1, S1, -40], [S1, S1, -32], [S1, S0, -32]]), K.bed, { wob: 0.6 });
    P.poly(qp([[S0, S1, -40], [S1, S1, -40], [S1, S1, -32], [S0, S1, -32]]), K.bed, { wob: 0.6 });
    P.poly(qp([[S0, S0], [S1, S0], [S1, S1], [S0, S1]], 0), K.sea, { wob: 0.4 });
    for (const L of [[[S1, S0, -40], [S1, S1, -40], [S0, S1, -40]], [[S0, S1, 0], [S1, S1, 0], [S1, S0, 0], [S0, S0, 0], [S0, S1, 0]], [[S1, S1, 0], [S1, S1, -40]], [[S1, S0, 0], [S1, S0, -40]], [[S0, S1, 0], [S0, S1, -40]]]) P.stroke(qp(L), 1.1, LINE);
    const storm = !!(st.nature && st.nature.storm) || st.events.some((e) => e.kind === "storm");
    const nw = storm ? 340 : 190;
    for (let i = 0; i < nw; i++) {
      const gx = S0 + 6 + er() * (S1 - S0 - 12), gy = S0 + 6 + er() * (S1 - S0 - 12);
      if (gx > -8 && gx < 458 && gy > -8 && gy < 458) continue;
      const [sx, sy] = q(gx, gy, 0), w = 3 + er() * (storm ? 7 : 5);
      P.stroke([sx - w, sy, sx - w * 0.3, sy - 1.3, sx + w * 0.3, sy - 1.3, sx + w, sy], 0.7, storm ? [0.75, 0, 0, 0.3] : K.wave, { wob: 0.2 });
      if (er() < 0.3) P.stroke([sx - w * 0.5, sy - 2, sx + w * 0.4, sy - 2.6], 0.5, [0, 0, 0, 0], { ko: true, wob: 0.1 });
    }

    // the island's rock edge above the water, and the harbour's quay walls
    const rockF = (L) => { P.poly(qp(L), K.stone, { wob: 0.25 }); };
    rockF([[450, 0, 0], [450, 380, 0], [450, 380, LAND], [450, 0, LAND]]);
    rockF([[0, 450, 0], [380, 450, 0], [380, 450, LAND], [0, 450, LAND]]);
    P.poly(qp(rect(0, 0, 450, 450), LAND), K.street, { wob: 0.3 });
    P.poly(qp(WATER, 0), K.sea, { wob: 0.25 });
    for (const L of [[[200, 200, 0], [200, 400, 0], [200, 400, LAND], [200, 200, LAND]], [[200, 200, 0], [400, 200, 0], [400, 200, LAND], [200, 200, LAND]],
      [[400, 380, 0], [450, 380, 0], [450, 380, LAND], [400, 380, LAND]], [[380, 400, 0], [380, 450, 0], [380, 450, LAND], [380, 400, LAND]]]) {
      P.poly(qp(L), shd(K.stone, 0.1), { wob: 0.15 });
      P.stroke(qp([L[0], L[1]]), 0.6, LINE);
    }
    for (const L of [[[450, 0, LAND], [450, 380, LAND], [400, 380, LAND], [400, 200, LAND], [200, 200, LAND], [200, 400, LAND], [380, 400, LAND], [380, 450, LAND], [0, 450, LAND]],
      [[450, 0, 0], [450, 380, 0]], [[380, 450, 0], [0, 450, 0]], [[450, 380, 0], [450, 380, LAND]], [[380, 450, 0], [380, 450, LAND]]]) P.stroke(qp(L), 0.9, LINE);
    for (let i = 0; i < 26; i++) { // strata in the rock
      const t = r(), z = 3 + r() * 10;
      if (i % 2) P.stroke(qp([[450, t * 360, z], [450, t * 360 + 8 + r() * 14, z + 0.5]]), 0.45, [0.6, 0.3, 0, 0], { wob: 0.1 });
      else P.stroke(qp([[t * 360, 450, z], [t * 360 + 8 + r() * 14, 450, z + 0.5]]), 0.45, [0.6, 0.3, 0, 0], { wob: 0.1 });
    }
    for (let i = 0; i < 70; i++) { // ripples in the harbour
      const gx = 205 + r() * 240, gy = 205 + r() * 240;
      if ((gx > 400 && gy < 380) || (gy > 400 && gx < 380)) continue;
      const [sx, sy] = q(gx, gy, 0), w = 2 + r() * 4;
      P.stroke([sx - w, sy, sx, sy - 1, sx + w, sy], 0.5, K.wave, { wob: 0.15 });
    }

    // district grounds, greyed and hatched when closed
    for (const d of DISTRICTS) {
      const pl = palette(d);
      P.grey = closed(d) ? GREY : null;
      P.poly(qp(POLY[d], LAND), pl.ground, { wob: 0.2 });
      if (closed(d)) {
        const [x0, y0] = POLY[d].reduce((m, p) => [Math.min(m[0], p[0]), Math.min(m[1], p[1])], [1e9, 1e9]);
        const [x1, y1] = POLY[d].reduce((m, p) => [Math.max(m[0], p[0]), Math.max(m[1], p[1])], [-1e9, -1e9]);
        P.grey = null;
        for (let s = x0 + y0 + 6; s < x1 + y1; s += 9) {
          const seg = [];
          for (let x = x0; x <= x1; x += 2) { const y = s - x; if (y >= y0 && y <= y1 && inPoly(POLY[d], x, y)) seg.push([x, y]); }
          if (seg.length > 1) P.stroke(qp([seg[0], seg[seg.length - 1]], LAND), 0.6, [0.5, 0, 0, 0], { wob: 0.15 });
        }
      }
    }
    P.grey = null;
    P.poly(qp(PRISON, LAND), K.plaza, { wob: 0.2 });
    P.poly(qp(COUNCIL, LAND), K.plaza, { wob: 0.2 });
    for (const L of [PRISON, COUNCIL]) P.outline(qp(L, LAND), 0.5, [0.5, 0, 0, 0]);

    // street lamps: Ochre light as stepped rings on the ground
    const lampsAt = [[160, 106], [240, 60], [330, 104], [420, 60], [270, 196], [430, 230], [425, 330], [106, 160], [60, 240], [104, 330], [60, 420], [196, 270], [230, 430], [330, 425], [196, 196]];
    for (const [x, y] of lampsAt) {
      const [sx, sy] = q(x, y, LAND);
      const ld = districtAt(x, y);
      P.grey = ld && closed(ld) ? GREY : null;
      P.rings(sx, sy, 3, 13, 4, K.lamp, 0.5);
      add(x + y, "", () => { P.stroke([sx, sy, sx, sy - 9], 0.6, LINE, { taper: false }); P.dot(sx, sy - 9.5, 1.3, K.lit); });
    }
    P.grey = null;

    // the sea wall round the island, with the gate at the harbour mouth
    const wallH = 9, wt = 6;
    for (let x = 0; x < 450; x += 30) add(x + 15, "", () => box(P, x, 0, Math.min(30, 450 - x), wt, LAND, wallH, K.wall, { lw: 0.55 }));
    for (let y = 0; y < 450; y += 30) add(y + 15, "", () => box(P, 0, y, wt, Math.min(30, 450 - y), LAND, wallH, K.wall, { lw: 0.55 }));
    for (let y = 0; y < 360; y += 30) add(450 + y + 15, "", () => box(P, 450 - wt, y, wt, Math.min(30, 360 - y), LAND, wallH, K.wall, { lw: 0.55 }));
    for (let x = 0; x < 360; x += 30) add(450 + x + 15, "", () => box(P, x, 450 - wt, Math.min(30, 360 - x), wt, LAND, wallH, K.wall, { lw: 0.55 }));
    // crenels on the front walls
    for (let y = 4; y < 356; y += 8) add(450 + y + 16, "", () => box(P, 450 - wt, y, wt, 3.5, LAND + wallH, 2.5, K.wall, { lw: 0.35 }));
    for (let x = 4; x < 356; x += 8) add(450 + x + 16, "", () => box(P, x, 450 - wt, 3.5, wt, LAND + wallH, 2.5, K.wall, { lw: 0.35 }));

    const F = { P, r, er, T, add, closed };
    prison(F, st);
    council(F);
    oldQuarter(F);
    hightown(F);
    port(F, storm);
    lowtown(F);
    market(F);
    seawall(F, storm);
    lighthouse(F, storm);

    // the ship, the banners and the strike live in the sorted pass too
    const ship = !!(st.nature && st.nature.ship) || st.events.some((e) => e.kind === "ship");
    if (ship) add(860, "", () => { const i = P.ops.length, c = q(372, 372, 0); cargoShip(P, 372, 372, er); grow(P, i, c[0], c[1], 1.3); });
    const strike = !!(st.nature && st.nature.strike) || st.events.some((e) => e.kind === "strike");
    if (strike) placards(F);
    const turf = st.turf || (st.events.find((e) => e.kind === "turf") || {}).detail || null;
    if (turf) add(400, "", () => {
      for (const [x, y, g] of [[198, 184, "Families"], [184, 198, "Saltdogs"]]) { const i = P.ops.length, c = q(x, y, LAND); banner(P, x, y, g, turf[g]); grow(P, i, c[0], c[1], 1.5); }
    });

    T.sort((a, b) => a[0] - b[0]);
    for (const [, d, f] of T) { P.grey = d && closed(d) ? GREY : null; f(); }
    P.grey = null;

    overlays(F, st, storm, lay.narrow ? 1.45 : 1);
    labels(P, st, closed, ts);
    cartouche(P, st, lay);
    return P.ops;
  }

  function inPoly(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function districtAt(x, y) { for (const d of DISTRICTS) if (inPoly(POLY[d], x, y)) return d; return null; }

  function tree(P, x, y, s) {
    const [sx, sy] = q(x, y, LAND);
    P.stroke([sx, sy, sx + 0.3, sy - s * 0.8], s * 0.18, K.wood, { taper: false });
    P.ell(sx, sy - s * 1.1, s * 0.75, s * 0.62, K.greenD, { line: 0.5, wob: 0.5 });
    P.ell(sx - s * 0.18, sy - s * 1.25, s * 0.5, s * 0.4, K.green, { wob: 0.4 });
  }
  function house(F, d, x, y, dx, dy, h, o) {
    o = o || {};
    const pl = palette(d), r = F.r;
    const wall = r() < 0.55 ? pl.wall : pl.wall2, roof = r() < 0.7 ? pl.roof : pl.roof2;
    const ax = o.ax || (dx > dy ? "x" : "y"), rh = o.flat ? 0 : Math.min(dx, dy) * (0.35 + r() * 0.2);
    const z0 = o.z0 == null ? LAND : o.z0, seed = r() * 1e9;
    F.add(x + dx / 2 + y + dy / 2 + (o.dz || 0), d, () => {
      const wr = mulberry(seed | 0), P = F.P;
      box(P, x, y, dx, dy, z0, h, wall, { lw: 0.6 });
      windows(P, wr, x, y, dx, dy, z0, z0 + h, o.lit == null ? 0.22 : o.lit, o.step);
      if (o.flat) {
        box(P, x - 0.5, y - 0.5, dx + 1, dy + 1, z0 + h, 1.6, shd(wall, 0.05), { lw: 0.4 });
        if (o.tank) { const c = [x + dx * 0.35, y + dy * 0.4]; prism(P, ngon(c[0], c[1], 3, 8), z0 + h + 1.6, z0 + h + 8, K.wood, { lw: 0.45 }); }
      } else gable(P, x, y, dx, dy, z0 + h, rh, ax, roof, wall);
    });
  }

  function prison(F, st) {
    const { P, add } = F, n = Math.max(0, Math.min(40, Math.round(st.prison || 0)));
    add(16, "", () => box(P, 8, 8, 94, 3, LAND, 7, K.stone, { lw: 0.4 }));
    add(16, "", () => box(P, 8, 8, 3, 94, LAND, 7, K.stone, { lw: 0.4 }));
    add(70, "", () => {
      // the cell block: 40 windows, one per place, lit Ochre when filled
      const x = 18, y = 16, dx = 60, dy = 46, z0 = LAND, h = 30;
      box(P, x, y, dx, dy, z0, h, K.civ, { lw: 0.8, top: [0.3, 0.05, 0.06, 0.06] });
      let k = 0;
      for (let row = 0; row < 2; row++) for (let i = 0; i < 10; i++, k++) {
        const u = x + 4 + i * 5.4, v = z0 + 7 + row * 11;
        P.poly(qp([[u, y + dy, v], [u + 2.6, y + dy, v], [u + 2.6, y + dy, v + 5], [u, y + dy, v + 5]]), k < n ? K.lit : K.win, { wob: 0.04 });
        P.stroke(qp([[u + 1.3, y + dy, v], [u + 1.3, y + dy, v + 5]]), 0.35, LINE, { taper: false, wob: 0 });
      }
      for (let row = 0; row < 2; row++) for (let i = 0; i < 10; i++, k++) {
        const u = y + 3 + i * 4.2, v = z0 + 7 + row * 11;
        P.poly(qp([[x + dx, u, v], [x + dx, u + 2.2, v], [x + dx, u + 2.2, v + 5], [x + dx, u, v + 5]]), k < n ? K.lit : K.win, { wob: 0.04 });
        P.stroke(qp([[x + dx, u + 1.1, v], [x + dx, u + 1.1, v + 5]]), 0.35, LINE, { taper: false, wob: 0 });
      }
    });
    add(150, "", () => box(P, 8, 102, 94, 3, LAND, 7, K.stone, { lw: 0.4 }));
    add(150, "", () => box(P, 102, 8, 3, 97, LAND, 7, K.stone, { lw: 0.4 }));
    add(112, "", () => { // the watch tower
      prism(P, ngon(92, 22, 7, 8), LAND, LAND + 46, K.stone, { lw: 0.6 });
      prism(P, ngon(92, 22, 9, 8), LAND + 46, LAND + 50, K.stoneD, { lw: 0.5 });
      const [sx, sy] = q(92, 22, LAND + 56);
      P.poly([sx - 9, sy + 2, sx, sy - 8, sx + 9, sy + 2], K.civRoof, { line: 0.5 });
    });
  }

  function council(F) {
    const { P, add } = F;
    add(310, "", () => {
      const x = 126, y = 126, d = 58, z0 = LAND;
      box(P, x - 4, y - 4, d + 8, d + 8, z0, 3, K.stone, { lw: 0.5 });
      box(P, x, y, d, d, z0 + 3, 22, K.civ, { lw: 0.8 });
      for (let u = x + 4; u < x + d - 2; u += 6.5) { // columns
        P.stroke(qp([[u, y + d + 1.5, z0 + 3], [u, y + d + 1.5, z0 + 25]]), 1.3, [0.18, 0.02, 0.06, 0], { taper: false, wob: 0.05 });
        P.stroke(qp([[x + d + 1.5, u, z0 + 3], [x + d + 1.5, u, z0 + 25]]), 1.3, [0.3, 0.04, 0.06, 0], { taper: false, wob: 0.05 });
      }
      box(P, x - 2, y - 2, d + 4, d + 4, z0 + 25, 4, K.civRoof, { lw: 0.6 });
      for (let i = 0; i < 4; i++) prism(P, ngon(x + d / 2, y + d / 2, 18 - i * 4.2, 12), z0 + 29 + i * 5, z0 + 34 + i * 5, i % 2 ? K.civRoof : shd(K.civRoof, -0.15), { lw: 0.5 });
      const [sx, sy] = q(x + d / 2, y + d / 2, z0 + 49);
      P.stroke([sx, sy, sx, sy - 16], 0.7, LINE, { taper: false });
      P.poly([sx, sy - 16, sx + 10, sy - 13.5, sx, sy - 11], K.civRoof, { wob: 0.2 });
    });
  }

  function oldQuarter(F) {
    const r = F.r, d = "Old Quarter";
    // lanes: an irregular grid of small houses
    let x = 114;
    while (x < 274) {
      const w = 14 + r() * 12, xe = Math.min(276, x + w);
      let y = 12;
      while (y < 104) {
        const h = 14 + r() * 14, ye = Math.min(106, y + h);
        if (ye - y > 8 && xe - x > 8) {
          if (r() < 0.1) { const tx = x + (xe - x) / 2, ty = y + (ye - y) / 2; F.add(tx + ty, d, () => tree(F.P, tx, ty, 6)); }
          else house(F, d, x, y, xe - x, ye - y, 10 + r() * 12, { lit: 0.3 });
        }
        y = ye + 4 + r() * 2;
      }
      x = xe + 4 + r() * 2;
    }
  }

  function hightown(F) {
    const { P, r, add } = F, d = "Hightown";
    // three terraces stepping down toward the harbour
    const bands = [[10, 38, 22], [42, 72, 13], [76, 106, 5]];
    bands.forEach(([y0, y1, zt], bi) => {
      add(284 + y0 + 60, d, () => box(P, 282, y0, 166, y1 - y0, LAND, zt, K.stone, { lw: 0.6, top: palette(d).ground }));
      let x = 288;
      while (x < 440) {
        const w = 15 + r() * 6;
        if (x + w > 446) break;
        if (bi === 2 && r() < 0.18) { const tx = x + w / 2, ty = y0 + 18; F.add(tx + ty + 9, d, () => { const s = q(tx, ty, LAND + zt); P.ell(s[0], s[1] - 7, 5.5, 4.6, K.greenD, { line: 0.5 }); P.ell(s[0] - 1.2, s[1] - 8, 3.6, 3, K.green); }); }
        else house(F, d, x, y0 + 4, w - 1.5, y1 - y0 - 10, 13 + r() * 6, { z0: LAND + zt, ax: "y", lit: 0.35, dz: 40 });
        x += w;
      }
    });
  }

  function port(F, storm) {
    const { P, r, add } = F, d = "Port";
    for (const [x, w] of [[208, 54], [270, 56], [334, 50]]) house(F, d, x, 118, w, 30, 16 + r() * 6, { ax: "x", lit: 0.12, step: 9 });
    // crates along the basin's back quay
    for (let i = 0; i < 16; i++) {
      const x = 210 + r() * 180, y = 158 + r() * 30, c = [[0.1, 0, 0.75, 0], [0.12, 0, 0.1, 0.75], [0.1, 0.75, 0.3, 0]][(r() * 3) | 0];
      const n = 1 + ((r() * 3) | 0);
      add(x + y + 4, d, () => { for (let k = 0; k < n; k++) box(P, x, y, 9, 6, LAND + k * 4.5, 4.5, c, { lw: 0.4 }); });
    }
    // cranes over the water
    for (const x of [236, 300, 364]) {
      add(x + 196, d, () => {
        box(P, x - 3, 190, 6, 6, LAND, 26, [0.15, 0.6, 0.6, 0], { lw: 0.5 });
        const a = q(x, 193, LAND + 30), b = q(x, 236, LAND + 36), c = q(x, 182, LAND + 30);
        P.stroke([c[0], c[1], a[0], a[1], b[0], b[1]], 1.4, [0.15, 0.75, 0.6, 0], { taper: false });
        P.stroke([b[0], b[1], b[0], b[1] + 22], 0.4, LINE, { taper: false, wob: 0 });
        P.poly([b[0] - 3, b[1] + 22, b[0] + 3, b[1] + 22, b[0] + 3, b[1] + 27, b[0] - 3, b[1] + 27], [0.1, 0, 0.7, 0], { line: 0.4 });
      });
    }
    // the long quay down to the lighthouse
    for (let y = 214; y < 340; y += 40) house(F, d, 408, y, 34, 30, 12 + r() * 4, { ax: "y", lit: 0.1 });
    // boats: tied up in a storm, out on the water otherwise
    const boats = storm ? [[392, 230, 1.57], [392, 262, 1.57], [392, 294, 1.57], [230, 208, 0], [262, 208, 0], [294, 208, 0], [326, 208, 0]]
      : [[392, 300, 1.57], [262, 208, 0], [270, 300, 0.7], [330, 250, 2.3], [480, 160, 0.4], [150, 495, 2.0]];
    for (const [x, y, a] of boats) add(x + y, "", () => boat(P, x, y, a, storm, F.closed));
  }

  function boat(P, x, y, a, tied, closed) {
    const hull = rot(x, y, a, [[-8, -3], [6, -3], [10, 0], [6, 3], [-8, 3]]);
    prism(P, hull, -1, 3, [0.15, 0.7, 0.45, 0], { lw: 0.45 });
    const m = q(x, y, 3);
    P.stroke([m[0], m[1], m[0], m[1] - 13], 0.5, LINE, { taper: false });
    if (!tied) P.poly([m[0] + 0.5, m[1] - 13, m[0] + 7, m[1] - 3, m[0] + 0.5, m[1] - 3], [0.02, 0.02, 0.1, 0], { line: 0.4 });
    else { const c = q(x - Math.cos(a) * 12, y - Math.sin(a) * 12, LAND); P.stroke([m[0], m[1] - 2, (m[0] + c[0]) / 2, (m[1] + c[1]) / 2 + 2, c[0], c[1]], 0.35, LINE, { taper: false }); }
  }

  function lowtown(F) {
    const r = F.r, d = "Lowtown";
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
      const x = 12 + i * 32, y = 118 + j * 40;
      house(F, d, x, y, 26, 32, 30 + r() * 26, { flat: true, tank: r() < 0.6, lit: 0.18 });
    }
    // laundry strung between the tenements
    for (let k = 0; k < 6; k++) {
      const i = (r() * 2) | 0, j = (r() * 4) | 0, z = LAND + 18 + r() * 10, y = 124 + j * 40 + r() * 20;
      F.add(12 + i * 32 + 30 + y + 2, d, () => {
        const a = q(12 + i * 32 + 26, y, z), b = q(12 + i * 32 + 32, y, z);
        F.P.stroke([a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2, b[0], b[1]], 0.3, LINE, { taper: false, wob: 0 });
        F.P.dot((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 3, 1.2, [[0, 0.8, 0.2, 0], [0, 0, 0.8, 0], [0, 0, 0, 0.8]][k % 3]);
      });
    }
  }

  function market(F) {
    const { P, r, add } = F, d = "Market";
    house(F, d, 14, 290, 30, 64, 16, { ax: "y", lit: 0.15 }); // the market hall
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) {
      const x = 54 + i * 17, y = 290 + j * 30;
      if (j > 3 && i === 0) continue;
      const stripe = [K.salt, [0, 0.05, 0.8, 0], [0, 0.75, 0.2, 0]][(i + j) % 3];
      add(x + y + 12, d, () => {
        for (const [u, v] of [[0, 0], [11, 0], [0, 11], [11, 11]]) { const a = q(x + u, y + v, LAND), b = q(x + u, y + v, LAND + 7); P.stroke([a[0], a[1], b[0], b[1]], 0.45, LINE, { taper: false }); }
        box(P, x + 1, y + 1, 10, 10, LAND, 3, [0.25, 0.4, 0.55, 0], { lw: 0.35 });
        for (let s = 0; s < 4; s++) {
          const ss = s * 3;
          P.poly(qp([[x - 1 + ss, y - 1, LAND + 9], [x + 2 + ss, y - 1, LAND + 9], [x + 2 + ss, y + 13, LAND + 7], [x - 1 + ss, y + 13, LAND + 7]]), s % 2 ? stripe : [0, 0, 0.05, 0], { wob: 0.1 });
        }
        P.outline(qp([[x - 1, y - 1, LAND + 9], [x + 11, y - 1, LAND + 9], [x + 11, y + 13, LAND + 7], [x - 1, y + 13, LAND + 7]]), 0.45, LINE);
      });
    }
    for (let i = 0; i < 26; i++) { // a crowd
      const x = 50 + r() * 54, y = 290 + r() * 150, c = [[0.6, 0.1, 0.1, 0.1], [0.1, 0.7, 0.3, 0], [0.2, 0, 0.1, 0.7]][i % 3];
      add(x + y + 1, d, () => { const s = q(x, y, LAND); P.poly([s[0] - 1.2, s[1], s[0] + 1.2, s[1], s[0] + 0.9, s[1] - 3.5, s[0] - 0.9, s[1] - 3.5], c, { wob: 0 }); P.dot(s[0], s[1] - 4.6, 1, [0.1, 0.35, 0.45, 0]); });
    }
    add(524, d, () => tree(P, 92, 432, 7));
  }

  function seawall(F) {
    const r = F.r, d = "Seawall";
    for (let y = 214; y < 440; y += 24 + r() * 6) house(F, d, 120 + r() * 8, y, 26 + r() * 10, 18, 10 + r() * 10, { ax: "x", lit: 0.25 });
    for (let x = 212; x < 356; x += 26 + r() * 6) house(F, d, x, 410, 20, 28, 9 + r() * 9, { ax: "y", lit: 0.25 });
    // the gate tower opposite the lighthouse, with the boom across the mouth
    F.add(800, d, () => {
      const P = F.P;
      prism(P, rect(358, 410, 18, 18), LAND, LAND + 34, K.wall, { lw: 0.7 });
      for (let i = 0; i < 4; i++) box(P, 358 + i * 5, 426, 3, 2, LAND + 34, 3, K.wall, { lw: 0.3 });
      const [ax, ay] = q(376, 426, LAND + 24);
      P.poly([ax - 2.5, ay + 14, ax - 2.5, ay + 4, ax + 2, ay, ax + 6.5, ay + 4, ax + 6.5, ay + 14], K.win, { wob: 0.1 });
    });
  }

  function lighthouse(F, storm) {
    const { P, add } = F;
    add(805, "", () => {
      const cx = 428, cy = 362;
      prism(P, rect(cx - 12, cy - 12, 24, 24), LAND, LAND + 5, K.stone, { lw: 0.6 });
      for (let i = 0; i < 6; i++) prism(P, ngon(cx, cy, 8.5 - i * 0.6, 10), LAND + 5 + i * 9, LAND + 14 + i * 9, i % 2 ? [0.08, 0.85, 0.35, 0] : [0.02, 0.02, 0.06, 0], { lw: 0.55 });
      const top = LAND + 59;
      prism(P, ngon(cx, cy, 7.5, 10), top, top + 2, K.civRoof, { lw: 0.5 });
      const [sx, sy] = q(cx, cy, top + 7);
      P.rings(sx, sy, 6, storm ? 40 : 28, 5, [0, 0.04, 0.16, 0], 1);
      // two beams, as overprinted Ochre wedges
      for (const dir of [-1, 1]) P.poly([sx, sy - 1, sx + dir * 110, sy - 22, sx + dir * 110, sy + 14, sx, sy + 1.5], [0, 0, 0.1, 0], { ko: false, wob: 0.4 });
      P.poly([sx - 5, sy + 5, sx - 5, sy - 4, sx + 5, sy - 4, sx + 5, sy + 5], [0, 0.1, 0.95, 0], { line: 0.5 });
      P.poly([sx - 6.5, sy - 4, sx, sy - 11, sx + 6.5, sy - 4], K.civRoof, { line: 0.5 });
    });
  }

  function cargoShip(P, x, y, er) {
    const a = Math.atan2(-1, -1); // heading in through the mouth
    // the wake behind her, white on the water
    const w0 = q(x + 30, y + 30, 0);
    for (const s of [-1, 1]) { const w1 = q(x + 30 + s * 42 + 52, y + 30 - s * 42 + 52, 0); P.stroke([w0[0], w0[1], w1[0], w1[1]], 1.6, [0, 0, 0, 0], { ko: true }); }
    prism(P, rot(x, y, a, [[-40, -10], [24, -10], [42, 0], [24, 10], [-40, 10]]), -3, 9, [0.55, 0.62, 0.15, 0], { lw: 0.8, top: [0.18, 0.4, 0.5, 0] });
    for (let i = 0; i < 6; i++) {
      const u = -22 + i * 7.5, c = [[0.1, 0, 0.8, 0], [0.12, 0, 0.1, 0.8], [0.1, 0.8, 0.35, 0]][(er() * 3) | 0];
      for (const v of [-4.5, 4.5]) prism(P, rot(x, y, a, [[u - 3.4, v - 4], [u + 3.4, v - 4], [u + 3.4, v + 4], [u - 3.4, v + 4]]), 9, 15 + (er() < 0.5 ? 5 : 0), c, { lw: 0.4 });
    }
    prism(P, rot(x, y, a, [[-38, -8], [-26, -8], [-26, 8], [-38, 8]]), 9, 22, [0.03, 0.03, 0.1, 0], { lw: 0.6 });
    const [fx, fy] = rot(x, y, a, [[-32, 0]])[0];
    prism(P, ngon(fx, fy, 3, 8), 22, 32, [0.1, 0.85, 0.3, 0], { lw: 0.5 });
    const s = q(fx, fy, 34);
    for (let i = 0; i < 4; i++) P.ell(s[0] - 5 - i * 6, s[1] - 4 - i * 4, 3 + i * 1.6, 2.4 + i * 1.2, [0.22, 0.05, 0.03, 0], { ko: false, wob: 0.5 });
  }

  function placards(F) {
    const { P, er, add } = F;
    const spots = [[140, 198], [154, 199], [168, 198], [182, 199], [198, 140], [199, 154], [198, 168], [199, 182]];
    spots.forEach(([x, y]) => add(x + y + 1, "", () => {
      const s = q(x, y, LAND), i0 = P.ops.length;
      P.poly([s[0] - 1.4, s[1], s[0] + 1.4, s[1], s[0] + 1, s[1] - 4.5, s[0] - 1, s[1] - 4.5], [0.5, 0.1, 0.1, 0.2], { wob: 0 });
      P.dot(s[0], s[1] - 5.8, 1.2, [0.1, 0.35, 0.45, 0]);
      const lean = (er() - 0.5) * 3;
      P.stroke([s[0] + 1.2, s[1] - 3, s[0] + 1.2 + lean, s[1] - 15], 0.5, K.wood, { taper: false });
      const px = s[0] + 1.2 + lean, py = s[1] - 15;
      P.poly([px - 5, py - 6, px + 5, py - 6.5, px + 5, py + 0.5, px - 5, py + 1], [0, 0, 0.04, 0], { line: 0.55, li: [0.1, 0.9, 0.2, 0] });
      P.stroke([px - 3, py - 3.5, px + 3, py - 3.7], 0.6, [0.1, 0.9, 0.2, 0], { taper: false });
      P.stroke([px - 3, py - 1.2, px + 1.5, py - 1.3], 0.6, [0.1, 0.9, 0.2, 0], { taper: false });
      grow(P, i0, s[0], s[1], 1.45);
    }));
  }

  // a gang banner on a pole: raised for respect, torn and half down for encroach
  function banner(P, x, y, gang, move) {
    const s = q(x, y, LAND), side = gang === "Families" ? 1 : -1, ink = gang === "Families" ? K.fam : K.salt;
    const torn = move === "encroach";
    const lean = torn ? side * 7 : 0, top = [s[0] + lean, s[1] - 40];
    P.stroke([s[0], s[1], top[0], top[1]], 1.1, K.wood, { taper: false });
    P.dot(top[0], top[1] - 1, 1.4, [0, 0.1, 0.9, 0]);
    const fy = torn ? 14 : 2, fx = top[0] + (torn ? lean * (fy / 40) * -1 : 0), y0 = top[1] + fy;
    const w = 22 * side, h = 13;
    if (!torn) {
      P.poly(spline([fx, y0, fx + w * 0.5, y0 - 2, fx + w, y0 + 1, fx + w * 0.98, y0 + h * 0.5, fx + w, y0 + h + 1, fx + w * 0.5, y0 + h - 1, fx, y0 + h], false, 3), ink, { line: 0.55 });
    } else {
      // ragged fly edge and a hole, shreds below
      const pts = [fx, y0 + 2, fx + w * 0.45, y0 + 3, fx + w * 0.62, y0 + 1, fx + w * 0.55, y0 + 4.5, fx + w * 0.78, y0 + 4, fx + w * 0.6, y0 + 7, fx + w * 0.72, y0 + 9.5, fx + w * 0.42, y0 + 10, fx + w * 0.5, y0 + 13, fx, y0 + h + 1];
      P.poly(pts, ink, { line: 0.55, wob: 0.2 });
      P.poly([fx + w * 0.22, y0 + 5, fx + w * 0.32, y0 + 6, fx + w * 0.26, y0 + 8.5], [0, 0, 0, 0], { ko: true, wob: 0 });
      for (let i = 0; i < 3; i++) { const bx = fx + w * (0.6 + i * 0.12), by = y0 + 16 + i * 5; P.poly([bx, by, bx + 3 * side, by + 1, bx + 1 * side, by + 3], ink, { wob: 0 }); }
    }
    P.text(gang === "Families" ? "F" : "S", fx + w * 0.3, y0 + 9.5, 8, [0, 0, 0, 0], { bold: true });
  }

  // scale the ops drawn since index i about a point, so a prop can be enlarged to read at the fitted view
  function grow(P, i, cx, cy, k) {
    for (; i < P.ops.length; i++) {
      const op = P.ops[i];
      if (op.t) {
        op.x = cx + (op.x - cx) * k; op.y = cy + (op.y - cy) * k; op.size *= k;
        op.font = op.font.replace(/[\d.]+px/, op.size + "px");
      } else {
        const p = op.p instanceof Float32Array ? op.p : (op.p = Float32Array.from(op.p));
        for (let j = 0; j < p.length; j += 2) { p[j] = cx + (p[j] - cx) * k; p[j + 1] = cy + (p[j + 1] - cy) * k; }
      }
      op.x0 = cx + (op.x0 - cx) * k; op.x1 = cx + (op.x1 - cx) * k; op.y0 = cy + (op.y0 - cy) * k; op.y1 = cy + (op.y1 - cy) * k;
    }
  }

  /* ---------- the day's events, drawn over the city ---------- */

  function flare(P, sx, sy, r) {
    P.stroke([sx + 3, sy + 50, sx + 1, sy + 26, sx, sy + 2], 1.4, [0.1, 0.7, 0.3, 0], { taper: true, wob: 0.8 });
    P.rings(sx, sy, r * 0.9, r * 2.6, 4, [0, 0.1, 0.1, 0]);
    const st = [];
    for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU, rr = i % 2 ? r * 0.45 : r; st.push(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
    P.poly(st, [0, 0.95, 0.25, 0], { ko: true, wob: 0.3, line: 0.7 });
    P.ell(sx, sy, r * 0.42, r * 0.42, [0, 0.15, 1, 0], { ko: true, wob: 0.1 });
  }
  function smoke(P, sx, sy, n, s, dark) {
    for (let i = 0; i < n; i++) {
      const rr = s * (1 + i * 0.35);
      P.ell(sx - i * s * 0.9, sy - i * s * 1.25, rr, rr * 0.75, dark ? [0.32, 0.12, 0.05, 0] : [0.2, 0.06, 0.03, 0], { ko: false, wob: 0.6, line: i < 2 ? 0.35 : 0, li: [0.4, 0, 0, 0] });
    }
  }
  function flame(P, x, y, s, seed) {
    const f = Math.sin(seed) * 0.15;
    const fl = (sc, ink) => {
      const h = s * sc * (1 + f), w = s * sc * 0.45;
      P.poly(spline([x - w, y, x - w * 0.6, y - h * 0.5, x + f * w * 2, y - h, x + w * 0.6, y - h * 0.45, x + w, y], true, 3), ink, { ko: false, wob: 0 });
    };
    fl(1, [0, 0.8, 0.6, 0]); fl(0.7, [0, 0.35, 0.9, 0]); fl(0.4, [0, 0, 0.6, 0]);
  }
  function lampRings(P, sx, sy, empty) {
    if (empty) {
      for (let i = 0; i < 3; i++) { const rr = 11 + i * 10; P.outline(ellipse(sx, sy, rr, rr * 0.5, 0, 28), 1.1, [0.95, 0, 0, 0]); }
    } else P.rings(sx, sy, 7, 38, 4, [0.14, 0, 0, 0.03], 0.5);
    P.stroke([sx, sy, sx, sy - 16], 1, LINE, { taper: false });
    P.dot(sx, sy - 17, 2.6, empty ? [0, 0, 0, 0] : [0.7, 0, 0, 0.3], empty);
    if (empty) P.outline(ellipse(sx, sy - 17, 2.7, 2.7, 0, 10), 0.7, LINE);
  }
  function wagon(P, x, y, tx, ty) {
    const a = Math.atan2(ty - y, tx - x);
    prism(P, rot(x, y, a, [[-10, -5], [9, -5], [9, 5], [-10, 5]]), LAND + 3, LAND + 14, [0.85, 0.05, 0.05, 0.12], { lw: 0.5, top: [0.6, 0, 0, 0.1] });
    for (const [u, v] of [[-6.5, 5.2], [5.5, 5.2], [-6.5, -5.2], [5.5, -5.2]]) { const p = rot(x, y, a, [[u, v]])[0], s = q(p[0], p[1], LAND + 3); P.dot(s[0], s[1], 2.6, [0.4, 0.5, 0.6, 0]); }
    const s = q(x, y, LAND + 17);
    P.rings(s[0], s[1], 2, 10, 3, [0.15, 0, 0, 0.08]);
    P.dot(s[0], s[1], 2.2, [0.2, 0, 0, 0.95]);
    // speed lines behind it
    const b = rot(x, y, a, [[-14, -3], [-23, -3], [-14, 3], [-26, 3]]).map((p) => q(p[0], p[1], LAND + 6));
    P.stroke([b[0][0], b[0][1], b[1][0], b[1][1]], 0.4, LINE, { taper: false });
    P.stroke([b[2][0], b[2][1], b[3][0], b[3][1]], 0.4, LINE, { taper: false });
  }
  function coins(P, sx, sy, n, refused) {
    for (let i = 0; i < n; i++) {
      const y = sy - i * 3.6;
      P.poly(ellipse(sx, y + 1.8, 7.5, 4.5, 0, 18), [0.15, 0.3, 0.8, 0], { wob: 0.1, line: 0.5 });
      P.poly(ellipse(sx, y, 7.5, 4.5, 0, 18), [0, 0.04, 0.95, 0], { wob: 0.1, line: 0.6 });
    }
    P.text("$", sx, sy - (n - 1) * 3.6 + 2.6, 7, [0.2, 0.4, 0.6, 0], { bold: true });
    if (refused) { P.stroke([sx - 9, sy - 8, sx + 9, sy + 4], 1.4, [0.05, 0.9, 0.2, 0]); P.stroke([sx + 9, sy - 8, sx - 9, sy + 4], 1.4, [0.05, 0.9, 0.2, 0]); }
  }
  function stamp(P, sx, sy, caught) {
    P.poly([sx - 5, sy - 6, sx + 5, sy - 6, sx + 5, sy + 6, sx - 5, sy + 6], [0, 0, 0.05, 0], { line: 0.6, wob: 0.2 });
    for (let i = 0; i < 3; i++) P.stroke([sx - 3, sy - 3 + i * 3, sx + 3, sy - 3 + i * 3], 0.4, LINE, { taper: false });
    if (caught) P.outline(ellipse(sx + 2, sy + 2, 4.5, 4.5, 0, 14), 0.9, [0.05, 0.9, 0.2, 0]);
  }

  function overlays(F, st, storm, ek) {
    const { P, er } = F;
    const G = (i, sx, sy) => { if (ek !== 1) grow(P, i, sx, sy, ek); };
    const slot = {};
    const at = (d) => {
      const a = ANCHOR[d] || ANCHOR.council, n = (slot[d] = (slot[d] || 0) + 1) - 1;
      const j = [[0, 0], [24, -12], [-12, 24], [28, 20], [-22, -14], [12, 34], [-30, 8], [36, -28]][n % 8];
      return [a[0] + j[0], a[1] + j[1]];
    };
    const evs = st.events.slice();
    if (st.nature && st.nature.fire && !evs.some((e) => e.kind === "fire")) evs.push({ kind: "fire", district: st.nature.fire });
    // ground light first, then things in the air
    for (const e of evs) {
      const d = e.district;
      if (!POLY[d]) continue;
      if (e.kind === "fire") {
        const [x, y] = at(d), [sx, sy] = q(x, y, LAND + 14);
        const i0 = P.ops.length;
        P.rings(sx, sy, 10, 66, 6, [0, 0.12, 0.05, 0], 0.62);
        P.rings(sx, sy, 5, 36, 4, [0, 0, 0.18, 0], 0.62);
        G(i0, sx, sy);
        e._p = [sx, sy];
      } else if (e.kind === "arrest" || e.kind === "fine_no_place" || e.kind === "inspection_empty") {
        const [x, y] = at(d), [sx, sy] = q(x, y, LAND);
        const i0 = P.ops.length;
        lampRings(P, sx, sy, e.kind === "inspection_empty");
        G(i0, sx, sy);
        if (e.kind === "arrest") {
          const t = 0.5, px = x + (ANCHOR.prison[0] + 40 - x) * t, py = y + (ANCHOR.prison[1] + 40 - y) * t;
          const i1 = P.ops.length, w = q(px, py, LAND);
          wagon(P, px, py, ANCHOR.prison[0], ANCHOR.prison[1]);
          G(i1, w[0], w[1]);
        }
      }
    }
    for (const e of evs) {
      const d = e.district;
      if (e.kind === "fire" && e._p) {
        const [sx, sy] = e._p, i0 = P.ops.length;
        smoke(P, sx - 6, sy - 34, 5, 8, true);
        for (let i = 0; i < 4; i++) flame(P, sx - 18 + i * 12 + (er() - 0.5) * 3, sy + 2 - (i === 1 || i === 2 ? 4 : 0), 17 + er() * 9, i + er() * 6);
        G(i0, sx, sy);
      } else if (e.kind === "crime" && POLY[d]) {
        const [x, y] = at(d), [sx, sy] = q(x, y, LAND + 80), i0 = P.ops.length;
        smoke(P, sx + 8, sy + 46, 4, 6.5, false);
        flare(P, sx, sy, 13);
        G(i0, sx, sy + 50);
      } else if ((e.kind === "bribe_offer" || e.kind === "bribe_accepted" || e.kind === "bribe_refused") && POLY[d]) {
        const [x, y] = at(d), [sx, sy] = q(x, y, LAND + 36);
        const i0 = P.ops.length;
        coins(P, sx, sy, e.kind === "bribe_accepted" ? 3 : 1, e.kind === "bribe_refused");
        G(i0, sx, sy);
      } else if ((e.kind === "audit_caught" || e.kind === "audit_clean") && POLY[d]) {
        const [x, y] = at(d), [sx, sy] = q(x, y, LAND + 34);
        const i0 = P.ops.length;
        stamp(P, sx, sy, e.kind === "audit_caught");
        G(i0, sx, sy);
      }
    }
    if (storm) {
      // clouds and Lapis rain hatching over the Port
      const c = q(425, 250, LAND + 150);
      for (let k = 0; k < 2; k++) { // two scalloped clouds, screened Lapis with a key line
        const cx = c[0] - 70 + k * 120, cy = c[1] - k * 14, pts = [];
        for (let i = 0; i <= 24; i++) {
          const a = Math.PI + (i / 24) * Math.PI, rr = 1 + 0.18 * Math.abs(Math.sin(i * 1.3 + k));
          pts.push(cx + Math.cos(a) * 62 * rr, cy + Math.sin(a) * 24 * rr);
        }
        pts.push(cx + 62, cy + 6, cx - 62, cy + 6);
        P.poly(pts, [0.3, 0, 0, 0.06], { line: 0.8, wob: 0.6 });
        P.stroke([cx - 40, cy - 6, cx + 30, cy - 9], 0.6, [0.6, 0, 0, 0]);
      }
      for (let i = 0; i < 360; i++) {
        const x = c[0] - 130 + er() * 260, y = c[1] + 10 + er() * 250, l = 7 + er() * 7;
        P.stroke([x, y, x - l * 0.35, y + l], 0.55, [0.85, 0, 0, 0.1], { taper: true, wob: 0.1, ext: 0 });
      }
    }
  }

  function labels(P, st, closed, ts) {
    for (const d of DISTRICTS) {
      const [[lx, ly], [ex, ey]] = LABEL[d];
      const [sx, sy] = q(lx, ly, 0), [tx, ty] = q(ex, ey, LAND - 4);
      const txt = d + (closed(d) ? ", closed" : ""), size = 11 * ts;
      const w = textW(txt, (closed(d) ? "italic " : "") + size + "px " + SERIF) + 14 * ts, h = size * 1.5;
      P.stroke([tx, ty, sx, sy], 0.6, LINE, { taper: false });
      P.poly([sx - w / 2, sy - h / 2, sx + w / 2, sy - h / 2, sx + w / 2, sy + h / 2, sx - w / 2, sy + h / 2], closed(d) ? [0.12, 0, 0, 0] : [0, 0, 0, 0], { line: 0.7, wob: 0.15 });
      P.dot(sx - w / 2 + 5 * ts, sy, 2 * ts, FAM.has(d) ? K.fam : K.salt);
      P.text(txt, sx + 3.5 * ts, sy + size * 0.34, size, LINE, { italic: closed(d) });
    }
  }

  // the corner card: Day N, prison and treasury as small printed gauges
  function cartouche(P, st, lay) {
    const s = lay.cs, X = lay.cx, Y = lay.cy, wide = !lay.narrow;
    const W = wide ? 300 : 540, H = wide ? 196 : 150;
    const T = (x, y) => [X + x * s, Y + y * s];
    const R = (x, y, w, h) => { const a = T(x, y), b = T(x + w, y + h); return [a[0], a[1], b[0], a[1], b[0], b[1], a[0], b[1]]; };
    P.poly(R(0, 0, W, H), [0, 0, 0.03, 0], { wob: 0.3 });
    P.outline(R(0, 0, W, H), 1.6 * s, LINE);
    P.outline(R(5, 5, W - 10, H - 10), 0.6 * s, LINE);
    const tx = (str, x, y, size, ink, o) => { const p = T(x, y); P.text(str, p[0], p[1], size * s, ink || LINE, o); };
    const gx = wide ? 22 : 230, gy = wide ? 92 : 28, gw = wide ? 256 : 286;
    tx("TIDEWALL", 22, 32, 12, LINE, { align: "left" });
    tx("Day " + (st.day || 0), 22, wide ? 70 : 84, 34, [0.05, 0.85, 0.25, 0], { align: "left", italic: true });
    tx(st.live ? "Live: public facts only" : "After the run: secrets shown", 22, wide ? 182 : 116, 10, LINE, { align: "left", italic: true });
    // prison: 40 places, filled in Lapis
    const n = Math.max(0, Math.min(40, Math.round(st.prison || 0)));
    tx("Prison", gx, gy, 11, LINE, { align: "left" });
    tx(n + " of 40", gx + gw, gy, 11, LINE, { align: "right" });
    const cw = gw / 20;
    for (let i = 0; i < 40; i++) {
      const c = i % 20, rw = (i / 20) | 0, b = R(gx + c * cw + 0.8, gy + 6 + rw * (cw + 1), cw - 1.6, cw - 1.6);
      P.poly(b, i < n ? [0.95, 0, 0, 0.05] : [0, 0, 0.04, 0], { wob: 0.15 });
      if (i >= n) P.outline(b, 0.45 * s, LINE);
    }
    // treasury: an Ochre bar against a scale
    const t = Math.max(0, st.treasury || 0), top = Math.max(1000, Math.ceil(t / 500) * 500);
    const ty = gy + 6 + 2 * (cw + 1) + 22;
    tx("Treasury", gx, ty, 11, LINE, { align: "left" });
    tx(String(Math.round(st.treasury || 0)), gx + gw, ty, 11, LINE, { align: "right" });
    P.poly(R(gx, ty + 6, gw, 10), [0, 0, 0.03, 0], { wob: 0.1 });
    if (t > 0) P.poly(R(gx, ty + 6, (gw * t) / top, 10), [0.04, 0.1, 0.92, 0], { wob: 0.15 });
    P.outline(R(gx, ty + 6, gw, 10), 0.6 * s, LINE);
    for (let v = 0; v <= top; v += 250) { const a = T(gx + (gw * v) / top, ty + 16), b = T(gx + (gw * v) / top, ty + (v % 500 ? 19 : 21)); P.stroke([a[0], a[1], b[0], b[1]], 0.5 * s, LINE, { taper: false, wob: 0 }); }
  }

  /* ---------- printing: separations, screening, compositing ---------- */

  function mkCanvas(w, h, rf) { const c = document.createElement("canvas"); c.width = w; c.height = h; c.x = c.getContext("2d", rf ? { willReadFrequently: true } : undefined); return c; }
  function mkPath(p) {
    const path = new Path2D();
    path.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) path.lineTo(p[i], p[i + 1]);
    path.closePath();
    return path;
  }
  function replay(ops, a, b, x0, y0, x1, y1) {
    let ma = "", mb = "";
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      if (op.x1 < x0 || op.x0 > x1 || op.y1 < y0 || op.y0 > y1) continue;
      const m = op.ko ? "source-over" : "lighter";
      if (m !== ma) { a.globalCompositeOperation = m; ma = m; }
      if (op.t) {
        for (const c of op.b ? [a, b] : [a]) { c.font = op.font; c.textAlign = op.al; c.textBaseline = "alphabetic"; }
        a.fillStyle = op.a; a.fillText(op.t, op.x, op.y);
        if (op.b) { if (m !== mb) { b.globalCompositeOperation = m; mb = m; } b.fillStyle = op.b; b.fillText(op.t, op.x, op.y); }
        continue;
      }
      const path = op.path || (op.path = mkPath(op.p));
      a.fillStyle = op.a; a.fill(path);
      if (op.b) { if (m !== mb) { b.globalCompositeOperation = m; mb = m; } b.fillStyle = op.b; b.fill(path); }
    }
  }

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const now = () => performance.now();

  function mount(el, opts) {
    opts = opts || {};
    const citySeed = strHash(String(opts.seed || "tidewall"));
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Map of Tidewall");
    cv.tabIndex = 0;
    cv.style.cssText = "display:block;width:100%;touch-action:none;cursor:grab;background:rgb(246,237,215);border-radius:4px;outline-offset:2px";
    el.appendChild(cv);
    const ctx = cv.getContext("2d");
    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1, lay = null, cam = { x: 600, y: 450, z: 1 };
    let state = null, ops = null, mis = INKS.map(() => [0, 0]), base = null, detail = null, hl = [];
    let slide = null, fly = null, raf = 0, settle = 0, lastInput = now(), visible = true, dead = false;
    let SA = null, SB = null;
    const ptrs = new Map();
    let downAt = null, pinchD = 0, pinchM = null, lastTap = { t: -1, x: 0, y: 0 };
    const tour = { i: -1, next: 0 };

    function layoutFor(w) {
      const narrow = w < 560;
      return narrow
        ? { narrow, sw: 1200, sh: 1170, ts: 2.1, cs: 2.06, cx: 44, cy: 840 }
        : { narrow, sw: 1200, sh: 860, ts: 1, cs: 1, cx: 22, cy: 20 };
    }
    const fitCam = () => ({ x: lay.sw / 2, y: lay.sh / 2, z: Math.min(W / lay.sw, H / lay.sh) });
    const minZ = () => fitCam().z * 0.9, maxZ = () => fitCam().z * 9;
    const atFit = (c) => { const f = fitCam(); return Math.abs(c.z / f.z - 1) < 0.01 && Math.abs(c.x - f.x) * c.z < 1 && Math.abs(c.y - f.y) * c.z < 1; };
    const same = (a, b) => a && b && a.z === b.z && a.x === b.x && a.y === b.y;

    function resize() {
      const w = Math.max(200, el.clientWidth | 0);
      const L = layoutFor(w), wasFit = !lay || atFit(cam), relayout = !lay || L.narrow !== lay.narrow;
      lay = L; W = w; H = Math.round((w * lay.sh) / lay.sw);
      // cap DPR at 2, and keep a phone or a big screen under about 2.6M device pixels
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1, Math.sqrt(2.6e6 / (W * H))));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + "px";
      if (wasFit || relayout) cam = fitCam();
      clampCam();
      if (state) { if (relayout) ops = build(state, citySeed, daySeed(), lay); reprint(false); }
      else draw();
    }
    const daySeed = () => hash3(citySeed, (state && state.day) | 0, 101);

    // print the view of camera c: separations, screen, planes, composite
    function print(c) {
      const t0 = now();
      const p = c.z * dpr, Wd = cv.width, Hd = cv.height, M = Math.ceil(22 * dpr);
      const w = Wd + 2 * M, h = Hd + 2 * M;
      const x0 = c.x - W / 2 / c.z - M / p, y0 = c.y - H / 2 / c.z - M / p;
      if (!SA || SA.width < w || SA.height < h) { SA = mkCanvas(w, h, true); SB = mkCanvas(w, h, true); }
      for (const s of [SA, SB]) { s.x.setTransform(1, 0, 0, 1, 0, 0); s.x.globalCompositeOperation = "source-over"; s.x.fillStyle = "#000"; s.x.fillRect(0, 0, w, h); s.x.setTransform(p, 0, 0, p, -x0 * p, -y0 * p); }
      replay(ops, SA.x, SB.x, x0, y0, x0 + w / p, y0 + h / p);
      const A = SA.x.getImageData(0, 0, w, h).data, B = SB.x.getImageData(0, 0, w, h).data;
      const imgs = [0, 1, 2, 3, 4].map(() => new ImageData(w, h));
      screen(A, B, w, h, x0, y0, p, imgs.map((d) => new Uint32Array(d.data.buffer)));
      const planes = imgs.map((d) => { const k = mkCanvas(w, h); k.x.putImageData(d, 0, 0); return k; });
      const pr = { cam: { ...c }, p, M, w, h, x0, y0, planes, comp: mkCanvas(w, h) };
      composite(pr.comp.x, pr, finalOffsets(pr), 0, 0, w, h);
      pr.ms = now() - t0;
      map.lastPrintMs = pr.ms;
      return pr;
    }
    const finalOffsets = (pr) => mis.map((o) => [o[0] * pr.p, o[1] * pr.p]);
    function composite(g, pr, offs, dx, dy, dw, dh) {
      const s = dw / pr.w;
      g.globalCompositeOperation = "source-over";
      g.drawImage(pr.planes[0], dx, dy, dw, dh);
      g.globalCompositeOperation = "multiply";
      for (let k = 0; k < 4; k++) g.drawImage(pr.planes[k + 1], dx + offs[k][0] * s, dy + offs[k][1] * s, dw, dh);
      g.globalCompositeOperation = "source-over";
    }

    function reprint(withSlide) {
      if (!ops) return;
      const f = fitCam();
      base = print(f);
      detail = atFit(cam) ? null : print(cam);
      if (withSlide && !reduced) {
        const rr = mulberry(daySeed() ^ 77);
        slide = { t0: now(), from: INKS.map((_, k) => (k === 0 ? [0, 0] : [(rr() - 0.5) * 28 * dpr, (rr() - 0.5) * 28 * dpr])) };
      }
      kick();
    }
    function reprintDetail() {
      if (!ops || fly || ptrs.size) return;
      if (atFit(cam)) { detail = null; cam = fitCam(); }
      else if (!same(detail && detail.cam, cam)) detail = print(cam);
      kick();
    }
    function scheduleSettle(ms) { clearTimeout(settle); settle = setTimeout(reprintDetail, ms == null ? 180 : ms); }

    function blit(pr, sliding) {
      const s = cam.z / pr.cam.z;
      const dx = ((pr.x0 - cam.x) * cam.z + W / 2) * dpr, dy = ((pr.y0 - cam.y) * cam.z + H / 2) * dpr;
      if (sliding) {
        const k = Math.min(1, (now() - slide.t0) / 420), e = 1 - Math.pow(1 - k, 3), fo = finalOffsets(pr);
        composite(ctx, pr, fo.map((o, i) => [o[0] + slide.from[i][0] * (1 - e), o[1] + slide.from[i][1] * (1 - e)]), dx, dy, pr.w * s, pr.h * s);
        if (k >= 1) slide = null;
      } else ctx.drawImage(pr.comp, dx, dy, pr.w * s, pr.h * s);
    }
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgb(246,237,215)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      const top = detail || base;
      if (base && top !== base && !same(detail.cam, cam)) blit(base, false);
      if (top) blit(top, !!slide);
      if (hl.length) drawHighlight();
    }
    function drawHighlight() {
      ctx.save();
      ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, dpr * (W / 2 - cam.x * cam.z), dpr * (H / 2 - cam.y * cam.z));
      ctx.globalCompositeOperation = "multiply";
      for (const d of hl) {
        if (!POLY[d]) continue;
        const pts = qp(POLY[d], LAND);
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, pts[i], pts[i + 1]);
        ctx.closePath();
        ctx.fillStyle = "rgba(33,50,122,0.16)";
        ctx.fill();
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(33,50,122,0.9)";
        ctx.lineWidth = 2.6 / cam.z;
        ctx.setLineDash([7 / cam.z, 4 / cam.z]);
        ctx.stroke();
      }
      ctx.restore();
    }

    function frame() {
      raf = 0;
      if (dead) return;
      stepFly();
      draw();
      if (fly || slide) kick();
    }
    function kick() { if (!raf && !dead) raf = requestAnimationFrame(frame); }

    function clampCam() {
      if (!lay) return;
      cam.z = Math.max(minZ(), Math.min(maxZ(), cam.z));
      const hw = W / 2 / cam.z, hh = H / 2 / cam.z;
      const fx = (a, b) => (a > b ? (a + b) / 2 : null);
      const lx = hw, rx = lay.sw - hw, ty = hh, by = lay.sh - hh;
      cam.x = fx(lx, rx) != null ? lay.sw / 2 : Math.max(lx, Math.min(rx, cam.x));
      cam.y = fx(ty, by) != null ? lay.sh / 2 : Math.max(ty, Math.min(by, cam.y));
    }
    function zoomAt(sx, sy, f) {
      const z1 = Math.max(minZ(), Math.min(maxZ(), cam.z * f));
      const wx = (sx - W / 2) / cam.z + cam.x, wy = (sy - H / 2) / cam.z + cam.y;
      cam.z = z1; cam.x = wx - (sx - W / 2) / z1; cam.y = wy - (sy - H / 2) / z1;
      clampCam(); kick();
    }
    function flyTo(t, dur, who) {
      const z0 = cam.z, d = (Math.hypot(t.x - cam.x, t.y - cam.y) * Math.min(z0, t.z)) / Math.max(W, H);
      fly = { a: { ...cam }, b: t, t0: now(), dur: (reduced ? 0.25 : dur || 1.6) * 1000, bump: Math.max(0, Math.log(1 + d) * 0.6), who: who || "user" };
      kick();
    }
    function stepFly() {
      if (!fly) return;
      const k = Math.min(1, (now() - fly.t0) / fly.dur), e = ease(k);
      const la = Math.log(fly.a.z), lb = Math.log(fly.b.z);
      cam.z = Math.exp(la + (lb - la) * e - fly.bump * 4 * e * (1 - e));
      cam.x = fly.a.x + (fly.b.x - fly.a.x) * e; cam.y = fly.a.y + (fly.b.y - fly.a.y) * e;
      if (k >= 1) { cam = { ...fly.b }; fly = null; scheduleSettle(60); }
    }
    function districtView(d) {
      const pts = qp(POLY[d], LAND).concat(qp(POLY[d], LAND + 60));
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
      const z = Math.min(maxZ(), W / ((x1 - x0) * 1.5), H / ((y1 - y0) * 1.6));
      const c = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z };
      const keep = cam; cam = c; clampCam(); const out = cam; cam = keep;
      return out;
    }
    function districtAtScreen(sx, sy) {
      const wx = (sx - W / 2) / cam.z + cam.x, wy = (sy - H / 2) / cam.z + cam.y;
      // try a few heights so a tap on a roof still finds its district
      for (const z of [LAND + 20, LAND, LAND + 40]) {
        const a = (wx - OX) / (C30 * SC), b = ((wy - OY) / SC + z) * 2;
        const d = districtAt((a + b) / 2, (b - a) / 2);
        if (d) return d;
      }
      return null;
    }
    function user() {
      lastInput = now();
      tour.i = -1;
      if (fly && fly.who === "tour") { fly = null; scheduleSettle(); }
    }
    const local = (e) => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };

    // at the fitted view a one-finger vertical drag scrolls the page instead of the map
    const touchMode = () => { cv.style.touchAction = atFit(cam) ? "pan-y" : "none"; };

    function onDown(e) {
      cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
      const p = local(e);
      ptrs.set(e.pointerId, p);
      user(); fly = null;
      if (ptrs.size === 1) downAt = { x: p.x, y: p.y, t: now() };
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinchD = Math.hypot(a.x - b.x, a.y - b.y); pinchM = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; downAt = null; }
      cv.style.cursor = "grabbing";
    }
    function onMove(e) {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      const n = local(e), dx = n.x - p.x, dy = n.y - p.y;
      p.x = n.x; p.y = n.y;
      if (ptrs.size === 1) {
        if (downAt && Math.hypot(n.x - downAt.x, n.y - downAt.y) < 4) return;
        cam.x -= dx / cam.z; cam.y -= dy / cam.z; clampCam();
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (pinchD > 0) zoomAt(m.x, m.y, d / pinchD);
        cam.x -= (m.x - pinchM.x) / cam.z; cam.y -= (m.y - pinchM.y) / cam.z; clampCam();
        pinchD = d; pinchM = m;
      }
      lastInput = now();
      kick();
    }
    function onUp(e) {
      if (!ptrs.has(e.pointerId)) return;
      const p = ptrs.get(e.pointerId);
      ptrs.delete(e.pointerId);
      const T = now();
      if (downAt && ptrs.size === 0 && e.type === "pointerup") {
        const moved = Math.hypot(p.x - downAt.x, p.y - downAt.y);
        if (moved < 8 && T - downAt.t < 350) {
          const d = districtAtScreen(p.x, p.y);
          if (e.pointerType !== "mouse" && T - lastTap.t < 350 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 40) { dbl(p.x, p.y); lastTap.t = -1; }
          else { lastTap = { t: T, x: p.x, y: p.y }; if (d && opts.onDistrict) opts.onDistrict(d); }
        }
      }
      if (ptrs.size === 1) { downAt = null; pinchD = 0; }
      if (!ptrs.size) { downAt = null; cv.style.cursor = "grab"; scheduleSettle(); touchMode(); }
    }
    function dbl(x, y) {
      user();
      const d = districtAtScreen(x, y);
      if (d) flyTo(districtView(d), 1.4, "user");
      else { const f = fitCam(); flyTo(atFit(cam) ? { x: (x - W / 2) / cam.z + cam.x, y: (y - H / 2) / cam.z + cam.y, z: f.z * 2.5 } : f, 1.1, "user"); }
    }
    function onWheel(e) {
      e.preventDefault(); user(); fly = null;
      const k = e.deltaMode === 1 ? 0.06 : e.deltaMode === 2 ? 0.5 : 0.0018, p = local(e);
      zoomAt(p.x, p.y, Math.exp(-e.deltaY * k * (e.ctrlKey ? 2.5 : 1)));
      scheduleSettle(); touchMode();
    }
    function onDbl(e) { const p = local(e); dbl(p.x, p.y); }
    function onKey(e) {
      const t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      if (e.key === "0") { user(); flyTo(fitCam(), 0.9, "user"); e.preventDefault(); return; }
      if (t !== cv) return;
      if (e.key === "+" || e.key === "=") { user(); flyTo({ ...cam, z: Math.min(maxZ(), cam.z * 1.5) }, 0.35, "user"); }
      else if (e.key === "-" || e.key === "_") { user(); flyTo({ ...cam, z: Math.max(minZ(), cam.z / 1.5) }, 0.35, "user"); }
      else return;
      e.preventDefault();
    }

    // idle tour: after 8 s without input, visit each district, then the whole sheet
    const tourTimer = setInterval(() => {
      if (!state || !visible || document.hidden || reduced || ptrs.size) return;
      const T = now();
      if (T - lastInput < 8000 || (fly && fly.who !== "tour")) return;
      if (tour.i >= 0 && T < tour.next) return;
      tour.i = (tour.i + 1) % (DISTRICTS.length + 1);
      if (tour.i === DISTRICTS.length) { flyTo(fitCam(), 1.8, "tour"); tour.next = T + 1800 + 6000; }
      else { flyTo(districtView(DISTRICTS[tour.i]), 1.8, "tour"); tour.next = T + 1800 + 4500; }
      touchMode();
    }, 400);

    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("dblclick", onDbl);
    cv.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { if (el.clientWidth && Math.abs(el.clientWidth - W) > 1) resize(); }) : null;
    if (ro) ro.observe(el); else window.addEventListener("resize", resize);
    const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; }) : null;
    if (io) io.observe(cv);

    function describe(st) {
      const by = (k) => st.events.filter((e) => e.kind === k);
      const where = (list) => [...new Set(list.map((e) => e.district).filter(Boolean))].join(", ");
      const parts = [`Map of Tidewall, day ${st.day}.`];
      const shut = DISTRICTS.filter((d) => !(st.open || DISTRICTS).includes(d));
      parts.push(shut.length ? `Closed: ${shut.join(", ")}.` : "All districts open.");
      if (st.nature && st.nature.storm) parts.push("Storm over the Port.");
      const fire = by("fire")[0] || (st.nature && st.nature.fire ? { district: st.nature.fire } : null);
      if (fire) parts.push(`Fire in ${fire.district}.`);
      if ((st.nature && st.nature.ship) || by("ship").length) parts.push("A ship enters the harbour.");
      if ((st.nature && st.nature.strike) || by("strike").length) parts.push("Strike at the Council house.");
      for (const [k, w] of [["crime", "Crime"], ["arrest", "Arrests"], ["bribe_accepted", "Bribes taken"], ["bribe_offer", "Bribes offered"], ["inspection_empty", "Empty inspections"]]) {
        const l = by(k);
        if (l.length) parts.push(`${w} in ${where(l)}.`);
      }
      if (st.turf) parts.push(`Turf: Families ${st.turf.Families === "encroach" ? "encroached" : "respected"}, Saltdogs ${st.turf.Saltdogs === "encroach" ? "encroached" : "respected"}.`);
      parts.push(`Prison ${st.prison || 0} of 40. Treasury ${st.treasury || 0}.`);
      return parts.join(" ");
    }

    const map = {
      lastPrintMs: 0,
      update(st) {
        if (dead) return;
        state = Object.assign({ day: 0, open: DISTRICTS, nature: {}, events: [], turf: null, prison: 0, treasury: 0, live: false }, st || {});
        if (!state.turf) { const t = state.events.find((e) => e.kind === "turf"); if (t) state.turf = t.detail; }
        const rr = mulberry(daySeed() ^ 0x5eed);
        mis = INKS.map((k) => [k.o[0] * 1.2 + (k.n === "Lapis" ? 0 : (rr() - 0.5) * 0.7), k.o[1] * 1.2 + (k.n === "Lapis" ? 0 : (rr() - 0.5) * 0.7)]);
        cv.setAttribute("aria-label", describe(state));
        const t0 = now();
        ops = build(state, citySeed, daySeed(), lay);
        map.lastBuildMs = now() - t0;
        reprint(true);
        map.lastUpdateMs = now() - t0;
      },
      highlight(names) { hl = (names || []).filter((d) => POLY[d]); draw(); },
      fit() { user(); flyTo(fitCam(), 0.9, "user"); },
      destroy() {
        dead = true;
        clearInterval(tourTimer); clearTimeout(settle);
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("keydown", onKey);
        if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
        if (io) io.disconnect();
        cv.remove();
        base = detail = SA = SB = ops = null;
      },
      // for tests: the camera and a flight to one district
      get camera() { return { ...cam }; },
      flyTo(d) { user(); if (POLY[d]) flyTo(districtView(d), 0.01, "user"); },
      zoom(f, sx, sy) { user(); zoomAt(sx == null ? W / 2 : sx, sy == null ? H / 2 : sy, f); scheduleSettle(0); touchMode(); },
    };
    resize();
    touchMode();
    return map;
  }

  window.TidewallMap = { mount, DISTRICTS };
})();
