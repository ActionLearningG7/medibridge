/**
 * Custom hook for handling file downloads
 * Converts blob data to downloadable file
 */
import { useCallback } from 'react';

export const useFileDownload = () => {
  const downloadFile = useCallback((blob, filename) => {
    if (!blob) {
      console.error('No blob provided for download');
      throw new Error('No file data to download');
    }

    if (blob.size === 0) {
      console.error('Blob is empty');
      throw new Error('Downloaded file is empty');
    }

    let blobUrl = null;
    try {
      // Log for debugging
      console.log(`Starting download: filename=${filename}, size=${blob.size}, type=${blob.type}`);

      // Create blob URL
      blobUrl = window.URL.createObjectURL(blob);

      // Create temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      link.style.display = 'none';
      link.setAttribute('rel', 'noopener noreferrer');

      // Append to body (required for Firefox)
      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Small delay before cleanup (prevents issues in some browsers)
      setTimeout(() => {
        document.body.removeChild(link);
        if (blobUrl) {
          window.URL.revokeObjectURL(blobUrl);
        }
        console.log(`✓ Download completed: ${filename}`);
      }, 100);

    } catch (error) {
      console.error('Error downloading file:', error);
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
      throw error;
    }
  }, []);

  return { downloadFile };
};
