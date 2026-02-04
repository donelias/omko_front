import imageCompression from 'browser-image-compression';

// Image compression configuration - OPTIMIZADO PARA MÁXIMA CALIDAD EN PANTALLA
export const IMAGE_COMPRESSION_CONFIG = {
  // Para título (1042 x 584) - CALIDAD EXCELENTE PARA PANTALLAS
  titleImage: {
    maxSizeMB: 0.25,       // 250 KB (calidad máxima manteniendo web-friendly)
    width: 1042,
    height: 584,
    quality: 0.90,         // JPEG calidad 90 (EXCELENTE - casi sin pérdida visible)
  },
  // Para galería (1042 x 584 multiple imágenes) - CALIDAD EXCELENTE PARA PANTALLAS
  galleryImages: {
    maxSizeMB: 0.25,       // 250 KB por imagen (calidad máxima)
    width: 1042,
    height: 584,
    quality: 0.90,         // JPEG calidad 90 (EXCELENTE - casi sin pérdida visible)
  },
  // Para imagen 3D (1042 x 584) - CALIDAD EXCELENTE PARA PANTALLAS
  threeDImage: {
    maxSizeMB: 0.25,       // 250 KB (calidad máxima)
    width: 1042,
    height: 584,
    quality: 0.90,         // JPEG calidad 90 (EXCELENTE - casi sin pérdida visible)
  },
  // Para imagen OG/SEO (640 x 427) - CALIDAD EXCELENTE PARA SEO
  ogImage: {
    maxSizeMB: 0.15,       // 150 KB (excelente para SEO)
    width: 640,
    height: 427,
    quality: 0.90,         // JPEG calidad 90 (EXCELENTE)
  },
};

/**
 * Resize image to exact dimensions using Canvas
 * @param {File} imageFile - The image file to resize
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @returns {Promise<File>} - The resized image file
 */
const resizeImageToExactDimensions = async (imageFile, width, height) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions to maintain aspect ratio and fill the canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let srcWidth, srcHeight, srcX, srcY;
        
        if (imgRatio > canvasRatio) {
          // Image is wider, fit height
          srcHeight = img.height;
          srcWidth = img.height * canvasRatio;
          srcY = 0;
          srcX = (img.width - srcWidth) / 2;
        } else {
          // Image is taller, fit width
          srcWidth = img.width;
          srcHeight = img.width / canvasRatio;
          srcX = 0;
          srcY = (img.height - srcHeight) / 2;
        }
        
        // Draw the cropped and resized image
        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], imageFile.name, {
              type: imageFile.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          imageFile.type || 'image/jpeg',
          0.85
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(imageFile);
  });
};

/**
 * Compress a single image file and resize to exact dimensions
 * @param {File} imageFile - The image file to compress
 * @param {number} maxSizeMB - Maximum size in MB (default: 0.5)
 * @param {number} width - Target width in pixels (default: 1024)
 * @param {number} height - Target height in pixels (default: 584)
 * @param {number} quality - Compression quality 0-1 (default: 0.8)
 * @returns {Promise<File>} - The compressed and resized image file
 */
export const compressImage = async (
  imageFile,
  maxSizeMB = 0.5,
  width = 1024,
  height = 584,
  quality = 0.8
) => {
  try {
    const options = {
      maxSizeMB,
      maxWidthOrHeight: Math.max(width, height),
      useWebWorker: true,
      maxIteration: 10,
      fileType: imageFile.type || 'image/jpeg',
    };

    console.log(`Compressing ${imageFile.name}: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    let compressedFile = await imageCompression(imageFile, options);
    
    console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Resize to exact dimensions
    console.log(`Resizing to ${width}x${height}`);
    compressedFile = await resizeImageToExactDimensions(compressedFile, width, height);
    
    console.log(`Final size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB (${width}x${height})`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return imageFile; // Return original if compression fails
  }
};

/**
 * Compress multiple images and resize to exact dimensions
 * @param {File[]} imageFiles - Array of image files
 * @param {number} maxSizeMB - Maximum size in MB (default: 0.4)
 * @param {number} width - Target width in pixels (default: 1024)
 * @param {number} height - Target height in pixels (default: 584)
 * @param {number} quality - Compression quality 0-1 (default: 0.75)
 * @returns {Promise<File[]>} - Array of compressed and resized images
 */
export const compressImages = async (
  imageFiles,
  maxSizeMB = 0.4,
  width = 1024,
  height = 584,
  quality = 0.75
) => {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return [];
  }

  try {
    const compressedImages = await Promise.all(
      imageFiles.map((file) => compressImage(file, maxSizeMB, width, height, quality))
    );
    return compressedImages;
  } catch (error) {
    console.error('Error compressing images:', error);
    return imageFiles; // Return originals if compression fails
  }
};
