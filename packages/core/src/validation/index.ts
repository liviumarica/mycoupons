import type { DiscountType } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a coupon code
 * Must be non-empty and contain only alphanumeric characters, hyphens, and underscores
 */
export function validateCouponCode(code: string): boolean {
  if (!code || code.trim().length === 0) {
    return false;
  }
  // Allow alphanumeric, hyphens, underscores, and spaces
  return /^[a-zA-Z0-9\-_\s]+$/.test(code.trim());
}

/**
 * Validates a merchant name
 * Must be non-empty
 */
export function validateMerchant(merchant: string): boolean {
  return Boolean(merchant && merchant.trim().length > 0);
}

/**
 * Validates a coupon title
 * Must be non-empty
 */
export function validateTitle(title: string): boolean {
  return Boolean(title && title.trim().length > 0);
}

/**
 * Validates a discount value
 * Must be a positive number
 */
export function validateDiscountValue(value: number, discountType: DiscountType): boolean {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return false;
  }
  
  // For percentage discounts, value should be between 0 and 100
  if (discountType === 'percent' && value > 100) {
    return false;
  }
  
  return true;
}

/**
 * Validates date range
 * validFrom must be before validUntil
 */
export function validateDateRange(validFrom: Date, validUntil: Date): boolean {
  if (!(validFrom instanceof Date) || !(validUntil instanceof Date)) {
    return false;
  }
  
  if (isNaN(validFrom.getTime()) || isNaN(validUntil.getTime())) {
    return false;
  }
  
  return validFrom < validUntil;
}

/**
 * Validates all coupon fields and returns validation result
 */
export function validateCoupon(coupon: {
  merchant: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date;
  validUntil: Date;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateMerchant(coupon.merchant)) {
    errors.push({ field: 'merchant', message: 'Merchant name is required' });
  }

  if (!validateTitle(coupon.title)) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!validateCouponCode(coupon.code)) {
    errors.push({ field: 'code', message: 'Valid coupon code is required' });
  }

  if (!validateDiscountValue(coupon.discountValue, coupon.discountType)) {
    errors.push({ 
      field: 'discountValue', 
      message: coupon.discountType === 'percent' 
        ? 'Discount value must be between 0 and 100 for percentage discounts'
        : 'Discount value must be a positive number'
    });
  }

  if (!validateDateRange(coupon.validFrom, coupon.validUntil)) {
    errors.push({ field: 'dateRange', message: 'Valid from date must be before valid until date' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
