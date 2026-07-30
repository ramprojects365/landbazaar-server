import * as imageUploadService from '../services/imageUploadService.js';
const MAX_IMAGES = 15;
export const uploadImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                message: 'No images provided'
            });
            return;
        }
        if (files.length > MAX_IMAGES) {
            res.status(400).json({
                success: false,
                message: `Maximum ${MAX_IMAGES} images allowed`
            });
            return;
        }
        const imageUrls = await imageUploadService.uploadMultipleToSpaces(files);
        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            data: {
                imageUrls
            }
        });
    }
    catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Failed to upload images'
        });
    }
};
export const uploadSingleImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No image provided'
            });
            return;
        }
        const imageUrl = await imageUploadService.uploadToSpaces(file);
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl
            }
        });
    }
    catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
};
export const deleteImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
            return;
        }
        await imageUploadService.deleteFromSpaces(imageUrl);
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete image'
        });
    }
};
//# sourceMappingURL=imageUploadController.js.map