'use client';

import { useState } from 'react';
import { Coupon } from '@coupon-management/core';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@coupon-management/ui';
import { Trash2, Copy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface CouponCardProps {
  coupon: Coupon;
  onDelete: (id: string) => void;
}

export default function CouponCard({ coupon, onDelete }: CouponCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(coupon.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  // Calculate days until expiration
  const today = new Date();
  const expiryDate = new Date(coupon.validUntil);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine expiration status
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 14;

  // Format discount display
  const formatDiscount = () => {
    switch (coupon.discountType) {
      case 'percent':
        return `${coupon.discountValue}% OFF`;
      case 'amount':
        return `$${coupon.discountValue} OFF`;
      case 'bogo':
        return 'BOGO';
      case 'other':
        return 'Special Offer';
      default:
        return '';
    }
  };

  // Format date display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {coupon.merchant}
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-gray-600">
                  {coupon.title}
                </CardDescription>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Badge
                  variant={
                    isExpired
                      ? 'destructive'
                      : isExpiringSoon
                        ? 'default'
                        : 'secondary'
                  }
                  className="ml-2"
                >
                  {formatDiscount()}
                </Badge>
              </motion.div>
            </div>
          </CardHeader>

        <CardContent className="flex-1">
          {/* Coupon Code */}
          <div className="mb-4">
            <motion.div
              className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <code className="text-sm font-mono font-semibold text-gray-900">
                {coupon.code}
              </code>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy code</span>
                </Button>
              </motion.div>
            </motion.div>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1 text-xs text-green-600"
              >
                Copied to clipboard!
              </motion.p>
            )}
          </div>

          {/* Expiration Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {isExpired
                  ? `Expired ${formatDate(coupon.validUntil)}`
                  : isExpiringSoon
                    ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`
                    : `Valid until ${formatDate(coupon.validUntil)}`}
              </span>
            </div>

            {/* Conditions */}
            {coupon.conditions && (
              <div className="text-xs text-gray-500 line-clamp-2">
                {coupon.conditions}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-gray-900">
              {coupon.merchant} - {coupon.title}
            </p>
            <p className="text-sm text-gray-600">Code: {coupon.code}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
