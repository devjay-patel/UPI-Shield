import jsQR from 'jsqr';

/**
 * Decodes a QR code image file entirely within the user's browser using HTML5 Canvas & jsQR.
 * Zero network calls, zero server uploads. Safe & private.
 */
export async function decodeQrImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            resolve(code.data);
          } else {
            reject(new Error('No readable QR code found in this image. Please try a clearer screenshot.'));
          }
        } catch (err) {
          reject(new Error('Error processing QR image locally.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}
