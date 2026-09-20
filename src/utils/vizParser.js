import JSZip from 'jszip';

/**
 * Parses an Avee Player .viz file (which is a zip archive containing scene.json and assets)
 * Extracts the background image, center logo, social overlay, and scene parameters.
 */
export async function parseVizFile(file) {
  try {
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files);
    console.log('[VIZ PARSER] Archive entries:', files);

    // 1. Read scene.json if present
    let scene = null;
    if (zip.file('scene.json')) {
      const sceneText = await zip.file('scene.json').async('string');
      try {
        scene = JSON.parse(sceneText);
      } catch (e) {
        console.warn('Could not parse scene.json:', e);
      }
    }

    // 2. Extract all image blobs as data URLs
    const imageMap = {};
    for (const filename of files) {
      if (filename.endsWith('.json')) continue;
      const zipEntry = zip.file(filename);
      if (!zipEntry || zipEntry.dir) continue;

      const blob = await zipEntry.async('blob');
      // Create Object URL for instant browser rendering
      const url = URL.createObjectURL(blob);
      imageMap[filename] = {
        url,
        size: blob.size,
        name: filename
      };
    }

    console.log('[VIZ PARSER] Extracted images:', Object.keys(imageMap));

    // 3. Smart asset classification:
    // Identify background (usually largest image), center logo, and overlays
    const imageList = Object.entries(imageMap).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.size - a.size);

    let bgImage = '/presets/bg_bmw_white.jpg';
    let centerLogo = '/presets/logo_fharid_fvnky.png';
    let socialOverlay = '';

    if (imageList.length > 0) {
      // Largest image is usually the high-res background (e.g. BMW car)
      bgImage = imageList[0].url;

      // Find logo or secondary image
      if (imageList.length > 1) {
        // Look for typical logo keywords or second largest
        const logoCand = imageList.find(img => 
          img.name.toLowerCase().includes('logo') || 
          img.size < imageList[0].size * 0.4
        ) || imageList[1];
        centerLogo = logoCand.url;
      }

      // Check for social overlay (e.g. 1000426417 or horizontal banner)
      const socialCand = imageList.find(img => 
        img.name === '1000426417' || 
        img.name.toLowerCase().includes('overlay') ||
        img.name.toLowerCase().includes('social')
      );
      if (socialCand) {
        socialOverlay = socialCand.url;
      }
    }

    const templateName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').toUpperCase();

    // 4. Construct Avee Player Template Object
    const customTemplate = {
      id: 'custom_viz_' + Date.now(),
      name: templateName || 'Custom Avee Visualizer',
      category: 'Avee Player .VIZ',
      refImage: bgImage,
      description: `Template di-import langsung dari file ${file.name}. Siap pakai dan audio-reactive.`,
      aspectRatio: '16:9',
      durationTag: '0:30',
      usedCount: 'Baru di-import',
      defaults: {
        djName: 'DJ REMIX',
        djSubtitle: 'FULL BASS',
        songTitle: templateName,
        artist: 'Avee Player Template',
        glowColor: '#38bdf8',
        accentColor: '#22c55e',
        centerLogo: centerLogo,
        coverImage: centerLogo,
        bgImage: bgImage,
        lightAccent: '/presets/light_accent.png',
        socialOverlay: socialOverlay,
        bassShake: true,
        particlesEnabled: true,
        particleColor: '#38bdf8',
        waveBars: 80,
        centerTextMode: false
      }
    };

    return customTemplate;
  } catch (err) {
    console.error('[VIZ PARSER ERROR]:', err);
    throw new Error(`Gagal membaca file .viz: ${err.message}`);
  }
}
