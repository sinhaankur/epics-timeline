/* story-scene.js — original animated story scenes in the reverent, painterly
 * spirit of classical Indian art (and the 1992 "Ramayana: Legend of Prince
 * Rama"). NOT copied frames — every shape here is my own geometry: layered
 * parallax silhouettes, drifting mist, a moving sun/moon, walking figures.
 *
 * A scene is pure canvas 2D: cheap, offline, degrades to a still if reduced-
 * motion is set. Each scene is a function of (ctx, t, w, h) drawing one moment.
 * scroll/hover can drive `t`; by default it plays a slow loop. */

const TAU = Math.PI * 2;
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (x) => x * x * (3 - 2 * x);

// palette drawn from the Gupta register (warm fresco dusk)
const SKY_TOP = "#3a2740", SKY_MID = "#8a4a3a", SKY_LOW = "#d9974a";
const HILL = ["#20161f", "#2c1d28", "#3a2632", "#4a3038"];

// a walking figure silhouette — head, torso, swinging legs/arms. `phase` drives
// the gait; `s` scales; `tint` fills. Original, minimal, dignified.
function figure(ctx, x, groundY, s, phase, tint) {
  const swing = Math.sin(phase) * 0.5;
  ctx.save();
  ctx.translate(x, groundY);
  ctx.fillStyle = tint;
  // bob up-down with the stride
  const bob = Math.abs(Math.cos(phase)) * 2 * s;
  ctx.translate(0, -bob);
  // legs
  const legL = new Path2D(), legR = new Path2D();
  legL.moveTo(0, -20 * s); legL.lineTo(4 * s + swing * 6 * s, 0); legL.lineTo(0 + swing * 6 * s, 2 * s); legL.closePath();
  legR.moveTo(0, -20 * s); legR.lineTo(4 * s - swing * 6 * s, 0); legR.lineTo(0 - swing * 6 * s, 2 * s); legR.closePath();
  ctx.fill(legL); ctx.fill(legR);
  // robe/torso (a bell so it reads as classical dress)
  const robe = new Path2D();
  robe.moveTo(-5 * s, -20 * s);
  robe.quadraticCurveTo(-8 * s, -10 * s, -6 * s, 0);
  robe.lineTo(6 * s, 0);
  robe.quadraticCurveTo(8 * s, -10 * s, 5 * s, -20 * s);
  robe.closePath();
  ctx.fill(robe);
  // torso up to shoulders
  ctx.fillRect(-4 * s, -34 * s, 8 * s, 16 * s);
  // arm swinging (opposite the legs)
  ctx.save();
  ctx.translate(0, -32 * s); ctx.rotate(-swing * 0.5);
  ctx.fillRect(-1.5 * s, 0, 3 * s, 16 * s);
  ctx.restore();
  // head + a suggestion of a crown/halo bump
  ctx.beginPath(); ctx.arc(0, -40 * s, 5 * s, 0, TAU); ctx.fill();
  ctx.restore();
}

// mist bands drifting sideways
function mist(ctx, w, h, y, t, speed, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(0, y - 30, 0, y + 30);
  grad.addColorStop(0, "rgba(230,210,180,0)");
  grad.addColorStop(0.5, "rgba(230,210,180,1)");
  grad.addColorStop(1, "rgba(230,210,180,0)");
  ctx.fillStyle = grad;
  const off = (t * speed) % (w + 200);
  for (let i = -1; i < 3; i++) {
    const x = -200 + i * (w * 0.7) + off;
    ctx.beginPath();
    ctx.ellipse(x, y + Math.sin(t * 0.4 + i) * 6, w * 0.5, 16, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// THE EXILE — Rama, Sita, Lakshmana walk into the forest at dusk.
export function sceneExile(ctx, t, w, h) {
  // sky gradient (dusk), sinking sun
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, SKY_TOP); sky.addColorStop(0.55, SKY_MID); sky.addColorStop(1, SKY_LOW);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

  // the sun sinks slowly over the loop
  const sunU = (Math.sin(t * 0.12) * 0.5 + 0.5);          // 0..1 slow
  const sunY = lerp(h * 0.32, h * 0.62, sunU);
  const sunX = w * 0.72;
  const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.4);
  halo.addColorStop(0, "rgba(255,222,150,0.9)");
  halo.addColorStop(0.2, "rgba(240,170,90,0.45)");
  halo.addColorStop(1, "rgba(240,150,80,0)");
  ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffe9b8";
  ctx.beginPath(); ctx.arc(sunX, sunY, w * 0.045, 0, TAU); ctx.fill();

  // slow birds crossing (tiny V's)
  ctx.strokeStyle = "rgba(20,12,18,0.5)"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const bx = (w * 0.1 + i * w * 0.09 + t * 8) % (w * 1.1);
    const by = h * 0.18 + Math.sin(t * 0.5 + i) * 4;
    ctx.beginPath(); ctx.moveTo(bx - 5, by); ctx.lineTo(bx, by - 3); ctx.lineTo(bx + 5, by); ctx.stroke();
  }

  // parallax hills (back → front), each darker + lower
  const groundY = h * 0.82;
  for (let layer = 0; layer < HILL.length; layer++) {
    const baseY = lerp(h * 0.55, groundY, layer / (HILL.length - 1));
    const amp = 18 + layer * 10;
    const drift = t * (2 + layer * 1.5);                  // nearer layers drift faster
    ctx.fillStyle = HILL[layer];
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = baseY + Math.sin((x + drift) * 0.006 + layer) * amp
                      + Math.sin((x + drift) * 0.021 + layer * 2) * amp * 0.4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

    // sparse trees on the front two ridges
    if (layer >= HILL.length - 2) {
      ctx.fillStyle = "rgba(10,6,10,0.9)";
      for (let x = 30; x < w; x += 120 + layer * 40) {
        const ty = baseY + Math.sin((x + drift) * 0.006 + layer) * amp - 4;
        treeSilhouette(ctx, x + ((drift * 0.3) % 120), ty, 10 + layer * 5);
      }
    }
  }

  // a distinct FOREGROUND ground plane the walkers stand on — darkest, so the
  // three figures read clearly against it (they were lost among the hills).
  const fgY = h * 0.88;
  ctx.fillStyle = "#0b0509";
  ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 12) {
    const y = fgY + Math.sin((x + t * 6) * 0.008) * 6;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

  // mist between the walkers and the hills
  mist(ctx, w, h, fgY - 26, t, 10, 0.18);

  // THE THREE — big enough to read, walking along the FOREGROUND at dusk. A warm
  // sun-rim on their backs (they head toward the low sun) lifts them off the dark.
  const walkY = fgY + 2;
  const march = (t * 22) % (w + 200) - 100;
  const gait = t * 5.5;
  const trio = [
    { dx: 78, s: 1.9, ph: 0.0, tint: "#0a0509" },   // Rama, leading + largest
    { dx: 26, s: 1.65, ph: 0.7, tint: "#160a12" },  // Sita
    { dx: -30, s: 1.75, ph: 1.4, tint: "#0a0509" }, // Lakshmana
  ];
  // long shadows cast back from the low sun
  ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = "#000";
  trio.forEach((f) => { ctx.beginPath(); ctx.ellipse(march + f.dx - 10, walkY + 2, 30 * f.s * 0.4, 5, 0, 0, TAU); ctx.fill(); });
  ctx.restore();
  // warm rim-light halo behind each (sun is behind-right)
  trio.forEach((f) => {
    const rx = march + f.dx + 6 * f.s, ry = walkY - 30 * f.s;
    const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, 34 * f.s);
    g.addColorStop(0, "rgba(255,200,120,0.28)"); g.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rx, ry, 34 * f.s, 0, TAU); ctx.fill();
  });
  trio.forEach((f) => figure(ctx, march + f.dx, walkY, f.s, gait + f.ph, f.tint));

  // low mist in front for depth
  mist(ctx, w, h, walkY + 10, t, 16, 0.1);

  // filmic vignette
  const vig = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.3, w / 2, h * 0.5, h * 0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(10,4,10,0.55)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
}

function treeSilhouette(ctx, x, groundY, s) {
  ctx.save(); ctx.translate(x, groundY);
  ctx.fillRect(-1, -s * 0.4, 2, s * 0.6);                 // trunk
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.8);
  ctx.quadraticCurveTo(s, -s * 0.6, 0, -s * 0.3);
  ctx.quadraticCurveTo(-s, -s * 0.6, 0, -s * 1.8);
  ctx.fill();                                              // canopy
  ctx.restore();
}

export const SCENES = { "ram-story-exile": sceneExile };

// mount a scene into a <canvas>; plays a slow loop, or a single still if the
// user prefers reduced motion.
export function mountScene(canvas, sceneFn) {
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const b = canvas.getBoundingClientRect();
    canvas.width = Math.round(b.width * dpr); canvas.height = Math.round(b.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return b;
  };
  let b = fit();
  window.addEventListener("resize", () => { b = fit(); });
  if (reduce) { sceneFn(ctx, 6, b.width, b.height); return; }
  const t0 = performance.now();
  const loop = (now) => {
    const t = (now - t0) / 1000;
    sceneFn(ctx, t, b.width, b.height);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
