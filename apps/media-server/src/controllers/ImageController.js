/**
 * Image Controller
 * Handles dynamic image thumbnail requests
 */

import { Controller } from '@vasuzex/framework/Http/Controller.js';
import { Media } from '@vasuzex/framework/Support/Facades/Media.js';

export class ImageController extends Controller {
  /**
   * GET /image/*?w=300&h=300
   * Get image with optional thumbnail dimensions
   */
  getImage = async (req, res) => {
    try {
      let imagePath = req.params[0];
      let { w, h } = req.query;

      if (!imagePath) {
        return this.error(res, 'Image path is required', 400);
      }

      // Add uploads/ prefix if not present
      if (!imagePath.startsWith('uploads/')) {
        imagePath = `uploads/${imagePath}`;
      }

      // Default dimensions if not specified
      if (!w || !h) {
        w = '800';
        h = '800';
      }

      // Parse dimensions
      const width = parseInt(w, 10);
      const height = parseInt(h, 10);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return this.error(res, 'Invalid width or height values', 400);
      }

      // Get or generate image
      const result = await Media.getImage(imagePath, width, height);

      // Set cache headers
      res.set({
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=604800',
        'X-Cache': result.fromCache ? 'HIT' : 'MISS',
      });

      res.send(result.buffer);
    } catch (error) {
      console.error('Error serving image:', error);

      if (error.message.includes('Invalid thumbnail size')) {
        return this.error(res, error.message, 400);
      }

      if (error.message.includes('not found') || error.message.includes('ENOENT')) {
        return this.error(res, 'Image not found', 404);
      }

      return this.error(res, 'Failed to process image', 500);
    }
  };

  /**
   * GET /sizes
   * Get list of allowed thumbnail sizes
   */
  getAllowedSizes = async (req, res) => {
    try {
      const sizes = await Media.getAllowedSizes();
      return this.success(res, sizes, 'Allowed thumbnail sizes retrieved');
    } catch (error) {
      console.error('Error getting sizes:', error);
      return this.error(res, 'Failed to get sizes', 500);
    }
  };

  /**
   * GET /cache/stats
   * Get cache statistics
   */
  getCacheStats = async (req, res) => {
    try {
      const stats = await Media.getCacheStats();
      return this.success(res, stats, 'Cache statistics retrieved');
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return this.error(res, 'Failed to get cache stats', 500);
    }
  };

  /**
   * DELETE /cache/clear
   * Clear expired cache
   */
  clearExpiredCache = async (req, res) => {
    try {
      const cleared = await Media.clearExpiredCache();
      return this.success(res, { cleared }, `Cleared ${cleared} expired thumbnails`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      return this.error(res, 'Failed to clear cache', 500);
    }
  };

  /**
   * GET /health
   * Health check
   */
  health = async (req, res) => {
    return this.success(res, {
      status: 'healthy',
      service: 'media-server',
      timestamp: new Date().toISOString(),
    });
  };
}
