export declare const IMAGE_UPLOAD_LIMITS: {
    maxFileWeightBytes: number;
    maxWidth: number;
    maxHeight: number;
};
export declare const PROPERTY_IMAGE_MIME_TYPES: string[];
export declare const AVATAR_IMAGE_MIME_TYPES: string[];
interface ImageValidationOptions {
    allowedMimeTypes?: string[];
    maxFileWeightBytes?: number;
    maxWidth?: number;
    maxHeight?: number;
}
export declare const validateImageMimeType: (file: Express.Multer.File, allowedMimeTypes?: string[]) => void;
export declare const validateImageFile: (file: Express.Multer.File, options?: ImageValidationOptions) => Promise<void>;
export {};
//# sourceMappingURL=imageValidation.d.ts.map