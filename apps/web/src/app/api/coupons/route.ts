import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { couponQueries } from '@coupon-management/supabase';
import type { CouponSource, DiscountType } from '@coupon-management/core';

/**
 * POST /api/coupons
 * Creates a new coupon for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'merchant',
      'title',
      'code',
      'discountType',
      'discountValue',
      'validFrom',
      'validUntil',
      'source',
    ];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create coupon object
    const couponData = {
      userId: user.id,
      merchant: body.merchant,
      title: body.title,
      code: body.code,
      discountType: body.discountType as DiscountType,
      discountValue: parseFloat(body.discountValue),
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      conditions: body.conditions || '',
      source: body.source as CouponSource,
      imageUrl: body.imageUrl || undefined,
    };

    // Save to database
    const { data: coupon, error: dbError } = await couponQueries.createCoupon(
      supabase as any,
      couponData
    );

    if (dbError || !coupon) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: coupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/coupons
 * Retrieves all coupons for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Get user's coupons
    const { data: coupons, error: dbError } =
      await couponQueries.getUserCoupons(supabase as any, user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve coupons' },
        { status: 500 }
      );
    }

    // Return with cache headers for better performance
    return NextResponse.json(
      {
        success: true,
        data: coupons || [],
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving coupons:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
