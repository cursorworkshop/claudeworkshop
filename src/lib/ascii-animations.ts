// Pure render functions for ASCII animations.
// Each factory returns a renderer: (time: number, cols: number, rows: number) => string[][]
// time is in seconds (from performance.now / 1000)

export type AsciiRenderer = (
  time: number,
  cols: number,
  rows: number
) => string[][];

const DENSITY = ' .,:;+*#@';
const BLOCK_DENSITY = ' .,:;+*#░▒▓█';

function emptyGrid(cols: number, rows: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(' '));
}

// --- Particle field: sparse drifting dots for hero background ---

export function createParticleField(count = 60): AsciiRenderer {
  const particles: { x: number; y: number; vx: number; vy: number }[] = [];
  let initialized = false;

  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    if (!initialized || particles.length === 0) {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * cols,
          y: Math.random() * rows,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
      initialized = true;
    }

    for (const p of particles) {
      const wave = Math.sin(time * 0.5 + p.x * 0.1) * 0.3;
      const px = Math.round(p.x + wave) % cols;
      const py = Math.round(p.y) % rows;
      const ix = ((px % cols) + cols) % cols;
      const iy = ((py % rows) + rows) % rows;

      const flicker = Math.sin(time * 2 + p.x + p.y * 3) * 0.5 + 0.5;
      const charIdx = Math.floor(flicker * 3);
      grid[iy][ix] = DENSITY[charIdx] || '.';

      // drift
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      if (p.x < 0) p.x += cols;
      if (p.x >= cols) p.x -= cols;
      if (p.y < 0) p.y += rows;
      if (p.y >= rows) p.y -= rows;
    }
    return grid;
  };
}

// --- Data stream: horizontal flowing characters for Delegate card ---

export function createDataStream(tracks = 5): AsciiRenderer {
  const chars = '01.:;#';
  const speeds: number[] = [];
  const offsets: number[] = [];
  for (let i = 0; i < tracks; i++) {
    speeds.push(8 + Math.random() * 12);
    offsets.push(Math.random() * 100);
  }

  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    const trackSpacing = Math.max(1, Math.floor(rows / (tracks + 1)));

    for (let t = 0; t < tracks; t++) {
      const row = Math.min(trackSpacing * (t + 1), rows - 1);
      const cursor = ((time * speeds[t] + offsets[t]) % (cols + 10)) - 5;

      for (let c = 0; c < cols; c++) {
        const dist = cursor - c;
        if (dist >= 0 && dist < 12) {
          const fade = 1 - dist / 12;
          const charIdx = Math.floor(fade * (chars.length - 1));
          grid[row][c] = chars[charIdx] || '.';
        }
        // dim track line
        if (grid[row][c] === ' ' && c % 4 === 0) {
          grid[row][c] = '·';
        }
      }
    }
    return grid;
  };
}

// --- Radar sweep: rotating scan line with blips for Review card ---

export function createRadarSweep(): AsciiRenderer {
  // Pre-generate random blip positions (angle, radius)
  const blips: { angle: number; radius: number }[] = [];
  for (let i = 0; i < 8; i++) {
    blips.push({
      angle: Math.random() * Math.PI * 2,
      radius: 0.3 + Math.random() * 0.6,
    });
  }

  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    const cx = cols / 2;
    const cy = rows / 2;
    const maxR = Math.min(cols / 2, rows) * 0.85;
    const sweepAngle = time * 1.5;

    // Draw concentric rings
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = (c - cx) / 2; // aspect correction
        const dy = r - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normDist = dist / maxR;

        // rings at 0.33, 0.66, 1.0
        for (const ringR of [0.33, 0.66, 1.0]) {
          if (Math.abs(normDist - ringR) < 0.06) {
            grid[r][c] = ':';
          }
        }

        // center cross
        if (
          (Math.abs(c - cx) < 1 && Math.abs(r - cy) < maxR * 0.3) ||
          (Math.abs(r - cy) < 1 && Math.abs(c - cx) < maxR * 0.3)
        ) {
          grid[r][c] = '+';
        }

        // sweep line
        if (normDist > 0 && normDist <= 1.0) {
          const angle = Math.atan2(dy, dx);
          let angleDiff = angle - sweepAngle;
          angleDiff =
            ((angleDiff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

          if (angleDiff < 0.3) {
            const intensity = 1 - angleDiff / 0.3;
            const charIdx = Math.floor(intensity * (DENSITY.length - 2)) + 1;
            if (charIdx > DENSITY.indexOf(grid[r][c] || ' '))
              grid[r][c] = DENSITY[Math.min(charIdx, DENSITY.length - 1)];
          }
        }
      }
    }

    // Draw blips
    for (const blip of blips) {
      const bx = Math.round(cx + Math.cos(blip.angle) * blip.radius * maxR * 2);
      const by = Math.round(cy + Math.sin(blip.angle) * blip.radius * maxR);
      if (bx >= 0 && bx < cols && by >= 0 && by < rows) {
        // blip pulses when sweep passes
        let angleDiff = blip.angle - (sweepAngle % (Math.PI * 2));
        angleDiff = ((angleDiff % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 1.5) {
          grid[by][bx] = '@';
        } else {
          grid[by][bx] = '*';
        }
      }
    }

    // center dot
    const cxI = Math.round(cx);
    const cyI = Math.round(cy);
    if (cxI >= 0 && cxI < cols && cyI >= 0 && cyI < rows) {
      grid[cyI][cxI] = '@';
    }

    return grid;
  };
}

// --- Wireframe cube: rotating 3D cube for Own card ---

export function createWireframeCube(): AsciiRenderer {
  const vertices: [number, number, number][] = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];

  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    const cx = cols / 2;
    const cy = rows / 2;
    const scale = Math.min(cols / 5, rows / 3);

    const cosA = Math.cos(time * 0.7);
    const sinA = Math.sin(time * 0.7);
    const cosB = Math.cos(time * 0.5);
    const sinB = Math.sin(time * 0.5);

    // project vertices
    const projected: { x: number; y: number; z: number }[] = vertices.map(
      ([x, y, z]) => {
        // Rotate Y
        const x1 = x * cosA - z * sinA;
        const y1 = y;
        const z1 = x * sinA + z * cosA;
        // Rotate X
        const x2 = x1;
        const y2 = y1 * cosB - z1 * sinB;
        const z2 = y1 * sinB + z1 * cosB;

        const perspDiv = 3 + z2;
        return {
          x: cx + (x2 / perspDiv) * scale * 2,
          y: cy + (y2 / perspDiv) * scale,
          z: z2,
        };
      }
    );

    // Draw edges using Bresenham
    for (const [a, b] of edges) {
      const pa = projected[a];
      const pb = projected[b];
      const avgZ = (pa.z + pb.z) / 2;
      // map z [-1..1] to density character
      const normZ = (avgZ + 2) / 4;
      const charIdx = Math.floor(normZ * (DENSITY.length - 1));
      const ch = DENSITY[Math.max(1, Math.min(charIdx, DENSITY.length - 1))];

      drawLine(grid, pa.x, pa.y, pb.x, pb.y, cols, rows, ch);
    }

    // Draw vertices
    for (const v of projected) {
      const vx = Math.round(v.x);
      const vy = Math.round(v.y);
      if (vx >= 0 && vx < cols && vy >= 0 && vy < rows) {
        grid[vy][vx] = '@';
      }
    }

    return grid;
  };
}

function drawLine(
  grid: string[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cols: number,
  rows: number,
  ch: string
) {
  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  const ix1 = Math.round(x1);
  const iy1 = Math.round(y1);
  const dx = Math.abs(ix1 - ix0);
  const dy = Math.abs(iy1 - iy0);
  const sx = ix0 < ix1 ? 1 : -1;
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx - dy;
  const maxSteps = dx + dy + 1;

  for (let step = 0; step < maxSteps; step++) {
    if (ix0 >= 0 && ix0 < cols && iy0 >= 0 && iy0 < rows) {
      grid[iy0][ix0] = ch;
    }
    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      ix0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      iy0 += sy;
    }
  }
}

// --- ASCII sphere: rotating shaded sphere for Your Stack card ---

export function createAsciiSphere(): AsciiRenderer {
  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    const cx = cols / 2;
    const cy = rows / 2;
    const radius = Math.min(cols / 2.5, rows / 1.3) * 0.8;

    const lightX = Math.cos(time * 0.3) * 0.5;
    const lightY = -0.3;
    const lightZ = Math.sin(time * 0.3) * 0.5 + 0.7;
    const lightLen = Math.sqrt(
      lightX * lightX + lightY * lightY + lightZ * lightZ
    );

    const rotY = time * 0.4;
    const rotX = time * 0.2;
    const cosRY = Math.cos(rotY);
    const sinRY = Math.sin(rotY);
    const cosRX = Math.cos(rotX);
    const sinRX = Math.sin(rotX);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // map pixel to sphere coordinates
        const nx = (c - cx) / (radius * 2); // aspect ratio correction
        const ny = (r - cy) / radius;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;

        const nz = Math.sqrt(1 - r2);

        // rotate normal
        const rx = nx * cosRY + nz * sinRY;
        const ry = ny * cosRX - (nz * cosRY - nx * sinRY) * sinRX;
        const rz = ny * sinRX + (nz * cosRY - nx * sinRY) * cosRX;

        // lambertian shading
        const dot = (rx * lightX + ry * lightY + rz * lightZ) / lightLen;
        const brightness = Math.max(0, dot);

        const charIdx = Math.floor(brightness * (BLOCK_DENSITY.length - 1));
        grid[r][c] = BLOCK_DENSITY[charIdx] || ' ';
      }
    }

    return grid;
  };
}

// --- ASCII globe: sphere with continent bitmap for Worldwide card ---

// Simplified 36x18 continent bitmap (lon x lat, equirectangular)
// 1 = land, 0 = sea. Encoded as hex strings per row.
const CONTINENT_MAP = [
  '000000000000000000000000000000000000', // 90N
  '000000000000000111110000000000000000', // 80N
  '000000000011111111111000000000000000', // 70N
  '000001100111111111111100000100000000', // 60N
  '000001101111111111111110001110000000', // 50N
  '000000011111101111111111001100000000', // 40N
  '000000001111000111111111001000000000', // 30N
  '000000001110000011101111100000000000', // 20N
  '000000000110000001100011000000000000', // 10N
  '000000000100000011100011100100000000', // 0
  '000000000000000001100011101100000000', // 10S
  '000000000000000001100001111000000000', // 20S
  '000000000000000000100000111000010000', // 30S
  '000000000000000000000000010000011100', // 40S
  '000000000000000000000000000000001100', // 50S
  '000000000000000000000000000000000000', // 60S
  '000000000000000000000000000000000000', // 70S
  '000000000000000000000000000000000000', // 80S
].map(row => row.split('').map(Number));

export function createAsciiGlobe(): AsciiRenderer {
  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    const cx = cols / 2;
    const cy = rows / 2;
    const radius = Math.min(cols / 2.5, rows / 1.3) * 0.8;

    const rotY = time * 0.3;
    const cosRY = Math.cos(rotY);
    const sinRY = Math.sin(rotY);

    const lightX = 0.5;
    const lightY = -0.3;
    const lightZ = 0.8;
    const lightLen = Math.sqrt(
      lightX * lightX + lightY * lightY + lightZ * lightZ
    );

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = (c - cx) / (radius * 2);
        const ny = (r - cy) / radius;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;

        const nz = Math.sqrt(1 - r2);

        // rotate around Y axis to get world coordinates
        const wx = nx * cosRY + nz * sinRY;
        const wz = -nx * sinRY + nz * cosRY;

        // spherical coordinates
        const lat = Math.asin(Math.max(-1, Math.min(1, -ny))); // -pi/2 to pi/2
        const lon = Math.atan2(wx, wz); // -pi to pi

        // map to continent bitmap
        const mapRow = Math.floor(
          ((Math.PI / 2 - lat) / Math.PI) * (CONTINENT_MAP.length - 1)
        );
        const mapCol = Math.floor(
          ((lon + Math.PI) / (2 * Math.PI)) * (CONTINENT_MAP[0].length - 1)
        );

        const isLand =
          mapRow >= 0 &&
          mapRow < CONTINENT_MAP.length &&
          mapCol >= 0 &&
          mapCol < CONTINENT_MAP[0].length &&
          CONTINENT_MAP[mapRow][mapCol] === 1;

        // shading
        const dot = (nx * lightX + ny * lightY + nz * lightZ) / lightLen;
        const brightness = Math.max(0.05, dot);

        if (isLand) {
          const charIdx = Math.floor(brightness * (BLOCK_DENSITY.length - 1));
          grid[r][c] = BLOCK_DENSITY[Math.max(2, charIdx)] || '#';
        } else {
          // ocean: sparse dots
          const charIdx = Math.floor(brightness * 3);
          grid[r][c] = DENSITY[charIdx] || '.';
        }
      }
    }

    return grid;
  };
}

// --- Spinning text ring: characters on a circle for ambassador badge ---

export function createSpinningText(text: string, speed = 0.3): AsciiRenderer {
  const chars = text.split('');

  return (time, cols, rows) => {
    const grid = emptyGrid(cols, rows);
    if (cols === 0 || rows === 0) return grid;

    const cx = cols / 2;
    const cy = rows / 2;
    const radiusX = (cols / 2) * 0.8;
    const radiusY = (rows / 2) * 0.8;

    const angleOffset = time * speed;

    for (let i = 0; i < chars.length; i++) {
      const angle = (i / chars.length) * Math.PI * 2 + angleOffset;
      const px = Math.round(cx + Math.cos(angle) * radiusX);
      const py = Math.round(cy + Math.sin(angle) * radiusY);

      if (px >= 0 && px < cols && py >= 0 && py < rows) {
        grid[py][px] = chars[i];
      }
    }

    return grid;
  };
}
