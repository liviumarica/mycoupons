'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast, Button, Skeleton } from '@coupon-management/ui';
import { Coupon, FilterState, applyFiltersAndSort } from '@coupon-management/core';
import CouponCard from '@/components/CouponCard';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import { Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_STORAGE_KEY = 'coupon-filters';
const ITEMS_PER_PAGE = 12;

function SuccessHandler() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const success = searchParams.get('success');

    if (success === 'coupon-added') {
      toast({
        title: 'Success!',
        description: 'Your coupon has been saved successfully.',
      });

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, toast]);

  return null;
}

// Load filters from localStorage
function loadFiltersFromStorage(): FilterState {
  if (typeof window === 'undefined') {
    return { sortBy: 'expiration', sortOrder: 'asc' };
  }

  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load filters from localStorage:', error);
  }

  return { sortBy: 'expiration', sortOrder: 'asc' };
}

// Save filters to localStorage
function saveFiltersToStorage(filters: FilterState) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters to localStorage:', error);
  }
}

export default function DashboardClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(loadFiltersFromStorage);
  const [highlightedCouponId, setHighlightedCouponId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Handle coupon highlighting from notification clicks
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedCouponId(highlight);
      
      // Scroll to highlighted coupon after a short delay
      setTimeout(() => {
        const element = document.getElementById(`coupon-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);

      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedCouponId(null);
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard');
      }, 3000);
    }
  }, [searchParams]);

  // Fetch coupons
  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    saveFiltersToStorage(filters);
  }, [filters]);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { fetchWithRetry, isOnline } = await import('@/lib/api-client');
      
      // Check if user is online
      if (!isOnline()) {
        throw new Error('You are offline. Please check your internet connection.');
      }

      // Use cache for GET requests with 2 minute TTL
      const result = await fetchWithRetry('/api/coupons', {}, {
        useCache: true,
        cacheTTL: 2 * 60 * 1000, // 2 minutes
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch coupons');
      }

      setCoupons(result.data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load coupons';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      const { fetchWithRetry, isOnline, invalidateApiCache } = await import('@/lib/api-client');
      
      // Check if user is online
      if (!isOnline()) {
        throw new Error('You are offline. Please check your internet connection.');
      }

      const result = await fetchWithRetry(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete coupon');
      }

      // Invalidate coupons cache
      invalidateApiCache('api:/api/coupons');

      // Remove coupon from state
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));

      toast({
        title: 'Success',
        description: 'Coupon deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete coupon';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get unique merchants for filter dropdown
  const uniqueMerchants = useMemo(() => {
    const merchants = new Set(coupons.map((c) => c.merchant));
    return Array.from(merchants).sort();
  }, [coupons]);

  // Apply filters and sorting
  const filteredAndSortedCoupons = useMemo(() => {
    return applyFiltersAndSort(coupons, filters);
  }, [coupons, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedCoupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedCoupons.slice(startIndex, endIndex);
  }, [filteredAndSortedCoupons, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SuccessHandler />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Coupons</h2>
            <p className="mt-1 text-sm text-gray-600">
              {coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'}{' '}
              saved
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/add-coupon">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Coupon
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State with Skeletons */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Filter Bar Skeleton */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-9 w-48" />
              </div>
            </div>
            
            {/* Coupon Cards Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCoupons}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && coupons.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto max-w-md">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No coupons yet
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Get started by adding your first coupon. You can paste text or
                upload an image.
              </p>
              <Link href="/add-coupon">
                <Button className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Coupon
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        {!isLoading && !error && coupons.length > 0 && (
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            merchants={uniqueMerchants}
          />
        )}

        {/* Filtered Results Info */}
        {!isLoading && !error && coupons.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedCoupons.length} of {coupons.length}{' '}
            {coupons.length === 1 ? 'coupon' : 'coupons'}
          </div>
        )}

        {/* No Results After Filtering */}
        {!isLoading &&
          !error &&
          coupons.length > 0 &&
          filteredAndSortedCoupons.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-600">
                No coupons match your current filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({ sortBy: 'expiration', sortOrder: 'asc' })
                }
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}

        {/* Coupons Grid with Animation */}
        {!isLoading &&
          !error &&
          coupons.length > 0 &&
          filteredAndSortedCoupons.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {paginatedCoupons.map((coupon) => (
                    <motion.div
                      key={coupon.id}
                      id={`coupon-${coupon.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        ...(highlightedCouponId === coupon.id && {
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
                          borderRadius: '0.5rem',
                        })
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CouponCard coupon={coupon} onDelete={handleDelete} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredAndSortedCoupons.length}
                />
              )}
            </>
          )}
      </div>
    </>
  );
}
