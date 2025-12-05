'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Input,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@coupon-management/ui';
import type { ExtractedCoupon, DiscountType } from '@coupon-management/core';
import { validateCoupon } from '@coupon-management/core';
import { motion, AnimatePresence } from 'framer-motion';

// Utility function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface ExtractionReviewProps {
  extractedData: ExtractedCoupon;
  originalSource: string;
  sourceType?: 'text' | 'image';
  onCancel: () => void;
}

// Confidence threshold for marking fields as needing attention
const LOW_CONFIDENCE_THRESHOLD = 0.7;

export default function ExtractionReview({
  extractedData,
  originalSource,
  sourceType = 'text',
  onCancel,
}: ExtractionReviewProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    merchant: extractedData.merchant,
    title: extractedData.title,
    code: extractedData.code,
    discountType: extractedData.discountType,
    discountValue: extractedData.discountValue.toString(),
    validFrom: extractedData.validFrom
      ? new Date(extractedData.validFrom).toISOString().split('T')[0]
      : '',
    validUntil: extractedData.validUntil
      ? new Date(extractedData.validUntil).toISOString().split('T')[0]
      : '',
    conditions: extractedData.conditions,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Check if a field needs attention (empty or low confidence)
  const needsAttention = (fieldName: string, value: string) => {
    const isEmpty = !value || value.trim() === '' || value === '0';
    const confidence = extractedData.confidence[fieldName] || 0;
    const isLowConfidence = confidence < LOW_CONFIDENCE_THRESHOLD;
    return isEmpty || isLowConfidence;
  };

  const handleChange = (
    field: string,
    value: string | number | DiscountType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user makes changes
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form data
    const validationData = {
      merchant: formData.merchant,
      title: formData.title,
      code: formData.code,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      validFrom: formData.validFrom ? new Date(formData.validFrom) : new Date(),
      validUntil: formData.validUntil
        ? new Date(formData.validUntil)
        : new Date(),
    };

    const validation = validateCoupon(validationData);

    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        newErrors[error.field] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    try {
      const { fetchWithRetry, isOnline } = await import('@/lib/api-client');
      
      // Check if user is online
      if (!isOnline()) {
        throw new Error('You are offline. Please check your internet connection.');
      }

      // Save coupon to database
      const result = await fetchWithRetry('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant: formData.merchant,
          title: formData.title,
          code: formData.code,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          conditions: formData.conditions,
          source: sourceType,
          imageUrl: sourceType === 'image' ? originalSource : undefined,
        }),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save coupon');
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?success=coupon-added');
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : 'Failed to save coupon. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Original Source Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {sourceType === 'text' ? 'Original Text' : 'Original Image'}
          </h3>
          {sourceType === 'text' ? (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {originalSource}
            </p>
          ) : (
            <div className="flex justify-center">
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                src={originalSource}
                alt="Original coupon"
                className="max-h-64 object-contain rounded-lg"
              />
            </div>
          )}
        </Card>
      </motion.div>

      {/* Extraction Review Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Review Extracted Data
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Fields highlighted in yellow need your attention. Please review and
              correct any errors.
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Merchant */}
          <FormField
            name="merchant"
            error={errors.merchant}
          >
            <FormLabel>Merchant *</FormLabel>
            <FormControl>
              <Input
                value={formData.merchant}
                onChange={(e) => handleChange('merchant', e.target.value)}
                placeholder="e.g., Amazon, Target, Walmart"
                className={cn(
                  needsAttention('merchant', formData.merchant) &&
                    'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                )}
              />
            </FormControl>
            {needsAttention('merchant', formData.merchant) && !errors.merchant && (
              <p className="text-xs text-yellow-700 mt-1">
                ⚠️ This field needs your attention
              </p>
            )}
            <FormMessage />
          </FormField>

          {/* Title */}
          <FormField name="title" error={errors.title}>
            <FormLabel>Title *</FormLabel>
            <FormControl>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., 20% off all items"
                className={cn(
                  needsAttention('title', formData.title) &&
                    'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                )}
              />
            </FormControl>
            {needsAttention('title', formData.title) && !errors.title && (
              <p className="text-xs text-yellow-700 mt-1">
                ⚠️ This field needs your attention
              </p>
            )}
            <FormMessage />
          </FormField>

          {/* Code */}
          <FormField name="code" error={errors.code}>
            <FormLabel>Coupon Code *</FormLabel>
            <FormControl>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g., SAVE20"
                className={cn(
                  needsAttention('code', formData.code) &&
                    'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                )}
              />
            </FormControl>
            {needsAttention('code', formData.code) && !errors.code && (
              <p className="text-xs text-yellow-700 mt-1">
                ⚠️ This field needs your attention
              </p>
            )}
            <FormMessage />
          </FormField>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="discountType" error={errors.discountType}>
              <FormLabel>Discount Type *</FormLabel>
              <FormControl>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    handleChange('discountType', e.target.value as DiscountType)
                  }
                  className={cn(
                    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    needsAttention('discountType', formData.discountType) &&
                      'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                  )}
                >
                  <option value="percent">Percentage</option>
                  <option value="amount">Fixed Amount</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="other">Other</option>
                </select>
              </FormControl>
              {needsAttention('discountType', formData.discountType) &&
                !errors.discountType && (
                  <p className="text-xs text-yellow-700 mt-1">
                    ⚠️ This field needs your attention
                  </p>
                )}
              <FormMessage />
            </FormField>

            <FormField name="discountValue" error={errors.discountValue}>
              <FormLabel>Discount Value *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => handleChange('discountValue', e.target.value)}
                  placeholder="e.g., 20"
                  className={cn(
                    needsAttention('discountValue', formData.discountValue) &&
                      'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                  )}
                />
              </FormControl>
              {needsAttention('discountValue', formData.discountValue) &&
                !errors.discountValue && (
                  <p className="text-xs text-yellow-700 mt-1">
                    ⚠️ This field needs your attention
                  </p>
                )}
              <FormMessage />
            </FormField>
          </div>

          {/* Valid From and Until */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="validFrom" error={errors.validFrom}>
              <FormLabel>Valid From</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  className={cn(
                    needsAttention('validFrom', formData.validFrom) &&
                      'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                  )}
                />
              </FormControl>
              {needsAttention('validFrom', formData.validFrom) &&
                !errors.validFrom && (
                  <p className="text-xs text-yellow-700 mt-1">
                    ⚠️ This field needs your attention
                  </p>
                )}
              <FormMessage />
            </FormField>

            <FormField name="validUntil" error={errors.validUntil}>
              <FormLabel>Valid Until</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={cn(
                    needsAttention('validUntil', formData.validUntil) &&
                      'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                  )}
                />
              </FormControl>
              {needsAttention('validUntil', formData.validUntil) &&
                !errors.validUntil && (
                  <p className="text-xs text-yellow-700 mt-1">
                    ⚠️ This field needs your attention
                  </p>
                )}
              <FormMessage />
            </FormField>
          </div>

          {errors.dateRange && (
            <p className="text-sm text-red-600">{errors.dateRange}</p>
          )}

          {/* Conditions */}
          <FormField name="conditions" error={errors.conditions}>
            <FormLabel>Terms & Conditions</FormLabel>
            <FormControl>
              <textarea
                value={formData.conditions}
                onChange={(e) => handleChange('conditions', e.target.value)}
                placeholder="e.g., Valid on orders over $50. Cannot be combined with other offers."
                rows={3}
                className={cn(
                  'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  needsAttention('conditions', formData.conditions) &&
                    'bg-yellow-50 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                )}
              />
            </FormControl>
            {needsAttention('conditions', formData.conditions) &&
              !errors.conditions && (
                <p className="text-xs text-yellow-700 mt-1">
                  ⚠️ This field needs your attention
                </p>
              )}
            <FormMessage />
          </FormField>

          {/* Submit Error */}
          <AnimatePresence>
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-md bg-red-50 p-4"
              >
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {errors.submit}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Coupon'
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </motion.div>
          </div>
        </form>
      </Card>
      </motion.div>
    </motion.div>
  );
}
