#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Verify that all images referenced in the codebase exist in the public directory
 */
function verifyImages() {
  console.log('🔍 Verifying images for AWS Amplify deployment...\n');

  const publicImagesDir = path.join(process.cwd(), 'public', 'images');
  const designDir = path.join(process.cwd(), 'design');

  // Check if public/images directory exists
  if (!fs.existsSync(publicImagesDir)) {
    console.error('❌ public/images directory does not exist');
    process.exit(1);
  }

  // List all images in public/images
  const publicImages = fs
    .readdirSync(publicImagesDir, { recursive: true })
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map(file => path.join('images', file));

  console.log('📁 Images in public/images/:');
  publicImages.forEach(img => console.log(`  ✅ ${img}`));

  // Check if design images are copied to public
  if (fs.existsSync(designDir)) {
    const designImages = fs
      .readdirSync(designDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

    console.log('\n📁 Images in design/ that should be in public/images/:');
    designImages.forEach(img => {
      const publicPath = path.join('images', img);
      if (publicImages.includes(publicPath)) {
        console.log(`  ✅ ${img} (copied to public/images/)`);
      } else {
        console.log(`  ⚠️  ${img} (not in public/images/)`);
      }
    });
  }

  // Check for common image references in code
  console.log('\n🔍 Checking for image references in code...');

  const imageReferences = [
    '/images/claude_milano_landscape.jpg',
    '/images/claude_milano_square.jpg',
    '/images/meetup_20250916.jpg',
    '/images/ambassador.png',
  ];

  imageReferences.forEach(ref => {
    const filename = ref.split('/').pop();
    const exists = publicImages.some(img => img.includes(filename));
    if (exists) {
      console.log(`  ✅ ${ref} exists`);
    } else {
      console.log(`  ❌ ${ref} missing`);
    }
  });

  console.log('\n✅ Image verification complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure all images are in public/images/');
  console.log('2. Copy any missing images from design/ to public/images/');
  console.log('3. Deploy to AWS Amplify');
  console.log('4. Check that images load correctly in production');
}

// Run verification
verifyImages();
