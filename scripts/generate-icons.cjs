const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Icon-Größen
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Farben
const bgColor = '#0a0a1a';
const primaryColor = '#00ff88';
const secondaryColor = '#00aaff';
const accentColor = '#ff4444';

// Icon generieren
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Hintergrund
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Raumschiff zeichnen
  const centerX = size / 2;
  const centerY = size / 2;
  const scale = size / 192;

  // Schiffskörper
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 60 * scale);
  ctx.lineTo(centerX + 34 * scale, centerY - 30 * scale);
  ctx.lineTo(centerX + 34 * scale, centerY - 10 * scale);
  ctx.lineTo(centerX + 64 * scale, centerY);
  ctx.lineTo(centerX + 34 * scale, centerY + 10 * scale);
  ctx.lineTo(centerX + 34 * scale, centerY + 30 * scale);
  ctx.lineTo(centerX, centerY + 60 * scale);
  ctx.lineTo(centerX - 34 * scale, centerY + 30 * scale);
  ctx.lineTo(centerX - 34 * scale, centerY + 10 * scale);
  ctx.lineTo(centerX - 64 * scale, centerY);
  ctx.lineTo(centerX - 34 * scale, centerY - 10 * scale);
  ctx.lineTo(centerX - 34 * scale, centerY - 30 * scale);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 15 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Antrieb
  ctx.fillStyle = accentColor;
  ctx.fillRect(
    centerX - 26 * scale,
    centerY + 35 * scale,
    52 * scale,
    15 * scale
  );

  // Text (nur für große Icons)
  if (size >= 192) {
    ctx.fillStyle = primaryColor;
    ctx.font = `${14 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RR', centerX, centerY + 70 * scale);
  }

  return canvas.toBuffer('image/png');
}

// Icons generieren
sizes.forEach(size => {
  const iconData = generateIcon(size);
  const filePath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}.png`);
  fs.writeFileSync(filePath, iconData);
  console.log(`Generated icon-${size}.png`);
});

console.log('All icons generated successfully!');
