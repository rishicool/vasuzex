/**
 * Image Routes
 */

import { Router } from 'express';
import { ImageController } from '../controllers/ImageController.js';

const router = Router();
const controller = new ImageController();

/**
 * @route   GET /sizes
 * @desc    Get list of allowed thumbnail sizes
 * @access  Public
 */
router.get('/sizes', controller.getAllowedSizes);

/**
 * @route   GET /cache/stats
 * @desc    Get cache statistics
 * @access  Public
 */
router.get('/cache/stats', controller.getCacheStats);

/**
 * @route   DELETE /cache/clear
 * @desc    Clear expired cache
 * @access  Public
 */
router.delete('/cache/clear', controller.clearExpiredCache);

/**
 * @route   GET /*
 * @desc    Get image with optional thumbnail dimensions
 * @query   w - Width in pixels (optional, default: 800)
 * @query   h - Height in pixels (optional, default: 800)
 * @access  Public
 * 
 * Examples:
 * - GET /image/uploads/products/123/photo.jpg (800x800)
 * - GET /image/uploads/products/123/photo.jpg?w=400&h=400 (400x400)
 */
router.get('/*', controller.getImage);

export default router;
