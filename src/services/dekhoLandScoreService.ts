import { Property } from '../entities/Property.js';

export type DekhoLandScoreBreakdownKey =
  | 'images'
  | 'documents'
  | 'location'
  | 'growth'
  | 'price'
  | 'road';

export interface DekhoLandScoreBreakdownItem {
  key: DekhoLandScoreBreakdownKey;
  label: string;
  score: number;
}

export interface DekhoLandScoreDetails {
  score: number;
  ratingLabel: string;
  lastUpdated: string;
  breakdown: DekhoLandScoreBreakdownItem[];
}

const formatScoreDate = (date?: Date | string | null): string => {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getRatingLabel = (score: number): string => {
  if (score >= 85) return 'Very Good';
  if (score >= 75) return 'Good';
  return 'Average';
};

const countValidMedia = (images?: unknown[], videos?: unknown[]): number => {
  let count = 0;
  if (Array.isArray(images)) {
    for (const item of images) {
      if (!item) continue;
      if (typeof item === 'string' && item.trim().length > 0) {
        count += 1;
      } else if (typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const url = obj.url || obj.imageUrl || obj.src;
        if (typeof url === 'string' && url.trim().length > 0) {
          count += 1;
        }
      }
    }
  }
  if (Array.isArray(videos)) {
    for (const item of videos) {
      if (!item) continue;
      if (typeof item === 'string' && item.trim().length > 0) {
        count += 1;
      } else if (typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const url = obj.url || obj.videoUrl || obj.src;
        if (typeof url === 'string' && url.trim().length > 0) {
          count += 1;
        }
      }
    }
  }
  return count;
};

const countValidDocuments = (documents?: unknown[]): number => {
  if (!Array.isArray(documents)) return 0;
  let count = 0;
  for (const item of documents) {
    if (!item) continue;
    if (typeof item === 'string' && item.trim().length > 0) {
      count += 1;
    } else if (typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const url = obj.url || obj.documentUrl || obj.path;
      if (typeof url === 'string' && url.trim().length > 0) {
        count += 1;
      }
    }
  }
  return count;
};

const hasValidGoogleLocation = (property: Partial<Property>): boolean => {
  if (typeof property.googleLocationPath === 'string' && property.googleLocationPath.trim().length > 0) {
    return true;
  }
  if (
    property.latitude != null &&
    property.longitude != null &&
    Number.isFinite(Number(property.latitude)) &&
    Number.isFinite(Number(property.longitude)) &&
    (Number(property.latitude) !== 0 || Number(property.longitude) !== 0)
  ) {
    return true;
  }
  return false;
};

/**
 * Computes Dekho Land Score based on the 3 core criteria:
 * - Base score: 95%
 * - Minimum 3 images required; if less than 3 images, reduce 15%
 * - Minimum 1 document required; if no document uploaded, reduce 10%
 * - Google location required; if not added, reduce 5%
 *
 * All 3 valid => 95%
 * All 3 invalid => 65%
 * Minimum 65%, Maximum 95%
 */
export const calculateDekhoLandScore = (
  property: Partial<Property>
): { score: number; details: DekhoLandScoreDetails } => {
  let score = 95;

  // 1. Minimum 3 images: reduce 15% if < 3
  const mediaCount = countValidMedia(property.images, (property as any).videos);
  const hasMinImages = mediaCount >= 3;
  if (!hasMinImages) {
    score -= 15;
  }

  // 2. Minimum 1 document: reduce 10% if 0
  const docCount = countValidDocuments(property.documents);
  const hasDocuments = docCount >= 1;
  if (!hasDocuments) {
    score -= 10;
  }

  // 3. Google location: reduce 5% if not added
  const hasLocation = hasValidGoogleLocation(property);
  if (!hasLocation) {
    score -= 5;
  }

  // Ensure strict [65, 95] bounds
  const finalScore = Math.min(95, Math.max(65, score));
  const ratingLabel = getRatingLabel(finalScore);
  const lastUpdated = formatScoreDate(property.updatedAt || property.createdAt);

  const breakdown: DekhoLandScoreBreakdownItem[] = [
    {
      key: 'images',
      label: hasMinImages
        ? `Photos & Media (${mediaCount} uploaded, meets min 3)`
        : `Photos & Media (${mediaCount} uploaded — needs min 3, -15%)`,
      score: hasMinImages ? 95 : 80
    },
    {
      key: 'documents',
      label: hasDocuments
        ? `Legal Documents (${docCount} uploaded)`
        : `Legal Documents (No document uploaded, -10%)`,
      score: hasDocuments ? 95 : 85
    },
    {
      key: 'location',
      label: hasLocation
        ? 'Google Map Location (Added)'
        : 'Google Map Location (Not added, -5%)',
      score: hasLocation ? 95 : 90
    }
  ];

  const details: DekhoLandScoreDetails = {
    score: finalScore,
    ratingLabel,
    lastUpdated,
    breakdown
  };

  return {
    score: finalScore,
    details
  };
};
