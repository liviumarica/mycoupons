'use client';

import { FilterState, DiscountType, ExpirationStatus, SortBy, SortOrder } from '@coupon-management/core';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@coupon-management/ui';
import { Filter, X, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  merchants: string[];
}

export default function FilterBar({ filters, onFilterChange, merchants }: FilterBarProps) {
  const hasActiveFilters = 
    filters.merchant || 
    filters.discountType || 
    (filters.expirationStatus && filters.expirationStatus !== 'all');

  const clearFilters = () => {
    onFilterChange({
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Merchant Filter */}
        <div className="w-48">
          <Select
            value={filters.merchant || 'all'}
            onValueChange={(value) => updateFilter('merchant', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Merchants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Merchants</SelectItem>
              {merchants.map((merchant) => (
                <SelectItem key={merchant} value={merchant}>
                  {merchant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Discount Type Filter */}
        <div className="w-48">
          <Select
            value={filters.discountType || 'all'}
            onValueChange={(value) => updateFilter('discountType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percent">Percentage Off</SelectItem>
              <SelectItem value="amount">Amount Off</SelectItem>
              <SelectItem value="bogo">BOGO</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expiration Status Filter */}
        <div className="w-48">
          <Select
            value={filters.expirationStatus || 'all'}
            onValueChange={(value) => updateFilter('expirationStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Coupons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coupons</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon (14 days)</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="mr-1 h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort by:</span>
        </div>

        {/* Sort By */}
        <div className="w-48">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value as SortBy)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiration">Expiration Date</SelectItem>
              <SelectItem value="merchant">Merchant Name</SelectItem>
              <SelectItem value="discount_value">Discount Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="w-40">
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilter('sortOrder', value as SortOrder)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
