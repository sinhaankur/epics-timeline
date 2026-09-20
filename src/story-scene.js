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

// THE ABDUCTION — Rāvaṇa bears Sītā off in his flying chariot; Jaṭāyu the eagle
// dives to stop him, under a bruised storm sky. Turbulent, darker, urgent.
export function sceneAbduction(ctx, t, w, h) {
  // stormy sky — deep indigo to a sick ochre horizon
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1a1226"); sky.addColorStop(0.5, "#3a2140"); sky.addColorStop(1, "#7a3a2e");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

  // roiling clouds (layered translucent blobs drifting opposite ways)
  for (let layer = 0; layer < 3; layer++) {
    ctx.save();
    ctx.globalAlpha = 0.16 + layer * 0.05;
    ctx.fillStyle = layer % 2 ? "#221630" : "#4a2a3a";
    const dir = layer % 2 ? -1 : 1;
    const off = (t * (14 + layer * 10) * dir) % (w + 400);
    for (let i = -1; i < 4; i++) {
      const x = -300 + i * (w * 0.55) + off;
      const y = h * (0.12 + layer * 0.12) + Math.sin(t * 0.5 + i + layer) * 10;
      ctx.beginPath(); ctx.ellipse(x, y, w * 0.36, 40 + layer * 14, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // an occasional lightning flash lighting the whole sky
  const flash = Math.max(0, Math.sin(t * 0.9) - 0.93) * 14;   // rare, sharp
  if (flash > 0) { ctx.fillStyle = `rgba(255,240,220,${Math.min(0.5, flash)})`; ctx.fillRect(0, 0, w, h); }

  // distant jagged Laṅkā peaks on the horizon
  const horizon = h * 0.72;
  ctx.fillStyle = "#160c14";
  ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) {
    const y = horizon + Math.sin(x * 0.02) * 22 + Math.sin(x * 0.11) * 10;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

  // ground haze
  mist(ctx, w, h, horizon - 6, t, 20, 0.12);

  // THE CHARIOT — a dark ornate mass crossing high, rising as it flees right.
  const cx = (t * 60) % (w + 300) - 150;
  const cy = h * 0.36 - Math.sin(t * 0.8) * 10 - (cx / w) * 40;   // rises as it flees
  ctx.save();
  ctx.translate(cx, cy);
  // it's the PUṢPAKA VIMĀNA — a FLYING celestial chariot (canonical: Rāvaṇa bears
  // Sītā off through the air). Sell the flight: a luminous aura beneath the hull +
  // motion-trail streaks behind, so it reads as airborne by divine power, not a
  // ground cart hovering.
  const aura = ctx.createRadialGradient(0, 6, 0, 0, 6, 70);
  aura.addColorStop(0, "rgba(210,150,60,0.5)");
  aura.addColorStop(0.4, "rgba(180,90,50,0.22)");
  aura.addColorStop(1, "rgba(180,90,50,0)");
  ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(0, 8, 70, 26, 0, 0, TAU); ctx.fill();
  // speed trails streaming back (left) — motion lines of golden light
  ctx.strokeStyle = "rgba(230,180,90,0.30)"; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const ty = -14 + i * 8;
    ctx.beginPath(); ctx.moveTo(-44, ty);
    ctx.lineTo(-44 - 70 - Math.sin(t * 6 + i) * 14, ty + i - 2); ctx.stroke();
  }
  // chariot body (a pushpaka-like ornate hull)
  ctx.fillStyle = "#0c0710";
  ctx.beginPath();
  ctx.moveTo(-44, 0); ctx.quadraticCurveTo(-52, -14, -30, -18);
  ctx.lineTo(30, -18); ctx.quadraticCurveTo(52, -14, 44, 0);
  ctx.quadraticCurveTo(20, 10, 0, 10); ctx.quadraticCurveTo(-20, 10, -44, 0); ctx.closePath(); ctx.fill();
  // ornate prow curl
  ctx.strokeStyle = "#b98a2e"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(44, -6); ctx.quadraticCurveTo(60, -10, 56, -22); ctx.stroke();
  // a gilt canopy hint
  ctx.fillStyle = "#3a2418";
  ctx.beginPath(); ctx.moveTo(-26, -18); ctx.quadraticCurveTo(0, -34, 26, -18); ctx.closePath(); ctx.fill();
  // Rāvaṇa — a broad dark figure (many-headed suggested by a crown crest)
  ctx.fillStyle = "#080409";
  ctx.fillRect(-10, -32, 20, 22);
  ctx.beginPath(); ctx.arc(0, -36, 7, 0, TAU); ctx.fill();
  // crown crest of small heads (his ten-headedness, suggested not literal)
  ctx.fillStyle = "#1a0e14";
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 6, -44, 3, 0, TAU); ctx.fill(); }
  // Sītā — a smaller form he holds, a trailing sash of colour
  ctx.fillStyle = "#7a2a30";
  ctx.beginPath(); ctx.ellipse(16, -14, 6, 10, 0.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = "#c85a54"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(20, -12);
  for (let s = 0; s < 40; s++) ctx.lineTo(24 + s * 2.2, -12 + Math.sin(t * 4 + s * 0.5) * 6 + s * 0.2);
  ctx.stroke();   // her sash streaming behind
  ctx.restore();

  // JAṬĀYU — the great eagle diving up at the chariot from below-right, wings beating.
  const jx = cx - 90 + Math.sin(t * 2) * 10;
  const jy = cy + 70 + Math.cos(t * 2) * 8;
  const beat = Math.sin(t * 8) * 0.5;
  ctx.save(); ctx.translate(jx, jy); ctx.rotate(-0.5 + beat * 0.2);
  ctx.fillStyle = "#1a0f0a";
  // body
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, TAU); ctx.fill();
  // wings (span opens/closes with the beat)
  const span = 40 + beat * 18;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-span * 0.5, -span * 0.7, -span, -6);
  ctx.quadraticCurveTo(-span * 0.5, 4, 0, 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(span * 0.5, -span * 0.7 - 6, span, -14);
  ctx.quadraticCurveTo(span * 0.5, 2, 0, 2); ctx.fill();
  // head + hooked beak reaching toward the chariot
  ctx.beginPath(); ctx.arc(16, -3, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = "#c99a34";
  ctx.beginPath(); ctx.moveTo(20, -4); ctx.lineTo(27, -2); ctx.lineTo(20, 0); ctx.closePath(); ctx.fill();
  ctx.restore();

  // driving rain streaks
  ctx.strokeStyle = "rgba(200,190,210,0.10)"; ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const rx = (i * 137 + t * 400) % w;
    const ry = (i * 89 + t * 700) % h;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 4, ry + 14); ctx.stroke();
  }

  // vignette
  const vig = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.28, w / 2, h * 0.5, h * 0.9);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(6,2,8,0.6)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
}

// THE WAR — two armies face off under a blood-dusk sky: ranks of spears &
// banners, a rain of arrows arcing between them, dust. Used for Laṅkā and
// Kurukṣetra. Grave, not gory — silhouettes and motion, no blood.
export function sceneWar(ctx, t, w, h) {
  // smoky blood-dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#241019"); sky.addColorStop(0.5, "#5a2320"); sky.addColorStop(1, "#9a5028");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // low sun/haze of battle
  const gx = w * 0.5, gy = h * 0.34;
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.5);
  glow.addColorStop(0, "rgba(255,180,110,0.4)"); glow.addColorStop(1, "rgba(255,150,90,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  // drifting smoke
  mist(ctx, w, h, h * 0.42, t, 24, 0.1);
  mist(ctx, w, h, h * 0.58, t, -18, 0.08);

  const groundY = h * 0.82;
  // dark battlefield ground
  ctx.fillStyle = "#160a10"; ctx.fillRect(0, groundY, w, h - groundY);

  // an army rank: rows of spears + helmeted heads receding, with banners.
  function army(baseX, dir, color, banner) {
    for (let row = 3; row >= 0; row--) {
      const ry = groundY - row * 10 - 6;
      const scale = 1 - row * 0.14;
      const alpha = 0.9 - row * 0.16;
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.strokeStyle = color;
      for (let i = 0; i < 9; i++) {
        const x = baseX + dir * (i * 26 + row * 8) + Math.sin(t * 2 + i + row) * 1.5;
        // spear
        ctx.lineWidth = 1.4 * scale;
        ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x + dir * 3, ry - 34 * scale); ctx.stroke();
        // spearhead
        ctx.beginPath(); ctx.moveTo(x + dir * 3, ry - 34 * scale); ctx.lineTo(x + dir * 5, ry - 30 * scale); ctx.lineTo(x + dir, ry - 30 * scale); ctx.closePath(); ctx.fill();
        // helmeted head + shoulders
        ctx.beginPath(); ctx.arc(x, ry - 8 * scale, 4 * scale, 0, TAU); ctx.fill();
        ctx.fillRect(x - 4 * scale, ry - 4 * scale, 8 * scale, 6 * scale);
      }
      ctx.restore();
      // a banner every rank
      const bx = baseX + dir * (row * 8 + 40);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.strokeStyle = color; ctx.lineWidth = 1.6 * scale;
      ctx.beginPath(); ctx.moveTo(bx, ry - 4); ctx.lineTo(bx, ry - 52 * scale); ctx.stroke();
      ctx.fillStyle = banner;
      const flag = new Path2D();
      const wav = Math.sin(t * 4 + row) * 4;
      flag.moveTo(bx, ry - 52 * scale);
      flag.lineTo(bx + dir * 22 * scale, ry - 48 * scale + wav);
      flag.lineTo(bx, ry - 40 * scale); flag.closePath();
      ctx.fill(flag);
      ctx.restore();
    }
  }
  army(w * 0.06, 1, "#0c0509", "#c0432e");        // left army — crimson banners
  army(w * 0.94, -1, "#0c0509", "#caa23a");       // right army — gold banners

  // ARROW RAIN — a volley arcs from left to right and back, parabolic.
  ctx.strokeStyle = "rgba(20,10,12,0.8)"; ctx.lineWidth = 1.2;
  const volley = (t * 0.35) % 2;                   // 0..2, two directions
  const dir = volley < 1 ? 1 : -1;
  const prog = volley < 1 ? volley : volley - 1;
  for (let i = 0; i < 40; i++) {
    const u = (i / 40 + prog) % 1;
    const x0 = dir > 0 ? w * 0.12 : w * 0.88;
    const x1 = dir > 0 ? w * 0.88 : w * 0.12;
    const x = lerp(x0, x1, u);
    const arc = Math.sin(u * Math.PI);
    const y = groundY - 40 - arc * (h * 0.32) + (i % 5) * 3;
    const ax = dir * 8, ay = 6;                    // arrow slope along flight
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ax, y - ay * (u < 0.5 ? -1 : 1)); ctx.stroke();
  }

  // occasional dust bursts on the ground line
  for (let i = 0; i < 6; i++) {
    const bx = (i * w * 0.17 + t * 12) % w;
    const puff = Math.max(0, Math.sin(t * 1.3 + i) );
    ctx.save(); ctx.globalAlpha = 0.12 * puff; ctx.fillStyle = "#d8b48a";
    ctx.beginPath(); ctx.arc(bx, groundY - 6, 20 * puff, 0, TAU); ctx.fill(); ctx.restore();
  }

  // vignette
  const vig = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.28, w / 2, h * 0.55, h * 0.9);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(8,2,6,0.62)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
}

// A LAMP-LIT HALL — for the dice game & court beats. Pillars, hanging lamps that
// flicker, a low dais, seated silhouettes. Interior, intimate, tense.
export function sceneHall(ctx, t, w, h) {
  // warm sandstone interior wash
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#2a1a16"); bg.addColorStop(1, "#4a2c1e");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  const floorY = h * 0.78;
  // floor
  ctx.fillStyle = "#1c1009"; ctx.fillRect(0, floorY, w, h - floorY);
  // a runner carpet down the middle
  ctx.fillStyle = "#5a2320";
  ctx.beginPath(); ctx.moveTo(w * 0.36, h); ctx.lineTo(w * 0.44, floorY); ctx.lineTo(w * 0.56, floorY); ctx.lineTo(w * 0.64, h); ctx.closePath(); ctx.fill();

  // pillars receding
  ctx.fillStyle = "#20130d";
  for (const px of [0.1, 0.26, 0.74, 0.9]) {
    const x = px * w;
    ctx.fillRect(x - 10, h * 0.12, 20, floorY - h * 0.12);
    // capital + base
    ctx.fillRect(x - 15, h * 0.12, 30, 12);
    ctx.fillRect(x - 15, floorY - 10, 30, 10);
  }

  // hanging oil lamps that flicker (warm pools of light)
  for (const lx of [0.2, 0.5, 0.8]) {
    const x = lx * w, y = h * 0.2 + Math.sin(t * 3 + lx * 10) * 2;
    const flick = 0.75 + Math.sin(t * 12 + lx * 20) * 0.15 + Math.sin(t * 27 + lx) * 0.08;
    ctx.strokeStyle = "#1a0f0a"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, h * 0.12); ctx.lineTo(x, y); ctx.stroke();
    const g = ctx.createRadialGradient(x, y, 0, x, y, 120 * flick);
    g.addColorStop(0, `rgba(255,190,110,${0.5 * flick})`);
    g.addColorStop(0.4, `rgba(240,150,80,${0.16 * flick})`);
    g.addColorStop(1, "rgba(240,150,80,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 120 * flick, 0, TAU); ctx.fill();
    ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
  }

  // a low dais with two seated silhouettes facing across a board (the dice)
  const dY = floorY - 6;
  ctx.fillStyle = "#0c0609";
  // seated figure left
  seated(ctx, w * 0.4, dY, 1.1, "#0c0609");
  // seated figure right
  seated(ctx, w * 0.6, dY, 1.1, "#0c0609");
  // the board between them + rolling dice glint
  ctx.fillStyle = "#3a2016"; ctx.fillRect(w * 0.47, dY - 6, w * 0.06, 6);
  const dieX = w * 0.5 + Math.sin(t * 6) * w * 0.02;
  ctx.fillStyle = "#e8d8b0"; ctx.fillRect(dieX - 3, dY - 10 - Math.abs(Math.sin(t * 6)) * 8, 6, 6);

  // standing courtiers flanking, dim
  ctx.globalAlpha = 0.7;
  seated(ctx, w * 0.24, dY, 0.9, "#0a0508", true);
  seated(ctx, w * 0.76, dY, 0.9, "#0a0508", true);
  ctx.globalAlpha = 1;

  // dust motes in the lamp light
  ctx.fillStyle = "rgba(255,210,150,0.12)";
  for (let i = 0; i < 30; i++) {
    const mx = (i * 137 + t * 8) % w;
    const my = (i * 53 + Math.sin(t + i) * 20) % (floorY);
    ctx.fillRect(mx, my, 1.5, 1.5);
  }

  // vignette
  const vig = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.25, w / 2, h * 0.5, h * 0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(6,3,2,0.6)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
}
function seated(ctx, x, groundY, s, tint, standing) {
  ctx.save(); ctx.translate(x, groundY); ctx.fillStyle = tint;
  if (standing) {
    ctx.fillRect(-5 * s, -46 * s, 10 * s, 46 * s);
    ctx.beginPath(); ctx.arc(0, -52 * s, 6 * s, 0, TAU); ctx.fill();
  } else {
    // cross-legged base + torso
    ctx.beginPath(); ctx.moveTo(-16 * s, 0); ctx.quadraticCurveTo(0, -6 * s, 16 * s, 0); ctx.lineTo(10 * s, -4 * s); ctx.lineTo(-10 * s, -4 * s); ctx.closePath(); ctx.fill();
    ctx.fillRect(-7 * s, -30 * s, 14 * s, 28 * s);
    ctx.beginPath(); ctx.arc(0, -37 * s, 6.5 * s, 0, TAU); ctx.fill();
    // a small crown crest
    ctx.beginPath(); ctx.moveTo(-6 * s, -42 * s); ctx.lineTo(0, -48 * s); ctx.lineTo(6 * s, -42 * s); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export const SCENES = {
  "ram-story-exile": sceneExile,
  "ram-story-abduction": sceneAbduction,
  "ram-story-war": sceneWar,
  "ram-story-birth": sceneHall,          // Ayodhyā court — the birth of a prince
  "mbh-story-dice": sceneHall,           // the game of dice — the lamp-lit hall
  "mbh-story-exile": sceneExile,         // the Pāṇḍavas' forest exile
  "mbh-story-kurukshetra": sceneWar,     // the 18-day war
};

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
