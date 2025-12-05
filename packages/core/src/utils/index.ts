import type { Coupon, FilterState, SortBy, SortOrder } from '../types';

/**
 * Calculate days until expiration
 * Returns negative number if expired
 */
export function daysUntilExpiration(expirationDate: Date): number {
  const now = new Date();
  const expiry = new Date(expirationDate);
  
  // Reset time to midnight for accurate day calculation
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if a coupon is expired
 */
export function isExpired(expirationDate: Date): boolean {
  return daysUntilExpiration(expirationDate) < 0;
}

/**
 * Check if a coupon is expiring soon (within 14 days)
 */
export function isExpiringSoon(expirationDate: Date): boolean {
  const days = daysUntilExpiration(expirationDate);
  return days >= 0 && days <= 14;
}

/**
 * Check if a coupon is active (not expired)
 */
export function isActive(expirationDate: Date): boolean {
  return daysUntilExpiration(expirationDate) >= 0;
}

/**
 * Get expiration status of a coupon
 */
export function getExpirationStatus(expirationDate: Date): 'expired' | 'expiring_soon' | 'active' {
  if (isExpired(expirationDate)) {
    return 'expired';
  }
  if (isExpiringSoon(expirationDate)) {
    return 'expiring_soon';
  }
  return 'active';
}

/**
 * Filter coupons based on filter state
 */
export function filterCoupons(coupons: Coupon[], filters: FilterState): Coupon[] {
  return coupons.filter(coupon => {
    // Filter by merchant
    if (filters.merchant && coupon.merchant !== filters.merchant) {
      return false;
    }

    // Filter by discount type
    if (filters.discountType && coupon.discountType !== filters.discountType) {
      return false;
    }

    // Filter by expiration status
    if (filters.expirationStatus && filters.expirationStatus !== 'all') {
      const status = getExpirationStatus(coupon.validUntil);
      if (status !== filters.expirationStatus) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort coupons based on sort criteria
 */
export function sortCoupons(coupons: Coupon[], sortBy: SortBy, sortOrder: SortOrder): Coupon[] {
  const sorted = [...coupons];
  
  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'expiration':
        comparison = a.validUntil.getTime() - b.validUntil.getTime();
        break;
      case 'merchant':
        comparison = a.merchant.localeCompare(b.merchant);
        break;
      case 'discount_value':
        comparison = a.discountValue - b.discountValue;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Apply filters and sorting to coupons
 */
export function applyFiltersAndSort(coupons: Coupon[], filters: FilterState): Coupon[] {
  const filtered = filterCoupons(coupons, filters);
  return sortCoupons(filtered, filters.sortBy, filters.sortOrder);
}

/**
 * Format discount value for display
 */
export function formatDiscount(discountValue: number, discountType: string): string {
  switch (discountType) {
    case 'percent':
      return `${discountValue}%`;
    case 'amount':
      return `$${discountValue.toFixed(2)}`;
    case 'bogo':
      return 'BOGO';
    default:
      return discountValue.toString();
  }
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(date: Date): string {
  const days = daysUntilExpiration(date);
  
  if (days < 0) {
    return 'Expired';
  }
  
  if (days === 0) {
    return 'Expires today';
  }
  
  if (days === 1) {
    return 'Expires tomorrow';
  }
  
  if (days <= 14) {
    return `Expires in ${days} days`;
  }
  
  return date.toLocaleDateString();
}
