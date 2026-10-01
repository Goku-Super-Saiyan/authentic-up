// Generative artwork for each craft, drawn from that craft's own motifs.
// Stands in for product photography until real listings have photos.

type Ctx = CanvasRenderingContext2D;
type Rand = () => number;
export type ArtKind =
  | "saree" | "carpet" | "chikan" | "bangles" | "brass" | "attar"
  | "pottery" | "inlay" | "wood" | "zardozi" | "dari" | "terracotta";

export function rng(seed: number): Rand {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buta(c: Ctx, x: number, y: number, s: number, col: string, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath();
  c.moveTo(0, -s); c.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.85, s * 0.7, 0, s * 0.8);
  c.bezierCurveTo(-s * 0.85, s * 0.7, -s * 0.7, -s * 0.05, -s * 0.1, -s * 0.25);
  c.bezierCurveTo(s * 0.2, -s * 0.45, s * 0.15, -s * 0.8, 0, -s); c.fill();
  c.beginPath(); c.arc(-s * 0.05, s * 0.25, s * 0.18, 0, 7); c.fillStyle = "rgba(0,0,0,.25)"; c.fill();
  c.restore();
}
function star(c: Ctx, x: number, y: number, n: number, r1: number, r2: number, rot = 0) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / n;
    c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
  }
  c.closePath();
}
function flower(c: Ctx, x: number, y: number, r: number, petal: string, centre: string, n = 6, rot = 0) {
  c.fillStyle = petal;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n;
    c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.25, a, 0, 7); c.fill();
  }
  c.beginPath(); c.arc(x, y, r * 0.2, 0, 7); c.fillStyle = centre; c.fill();
}

const ART: Record<ArtKind, (c: Ctx, w: number, h: number, R: Rand) => void> = {
  saree(c, w, h) {
    c.fillStyle = "#5E0F2C"; c.fillRect(0, 0, w, h);
    const g = "#D9A441", step = Math.max(26, w / 9);
    for (let y = step * 0.6, row = 0; y < h * 0.7; y += step, row++)
      for (let x = row % 2 ? step : step / 2; x < w; x += step) buta(c, x, y, step * 0.26, g, row % 2 ? 0.3 : -0.3);
    const by = h * 0.72; c.fillStyle = "#3A081C"; c.fillRect(0, by, w, h - by);
    c.fillStyle = g; c.fillRect(0, by, w, 3); c.fillRect(0, by + 9, w, 1.5); c.fillRect(0, h - 10, w, 2);
    const k = step * 0.5;
    for (let x = 0; x < w + k; x += k) { c.beginPath(); c.moveTo(x, by + 14); c.lineTo(x + k / 2, by + 14 + k * 0.7); c.lineTo(x + k, by + 14); c.fill(); }
    for (let x = step * 0.5; x < w; x += step * 0.9) buta(c, x, by + (h - by) * 0.66, step * 0.36, g, 0);
    c.fillStyle = "rgba(255,240,200,.05)"; for (let i = 0; i < w; i += 3) c.fillRect(i, 0, 1, h);
  },
  carpet(c, w, h) {
    const red = "#8E1B1B", ind = "#1D2B5A", cream = "#E9DCC0", gold = "#D2A04C";
    c.fillStyle = ind; c.fillRect(0, 0, w, h);
    const b = Math.min(w, h) * 0.11;
    c.fillStyle = cream; c.fillRect(b - 4, b - 4, w - 2 * b + 8, h - 2 * b + 8);
    c.fillStyle = red; c.fillRect(b, b, w - 2 * b, h - 2 * b);
    c.fillStyle = cream;
    for (let x = b / 2; x < w; x += b * 0.8) { star(c, x, b / 2, 4, b * 0.28, b * 0.1); c.fill(); star(c, x, h - b / 2, 4, b * 0.28, b * 0.1); c.fill(); }
    for (let y = b * 1.3; y < h - b; y += b * 0.8) { star(c, b / 2, y, 4, b * 0.28, b * 0.1); c.fill(); star(c, w - b / 2, y, 4, b * 0.28, b * 0.1); c.fill(); }
    for (let y = b * 1.5; y < h - b * 1.2; y += b * 0.7) for (let x = b * 1.5; x < w - b * 1.2; x += b * 0.7) flower(c, x, y, b * 0.22, "rgba(233,220,192,.32)", gold, 4, 0.78);
    const cx = w / 2, cy = h / 2, m = Math.min(w, h) * 0.3;
    c.fillStyle = ind; star(c, cx, cy, 16, m, m * 0.78); c.fill();
    c.fillStyle = cream; star(c, cx, cy, 8, m * 0.66, m * 0.46, Math.PI / 8); c.fill();
    c.fillStyle = red; c.beginPath(); c.arc(cx, cy, m * 0.36, 0, 7); c.fill();
    flower(c, cx, cy, m * 0.3, gold, ind, 8);
    const corners: [number, number][] = [[b, b], [w - b, b], [b, h - b], [w - b, h - b]];
    c.fillStyle = ind; corners.forEach(([x, y]) => { c.beginPath(); c.arc(x, y, m * 0.45, 0, 7); c.fill(); });
    c.fillStyle = cream; corners.forEach(([x, y]) => { c.beginPath(); c.arc(x, y, m * 0.2, 0, 7); c.fill(); });
  },
  chikan(c, w, h, R) {
    c.fillStyle = "#CFE2D9"; c.fillRect(0, 0, w, h);
    for (let v = 0; v < 3; v++) {
      const x0 = w * (0.2 + v * 0.3), amp = w * 0.08, ph = R() * 6;
      c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 1.6; c.setLineDash([2, 3]); c.beginPath();
      for (let y = 0; y <= h; y += 4) c.lineTo(x0 + Math.sin((y / h) * 7 + ph) * amp, y);
      c.stroke(); c.setLineDash([]);
      for (let y = h * 0.08; y < h; y += h * 0.17) {
        const x = x0 + Math.sin((y / h) * 7 + ph) * amp;
        flower(c, x, y, w * 0.07, "rgba(255,255,255,.95)", "#CFE2D9", 6, R());
        c.fillStyle = "rgba(255,255,255,.85)";
        c.beginPath(); c.ellipse(x + w * 0.06, y + h * 0.06, w * 0.035, w * 0.013, 0.7, 0, 7); c.fill();
        c.beginPath(); c.ellipse(x - w * 0.06, y + h * 0.07, w * 0.035, w * 0.013, -0.7, 0, 7); c.fill();
      }
    }
    c.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 70; i++) { c.beginPath(); c.arc(R() * w, R() * h, 1, 0, 7); c.fill(); }
  },
  bangles(c, w, h) {
    const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#22296B"); bg.addColorStop(1, "#141846");
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    const cols = ["#E63946", "#F4A261", "#2A9D8F", "#E9C46A", "#B5179E", "#4CC9F0", "#F72585", "#E9C46A"];
    const rx = w * 0.34, ry = h * 0.085;
    for (let i = 0; i < 9; i++) {
      const y = h * 0.24 + i * h * 0.065;
      c.lineWidth = Math.max(5, w * 0.035); c.strokeStyle = cols[i % cols.length];
      c.beginPath(); c.ellipse(w / 2, y, rx, ry, 0, 0, 7); c.stroke();
      c.lineWidth = 1.2; c.strokeStyle = "rgba(255,255,255,.65)";
      c.beginPath(); c.ellipse(w / 2, y - 2, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
      c.fillStyle = "rgba(255,230,160,.9)";
      for (let a = 0; a < 7; a += 0.5) { c.beginPath(); c.arc(w / 2 + Math.cos(a) * rx, y + Math.sin(a) * ry, 1.1, 0, 7); c.fill(); }
    }
  },
  brass(c, w, h) {
    c.fillStyle = "#2B1D14"; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.4;
    const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, "#F7D57D"); g.addColorStop(0.6, "#CF9A35"); g.addColorStop(1, "#8A5A17");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
    c.strokeStyle = "rgba(80,45,8,.75)"; c.lineWidth = 1.2;
    [0.95, 0.88, 0.62, 0.55, 0.3].forEach((f) => { c.beginPath(); c.arc(cx, cy, r * f, 0, 7); c.stroke(); });
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      c.save(); c.translate(cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r * 0.75); c.rotate(a);
      c.beginPath(); c.ellipse(0, 0, r * 0.11, r * 0.045, 0, 0, 7); c.stroke(); c.restore();
    }
    for (let i = 0; i < 48; i++) {
      const a = (i * Math.PI) / 24;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.88, cy + Math.sin(a) * r * 0.88); c.lineTo(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95); c.stroke();
    }
    star(c, cx, cy, 8, r * 0.28, r * 0.14); c.stroke();
  },
  attar(c, w, h, R) {
    const bg = c.createLinearGradient(0, 0, w, h); bg.addColorStop(0, "#4A1838"); bg.addColorStop(1, "#24091C");
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 22; i++) {
      c.fillStyle = `rgba(240,120,150,${0.25 + R() * 0.4})`;
      c.beginPath(); c.ellipse(R() * w, h * 0.6 + R() * h * 0.4, w * 0.04, w * 0.022, R() * 3, 0, 7); c.fill();
    }
    const cx = w / 2, by = h * 0.78, bw = w * 0.26, bh = h * 0.38;
    const gl = c.createLinearGradient(cx - bw, 0, cx + bw, 0);
    gl.addColorStop(0, "#F2A7B9"); gl.addColorStop(0.45, "#FFE1C2"); gl.addColorStop(1, "#C9566F");
    c.fillStyle = gl; c.beginPath();
    c.moveTo(cx - bw * 0.3, by - bh); c.lineTo(cx + bw * 0.3, by - bh); c.lineTo(cx + bw, by - bh * 0.55);
    c.lineTo(cx + bw * 0.8, by); c.lineTo(cx - bw * 0.8, by); c.lineTo(cx - bw, by - bh * 0.55); c.closePath(); c.fill();
    c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1; c.beginPath();
    c.moveTo(cx, by - bh); c.lineTo(cx, by); c.moveTo(cx - bw, by - bh * 0.55); c.lineTo(cx + bw, by - bh * 0.55); c.stroke();
    c.fillStyle = "#D9A441"; c.fillRect(cx - bw * 0.18, by - bh - h * 0.05, bw * 0.36, h * 0.05);
    c.beginPath(); c.moveTo(cx, by - bh - h * 0.22);
    c.bezierCurveTo(cx + bw * 0.4, by - bh - h * 0.12, cx + bw * 0.2, by - bh - h * 0.05, cx, by - bh - h * 0.05);
    c.bezierCurveTo(cx - bw * 0.2, by - bh - h * 0.05, cx - bw * 0.4, by - bh - h * 0.12, cx, by - bh - h * 0.22); c.fill();
  },
  pottery(c, w, h) {
    c.fillStyle = "#D9CDBB"; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.58, r = Math.min(w, h) * 0.3;
    c.fillStyle = "#151313"; c.fillRect(cx - r * 0.32, cy - r * 1.45, r * 0.64, r * 0.7);
    c.beginPath(); c.ellipse(cx, cy - r * 1.45, r * 0.45, r * 0.1, 0, 0, 7); c.fill();
    const g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    g.addColorStop(0, "#4A4646"); g.addColorStop(1, "#0E0D0D");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
    c.fillStyle = "#151313"; c.fillRect(cx - r * 0.4, cy + r * 0.9, r * 0.8, r * 0.2);
    c.strokeStyle = "#C9CED6"; c.lineWidth = 1.5; c.beginPath();
    for (let i = 0; i <= 16; i++) c.lineTo(cx - r * 0.92 + i * r * 0.115, cy - r * 0.1 + (i % 2 ? -r * 0.12 : r * 0.12));
    c.stroke();
    c.beginPath(); c.ellipse(cx, cy - r * 0.3, r * 0.95, r * 0.1, 0, 0.15, Math.PI - 0.15, false); c.stroke();
    for (let i = -2; i <= 2; i++) flower(c, cx + i * r * 0.36, cy + r * 0.4, r * 0.14, "#C9CED6", "#151313", 5);
    c.beginPath(); c.moveTo(cx - r * 0.32, cy - r * 1.2); c.lineTo(cx + r * 0.32, cy - r * 1.2); c.stroke();
  },
  inlay(c, w, h, R) {
    c.fillStyle = "#F1EEE8"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(120,120,130,.18)"; c.lineWidth = 1;
    for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(R() * w, 0); c.bezierCurveTo(R() * w, h * 0.3, R() * w, h * 0.7, R() * w, h); c.stroke(); }
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.4;
    c.strokeStyle = "#1A1A1A"; c.lineWidth = 2.5; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 + Math.PI / 8; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    c.closePath(); c.stroke();
    const cols = ["#B23A48", "#2B4C9B", "#D9A441", "#2E8B57"];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      c.strokeStyle = "#2E8B57"; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy);
      c.quadraticCurveTo(cx + Math.cos(a + 0.4) * r * 0.5, cy + Math.sin(a + 0.4) * r * 0.5, cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7); c.stroke();
      flower(c, cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7, r * 0.16, cols[i], "#D9A441", 5);
      c.fillStyle = "#2E8B57"; c.beginPath();
      c.ellipse(cx + Math.cos(a + 0.3) * r * 0.42, cy + Math.sin(a + 0.3) * r * 0.42, r * 0.09, r * 0.035, a + 1, 0, 7); c.fill();
    }
    flower(c, cx, cy, r * 0.3, "#B23A48", "#D9A441", 8);
    flower(c, cx, cy, r * 0.15, "#2B4C9B", "#F1EEE8", 6, 0.3);
  },
  wood(c, w, h) {
    c.fillStyle = "#7A4A26"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(40,20,5,.25)"; c.lineWidth = 1;
    for (let y = 0; y < h; y += 5) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin(x / 30 + y / 17) * 2.5); c.stroke(); }
    const s = Math.max(30, w / 6);
    c.fillStyle = "#2E1909";
    for (let y = s / 2; y < h; y += s) for (let x = s / 2; x < w; x += s) { star(c, x, y, 8, s * 0.36, s * 0.2); c.fill(); }
    c.fillStyle = "#9C6534";
    for (let y = s / 2; y < h; y += s) for (let x = s / 2; x < w; x += s) { c.beginPath(); c.arc(x, y, s * 0.1, 0, 7); c.fill(); }
    c.fillStyle = "#2E1909";
    for (let y = s; y < h; y += s) for (let x = s; x < w; x += s) { c.beginPath(); c.arc(x, y, s * 0.07, 0, 7); c.fill(); }
  },
  zardozi(c, w, h, R) {
    const bg = c.createRadialGradient(w * 0.4, h * 0.4, 10, w / 2, h / 2, w);
    bg.addColorStop(0, "#1E3160"); bg.addColorStop(1, "#0C1430");
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    for (let ring = 1; ring <= 5; ring++) {
      const r = ring * Math.min(w, h) * 0.075, n = ring * 14;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 7;
        c.fillStyle = ring % 2 ? "#E8BE5C" : "#F6E3A8";
        c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, ring % 2 ? 2.2 : 1.4, 0, 7); c.fill();
      }
    }
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, r = Math.min(w, h) * 0.43;
      buta(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.min(w, h) * 0.06, "#E8BE5C", a + Math.PI / 2);
    }
    for (let i = 0; i < 40; i++) {
      const x = R() * w, y = R() * h;
      c.fillStyle = "#E8BE5C"; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill();
      c.fillStyle = "#FFF6D8"; c.beginPath(); c.arc(x - 0.8, y - 0.8, 0.9, 0, 7); c.fill();
    }
  },
  dari(c, w, h) {
    const cols = ["#E07A1F", "#1F3A68", "#F2E3C6", "#A61C3C", "#F2E3C6", "#1F3A68"];
    const band = h / 9;
    for (let i = 0; i < 9; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(0, i * band, w, band + 1); }
    for (let i = 0; i < 9; i += 2) {
      c.fillStyle = cols[(i + 3) % cols.length];
      const y = i * band + band * 0.2, k = band * 0.6;
      c.beginPath(); c.moveTo(0, y + k);
      for (let x = 0; x <= w + k; x += k) { c.lineTo(x + k / 2, y); c.lineTo(x + k, y + k); }
      c.lineTo(w, y + k); c.closePath(); c.fill();
    }
    c.fillStyle = "rgba(0,0,0,.08)"; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 1.5, h);
  },
  terracotta(c, w, h) {
    c.fillStyle = "#EADBC6"; c.fillRect(0, 0, w, h);
    const t = "#B5562C", d = "#7A3416", u = Math.min(w, h) / 10, cx = w / 2 - u * 0.4, cy = h * 0.55;
    c.fillStyle = t;
    c.beginPath(); c.ellipse(cx, cy, u * 2.6, u * 1.2, 0, 0, 7); c.fill();
    [-1.8, -0.8, 0.8, 1.8].forEach((dx) => {
      c.beginPath(); c.moveTo(cx + dx * u - u * 0.35, cy + u * 0.6); c.lineTo(cx + dx * u - u * 0.25, cy + u * 3.4);
      c.lineTo(cx + dx * u + u * 0.25, cy + u * 3.4); c.lineTo(cx + dx * u + u * 0.35, cy + u * 0.6); c.fill();
    });
    c.beginPath(); c.moveTo(cx + u * 1.6, cy - u * 0.5); c.lineTo(cx + u * 2.4, cy - u * 3.4); c.lineTo(cx + u * 3.3, cy - u * 3.2); c.lineTo(cx + u * 2.6, cy + u * 0.3); c.fill();
    c.beginPath(); c.ellipse(cx + u * 3.1, cy - u * 3.4, u, u * 0.45, 0.5, 0, 7); c.fill();
    c.beginPath(); c.moveTo(cx + u * 2.5, cy - u * 3.8); c.lineTo(cx + u * 2.7, cy - u * 4.7); c.lineTo(cx + u * 2.9, cy - u * 3.8); c.fill();
    c.beginPath(); c.moveTo(cx - u * 2.5, cy - u * 0.2); c.quadraticCurveTo(cx - u * 3.6, cy + u * 0.4, cx - u * 3.2, cy + u * 2);
    c.lineWidth = u * 0.3; c.strokeStyle = t; c.stroke();
    c.fillStyle = d; for (let i = -4; i <= 4; i++) { c.beginPath(); c.arc(cx + i * u * 0.5, cy - u * 0.2 + Math.abs(i) * u * 0.06, u * 0.12, 0, 7); c.fill(); }
    c.strokeStyle = d; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, cy + u * 0.3, u * 1.6, u * 0.5, 0, 0, Math.PI); c.stroke();
    c.fillStyle = d; c.beginPath(); c.arc(cx + u * 3.4, cy - u * 3.5, u * 0.12, 0, 7); c.fill();
  },
};

export function paintCraft(canvas: HTMLCanvasElement, kind: ArtKind, seed: number) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const c = canvas.getContext("2d"); if (!c) return;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  ART[kind](c, w, h, rng(seed));
}
