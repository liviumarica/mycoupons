import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ExtractedCoupon, DiscountType } from '@coupon-management/core';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Delays execution for the specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extracts coupon data from text using GPT-4
 */
async function extractFromText(text: string): Promise<ExtractedCoupon> {
  const systemPrompt = `You are a coupon data extraction assistant. Extract structured coupon information from the provided text.
Return a JSON object with the following fields:
- merchant: string (name of the store/company)
- title: string (brief description of the offer)
- code: string (the coupon/promo code)
- discountType: "percent" | "amount" | "bogo" | "other"
- discountValue: number (percentage or dollar amount)
- validFrom: ISO date string or null
- validUntil: ISO date string or null
- conditions: string (terms and conditions, restrictions)
- confidence: object with field names as keys and confidence scores (0-1) as values

If a field cannot be determined, use empty string for strings, 0 for numbers, or null for dates.
For confidence, rate how certain you are about each extracted field (0 = uncertain, 1 = very certain).`;

  const userPrompt = `Extract coupon information from this text:\n\n${text}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(content);
  return normalizeExtractedData(parsed);
}

/**
 * Extracts coupon data from an image using GPT-4 Vision
 */
async function extractFromImage(imageUrl: string): Promise<ExtractedCoupon> {
  const systemPrompt = `You are a coupon data extraction assistant. Extract structured coupon information from the provided image.
Return a JSON object with the following fields:
- merchant: string (name of the store/company)
- title: string (brief description of the offer)
- code: string (the coupon/promo code)
- discountType: "percent" | "amount" | "bogo" | "other"
- discountValue: number (percentage or dollar amount)
- validFrom: ISO date string or null
- validUntil: ISO date string or null
- conditions: string (terms and conditions, restrictions)
- confidence: object with field names as keys and confidence scores (0-1) as values

If a field cannot be determined, use empty string for strings, 0 for numbers, or null for dates.
For confidence, rate how certain you are about each extracted field (0 = uncertain, 1 = very certain).`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract coupon information from this image:',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(content);
  return normalizeExtractedData(parsed);
}

/**
 * Normalizes extracted data to match ExtractedCoupon interface
 */
function normalizeExtractedData(data: any): ExtractedCoupon {
  return {
    merchant: data.merchant || '',
    title: data.title || '',
    code: data.code || '',
    discountType: (data.discountType || 'other') as DiscountType,
    discountValue: Number(data.discountValue) || 0,
    validFrom: data.validFrom ? new Date(data.validFrom) : null,
    validUntil: data.validUntil ? new Date(data.validUntil) : null,
    conditions: data.conditions || '',
    confidence: data.confidence || {},
  };
}

/**
 * Executes a function with retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication errors or invalid requests
      if (
        error instanceof Error &&
        (error.message.includes('authentication') ||
          error.message.includes('invalid') ||
          error.message.includes('API key'))
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * POST /api/coupons/extract
 * Extracts coupon data from text or image
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, content } = body;

    // Validate request
    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type and content' },
        { status: 400 }
      );
    }

    if (type !== 'text' && type !== 'image') {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "text" or "image"' },
        { status: 400 }
      );
    }

    // Extract coupon data with retry logic
    let extractedData: ExtractedCoupon;

    if (type === 'text') {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Content must be a non-empty string' },
          { status: 400 }
        );
      }

      extractedData = await withRetry(() => extractFromText(content));
    } else {
      // For images, content should be a URL (already uploaded to Supabase Storage)
      if (typeof content !== 'string' || !content.startsWith('http')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Content must be a valid image URL for image extraction',
          },
          { status: 400 }
        );
      }

      extractedData = await withRetry(() => extractFromImage(content));
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error('Error extracting coupon data:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'Invalid OpenAI API key' },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: 'Request timeout. Please try again.' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to extract coupon data' },
      { status: 500 }
    );
  }
}
