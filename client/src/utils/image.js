function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

function isProbablyImage(file) {
  if (file.type?.startsWith('image/')) return true;
  // Some mobile browsers omit MIME for gallery picks / WhatsApp saves
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
}

/**
 * Compress an image for upload as a data URL.
 * Iteratively reduces dimensions/quality until under maxBytes (decoded size of data URL string).
 */
export async function compressImage(
  file,
  {
    maxWidth = 480,
    quality = 0.72,
    preserveTransparency = false,
    maxBytes = 450_000,
  } = {}
) {
  if (!file) return null;
  if (!isProbablyImage(file)) {
    throw new Error('Please choose an image file (JPG, PNG, or WEBP).');
  }
  if (/heic|heif/i.test(file.type || '') || /\.(heic|heif)$/i.test(file.name || '')) {
    throw new Error('HEIC photos are not supported. Please upload a JPG or PNG screenshot.');
  }

  const dataUrl = await readAsDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Could not read that image. Try a JPG or PNG screenshot.'));
    img.src = dataUrl;
  });

  const keepPng =
    preserveTransparency && (file.type === 'image/png' || file.type === 'image/webp');

  let widthCap = maxWidth;
  let q = quality;
  let result = '';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const scale = Math.min(1, widthCap / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!keepPng) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(image, 0, 0, width, height);
    result = keepPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', q);

    if (result.length <= maxBytes) {
      return result;
    }

    // Shrink for next attempt
    q = Math.max(0.45, q - 0.08);
    widthCap = Math.max(480, Math.round(widthCap * 0.82));
  }

  if (result.length > maxBytes) {
    throw new Error(
      'Image is still too large after compression. Please use a smaller screenshot (under ~2 MB).'
    );
  }
  return result;
}
