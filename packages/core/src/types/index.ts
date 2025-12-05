export type DiscountType = 'percent' | 'amount' | 'bogo' | 'other';
export type CouponSource = 'text' | 'image';
export type ExpirationStatus = 'all' | 'expiring_soon' | 'active' | 'expired';
export type SortBy = 'expiration' | 'merchant' | 'discount_value';
export type SortOrder = 'asc' | 'desc';

export interface Coupon {
  id: string;
  userId: string;
  merchant: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date;
  validUntil: Date;
  conditions: string;
  source: CouponSource;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedCoupon {
  merchant: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date | null;
  validUntil: Date | null;
  conditions: string;
  confidence: Record<string, number>;
}

export interface ReminderPreferences {
  id: string;
  userId: string;
  remind7Days: boolean;
  remind3Days: boolean;
  remind1Day: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FilterState {
  merchant?: string;
  discountType?: DiscountType;
  expirationStatus?: ExpirationStatus;
  sortBy: SortBy;
  sortOrder: SortOrder;
}
