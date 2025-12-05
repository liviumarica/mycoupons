'use client';

import { useState } from 'react';
import { Button, Card, Textarea } from '@coupon-management/ui';
import type { ExtractedCoupon } from '@coupon-management/core';
import ExtractionReview from './ExtractionReview';
import ImageUploader from './ImageUploader';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

type InputMode = 'text' | 'image';

export default function AddCouponForm() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCoupon | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textInput.trim()) {
      setError('Please enter coupon text');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const { fetchWithRetry } = await import('@/lib/api-client');
      
      const result = await fetchWithRetry('/api/coupons/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text',
          content: textInput,
        }),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to extract coupon data');
      }

      setExtractedData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to extract coupon data. Please try again.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('coupon-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('coupon-images').getPublicUrl(data.path);

      setImageUrl(publicUrl);

      // Now extract data from the image
      setIsExtracting(true);

      const { fetchWithRetry } = await import('@/lib/api-client');
      
      const result = await fetchWithRetry('/api/coupons/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          content: publicUrl,
        }),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to extract coupon data');
      }

      setExtractedData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process image'
      );
      setImageUrl(null);
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setTextInput('');
    setImageUrl(null);
    setError(null);
  };

  // If we have extracted data, show the review form
  if (extractedData) {
    return (
      <ExtractionReview
        extractedData={extractedData}
        originalSource={inputMode === 'text' ? textInput : imageUrl || ''}
        sourceType={inputMode}
        onCancel={handleCancel}
      />
    );
  }

  // Otherwise, show the input form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        {/* Mode Selector */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 relative">
            <motion.button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                inputMode === 'text'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Text Input
              {inputMode === 'text' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setInputMode('image')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                inputMode === 'image'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Image Upload
              {inputMode === 'image' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
        </div>

        <motion.h2
          key={inputMode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          {inputMode === 'text' ? 'Add Coupon from Text' : 'Add Coupon from Image'}
        </motion.h2>

        <AnimatePresence mode="wait">
          {inputMode === 'text' ? (
            <motion.form
              key="text-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleTextSubmit}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="coupon-text"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Paste your coupon text
                </label>
                <Textarea
                  id="coupon-text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste coupon details here... (e.g., 'Get 20% off at Amazon with code SAVE20, valid until Dec 31, 2025')"
                  rows={8}
                  disabled={isExtracting}
                  className="w-full"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Paste any text containing coupon information. Our AI will extract
                  the details automatically.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-md bg-red-50 p-4"
                  >
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" disabled={isExtracting || !textInput.trim()}>
                    {isExtracting ? (
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
                        Extracting...
                      </>
                    ) : (
                      'Extract Coupon Data'
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="image-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload coupon image
                </label>
                <ImageUploader
                  onUpload={handleImageUpload}
                  disabled={isUploading || isExtracting}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload a screenshot or photo of your coupon. Our AI will extract
                  the details automatically.
                </p>
              </div>

              <AnimatePresence>
                {(isUploading || isExtracting) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-md bg-blue-50 p-4"
                  >
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-600 mr-3"
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
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          {isUploading ? 'Uploading image...' : 'Extracting coupon data...'}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          This may take a few moments
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-md bg-red-50 p-4"
                  >
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
