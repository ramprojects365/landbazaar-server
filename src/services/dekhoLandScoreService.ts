import { Property } from '../entities/Property.js';

export type DekhoLandScoreBreakdownKey =
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

const parseRoadWidthFeet = (roadWidth?: string | null): number => {
  if (!roadWidth) return 0;
  const match = roadWidth.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const formatScoreDate = (date?: Date | string | null): string => {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getRatingLabel = (score: number): string => {
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  return 'Average';
};

const isAffirmative = (val: unknown): boolean => {
  if (val === true) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'yes' || s === 'true' || s === 'y' || s === 'available' || s === 'ready' || s === 'clear';
  }
  return false;
};

/**
 * Deterministically computes Dekho Land Score and category breakdown for a property.
 */
export const calculateDekhoLandScore = (property: Partial<Property>): { score: number; details: DekhoLandScoreDetails } => {
  // 1. Documents & Verification (Weight 25%)
  let documentsScore = 20; // Baseline
  if (isAffirmative(property.clearTitle)) documentsScore += 20;
  if (isAffirmative(property.registrationReady)) documentsScore += 20;
  if (Array.isArray(property.approvalTypes) && property.approvalTypes.length > 0) documentsScore += 20;
  if (Array.isArray(property.documents) && property.documents.length > 0) documentsScore += 15;
  if (property.verified === true) documentsScore += 20;
  documentsScore = Math.min(100, Math.max(20, documentsScore));

  // 2. Location & Connectivity (Weight 25%)
  let locationScore = 20; // Baseline
  if (property.cityName && property.cityName.trim().length > 0) locationScore += 20;
  if (property.landmark && property.landmark.trim().length > 0) locationScore += 20;
  if (property.latitude != null && property.longitude != null) locationScore += 25;
  if (property.googleLocationPath && property.googleLocationPath.trim().length > 0) locationScore += 10;
  if (property.streetName || property.location) locationScore += 10;
  locationScore = Math.min(100, Math.max(20, locationScore));

  // 3. Growth Potential (Weight 15%)
  let growthScore = 20; // Baseline
  const approvals = Array.isArray(property.approvalTypes) ? property.approvalTypes.map(a => a.toUpperCase()) : [];
  const highGrowthApprovals = ['HMDA', 'RERA', 'DTCP', 'HUDA', 'CMDA', 'BDA', 'TIDCO'];
  const hasHighGrowthApproval = approvals.some(a => highGrowthApprovals.some(hg => a.includes(hg)));
  if (hasHighGrowthApproval) {
    growthScore += 35;
  } else if (approvals.length > 0) {
    growthScore += 20;
  }
  if (property.surveyNumber && property.surveyNumber.trim().length > 0) growthScore += 25;
  if (property.tenure && property.tenure.toLowerCase().includes('freehold')) growthScore += 10;
  if (property.facingDirection && property.facingDirection.trim().length > 0) growthScore += 10;
  growthScore = Math.min(100, Math.max(20, growthScore));

  // 4. Price Value (Weight 15%)
  let priceScore = 20; // Baseline
  if ((property.pricePerUnit && property.pricePerUnit > 0) || (property.price && property.price > 0)) {
    priceScore += 40;
  }
  if (property.negotiable !== undefined && property.negotiable !== null) priceScore += 20;
  if (isAffirmative(property.loanFacility)) {
    priceScore += 20;
  }
  priceScore = Math.min(100, Math.max(20, priceScore));

  // 5. Road & Infrastructure (Weight 20%)
  let roadScore = 20; // Baseline
  const roadWidthFt = parseRoadWidthFeet(property.roadWidth);
  if (roadWidthFt >= 40) {
    roadScore += 30;
  } else if (roadWidthFt >= 30) {
    roadScore += 20;
  } else if (property.roadWidth && property.roadWidth.trim().length > 0) {
    roadScore += 15;
  }
  if (isAffirmative(property.cornerPlot)) roadScore += 15;

  const facilities = Array.isArray(property.amenities?.facilities) ? property.amenities.facilities : [];
  const security = Array.isArray(property.amenities?.security) ? property.amenities.security : [];
  const totalAmenities = facilities.length + security.length;
  if (totalAmenities >= 5) {
    roadScore += 35;
  } else if (totalAmenities >= 2) {
    roadScore += 20;
  } else if (totalAmenities > 0) {
    roadScore += 10;
  }
  roadScore = Math.min(100, Math.max(20, roadScore));

  // Weighted overall score
  const overallScore = Math.min(
    100,
    Math.max(
      25,
      Math.round(
        documentsScore * 0.25 +
        locationScore * 0.25 +
        roadScore * 0.20 +
        growthScore * 0.15 +
        priceScore * 0.15
      )
    )
  );

  const breakdown: DekhoLandScoreBreakdownItem[] = [
    { key: 'documents', label: 'Documents & Verification', score: documentsScore },
    { key: 'location', label: 'Location & Connectivity', score: locationScore },
    { key: 'growth', label: 'Growth Potential', score: growthScore },
    { key: 'price', label: 'Price Value', score: priceScore },
    { key: 'road', label: 'Road & Infrastructure', score: roadScore }
  ];

  const ratingLabel = getRatingLabel(overallScore);
  const lastUpdated = formatScoreDate(property.updatedAt || property.createdAt);

  const details: DekhoLandScoreDetails = {
    score: overallScore,
    ratingLabel,
    lastUpdated,
    breakdown
  };

  return {
    score: overallScore,
    details
  };
};
