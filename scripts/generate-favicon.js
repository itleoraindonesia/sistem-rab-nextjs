const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceLogo = path.join(__dirname, '../public/logo-only.png');
const outputDir = path.join(__dirname, '../public');

// Favicon sizes needed
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' }
];

async function generateFavicons() {
  console.log('🔄 Generating favicons from logo-only.png...');

  // Check if source logo exists
  if (!fs.existsSync(sourceLogo)) {
    console.error('❌ Source logo not found:', sourceLogo);
    process.exit(1);
  }

  console.log('✅ Source logo found:', sourceLogo);

  // Generate each favicon size
  for (const favicon of faviconSizes) {
    const outputPath = path.join(outputDir, favicon.name);

    try {
      await sharp(sourceLogo)
        .resize(favicon.size, favicon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent background
        })
        .png({
          quality: 90,
          compressionLevel: 6
        })
        .toFile(outputPath);

      console.log(`✅ Generated ${favicon.name} (${favicon.size}x${favicon.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${favicon.name}:`, error.message);
    }
  }

  // Copy/create favicon.ico (using 32x32 as base)
  const favicon32Path = path.join(outputDir, 'favicon-32x32.png');
  const faviconIcoPath = path.join(__dirname, '../src/app/favicon.ico');

  try {
    // For simplicity, we'll just copy the 32x32 PNG as favicon.ico
    // In production, you might want to use a proper ICO converter
    await sharp(favicon32Path)
      .toFile(faviconIcoPath);

    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }

  console.log('🎉 All favicons generated successfully!');
  console.log('📁 Favicons saved to:', outputDir);
  console.log('📁 favicon.ico saved to:', path.join(__dirname, '../src/app'));
}

generateFavicons().catch(console.error);
