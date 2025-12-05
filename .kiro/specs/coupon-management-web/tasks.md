# Implementation Plan

- [x] 1. Initialize monorepo structure and dependencies





  - Create pnpm workspace with apps/web, packages/ui, packages/core, packages/supabase
  - Install Next.js 14+ with App Router and TypeScript in apps/web
  - Install Tailwind CSS, shadcn/ui, and Framer Motion
  - Configure Turbo for monorepo builds
  - Set up ESLint, Prettier, and TypeScript configs
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. Set up Supabase project and database schema (use MCP server)





  - Create Supabase project and configure environment variables
  - Create coupons table with RLS policies
  - Create reminder_preferences table with RLS policies
  - Create push_subscriptions table with RLS policies
  - Create notification_logs table
  - Set up Supabase Storage bucket for coupon images with RLS
  - Configure Supabase Auth for magic link authentication
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 3. Create shared types and utilities in packages/core





  - Define TypeScript types for Coupon, ExtractedCoupon, ReminderPreferences, FilterState
  - Implement validation functions for coupon fields
  - Create date utility functions for expiration calculations
  - Implement filter and sort logic functions
  - _Requirements: 4.2, 6.2, 6.4_

- [ ] 3.1 Write property test for validation functions

  - **Property 9: Form validation enforces field constraints**
  - **Validates: Requirements 4.2**

- [ ]* 3.2 Write property test for filter logic
  - **Property 16: Filter returns matching coupons only**
  - **Validates: Requirements 6.2**

- [ ]* 3.3 Write property test for sort logic
  - **Property 17: Sort reorders coupons correctly**
  - **Validates: Requirements 6.4**

- [ ]* 3.4 Write property test for expiring soon filter
  - **Property 18: Expiring soon filter shows 14-day window**
  - **Validates: Requirements 6.5**

- [x] 4. Set up Supabase client in packages/supabase






  - Create Supabase client factory for server and client usage
  - Generate TypeScript types from database schema
  - Create database query helpers for coupons
  - Create database query helpers for reminder preferences
  - _Requirements: 5.1, 7.2_

- [x] 5. Build authentication pages and flow





  - Create login page with magic link form
  - Create signup page with email input
  - Implement magic link email sending via Supabase Auth
  - Create auth callback handler for magic link verification
  - Set up protected route middleware for dashboard pages
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 5.1 Write property test for magic link authentication
  - **Property 1: Magic link authentication flow**
  - **Validates: Requirements 1.2, 1.3**

- [ ]* 5.2 Write property test for session persistence
  - **Property 2: Session persistence across navigation**
  - **Validates: Requirements 1.4**

- [ ]* 5.3 Write property test for logout
  - **Property 3: Logout terminates session**
  - **Validates: Requirements 1.5**

- [x] 6. Create base UI components in packages/ui





  - Set up shadcn/ui configuration
  - Create Button, Input, Card, Badge components
  - Create Form components with validation
  - Create Dialog and Toast components
  - Set up Framer Motion animation variants
  - _Requirements: 5.2, 5.3_

- [x] 7. Implement OpenAI extraction API route




  - Create /api/coupons/extract POST endpoint
  - Implement text extraction using GPT-4
  - Implement image extraction using GPT-4 Vision
  - Parse OpenAI responses into ExtractedCoupon format
  - Add error handling and retry logic
  - _Requirements: 2.2, 2.3, 3.3, 3.4, 9.3_

- [ ]* 7.1 Write property test for text extraction output structure
  - **Property 4: Text extraction produces structured output**
  - **Validates: Requirements 2.3**

- [ ]* 7.2 Write property test for image extraction
  - **Property 8: Image extraction uses vision model**
  - **Validates: Requirements 3.3, 3.4**

- [ ]* 7.3 Write property test for server-side API calls
  - **Property 27: AI extraction is server-side only**
  - **Validates: Requirements 9.3**

- [x] 8. Build coupon creation flow - text input





  - Create add-coupon page with text input area
  - Implement text submission to extraction API
  - Display loading state during extraction
  - Show extracted data in review form
  - Highlight empty or low-confidence fields
  - _Requirements: 2.1, 2.4, 2.5_

- [ ]* 8.1 Write property test for extraction display
  - **Property 5: Extraction results display in review form**
  - **Validates: Requirements 2.4, 3.5**

- [ ]* 8.2 Write property test for empty field marking
  - **Property 6: Empty fields are marked for attention**
  - **Validates: Requirements 2.5**

- [x] 9. Build coupon creation flow - image upload





  - Create ImageUploader component with drag-and-drop
  - Implement image upload to Supabase Storage
  - Submit uploaded image to extraction API
  - Display image preview alongside review form
  - _Requirements: 3.1, 3.2, 3.5_

- [ ]* 9.1 Write property test for image storage
  - **Property 7: Image upload stores in Supabase**
  - **Validates: Requirements 3.2**

- [x] 10. Implement coupon review and save functionality





  - Create CouponForm component with all fields
  - Implement field validation with error display
  - Create /api/coupons POST endpoint for saving
  - Prevent save with validation errors
  - Ensure saved coupons include user_id
  - Redirect to dashboard on success with confirmation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 10.1 Write property test for invalid data prevention
  - **Property 10: Invalid data prevents saving**
  - **Validates: Requirements 4.3**

- [ ]* 10.2 Write property test for user ID inclusion
  - **Property 11: Saved coupons include user ID**
  - **Validates: Requirements 4.4**

- [ ]* 10.3 Write property test for save redirect
  - **Property 12: Successful save redirects to dashboard**
  - **Validates: Requirements 4.5**

- [x] 11. Build coupon dashboard page




  - Create dashboard page layout
  - Implement /api/coupons GET endpoint with user filtering
  - Create CouponCard component with all required fields
  - Display coupons in responsive grid layout
  - Add empty state for users with no coupons
  - Implement coupon deletion functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 11.1 Write property test for user-specific data retrieval
  - **Property 13: Dashboard displays user's coupons only**
  - **Validates: Requirements 5.1**

- [ ]* 11.2 Write property test for coupon card display
  - **Property 14: Coupon cards display required fields**
  - **Validates: Requirements 5.2**

- [ ]* 11.3 Write property test for responsive layout
  - **Property 15: Responsive layout adapts to viewport**
  - **Validates: Requirements 5.3**

- [x] 12. Implement filtering and sorting





  - Create FilterBar component with merchant, discount type, and expiration filters
  - Add sort controls for expiration, merchant, and discount value
  - Implement "expiring soon" filter (14-day window)
  - Connect filters to coupon display with animations
  - Persist filter preferences to localStorage
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Build reminder settings page





  - Create settings page with reminder preference toggles
  - Display options for 7, 3, and 1 day reminders
  - Create /api/reminders GET and PUT endpoints
  - Request browser notification permissions on first enable
  - Handle permission denied gracefully
  - Save preferences to database
  - Display confirmation on save
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 13.1 Write property test for preference persistence
  - **Property 19: Reminder preferences persist to database**
  - **Validates: Requirements 7.2**

- [ ]* 13.2 Write property test for save confirmation
  - **Property 20: Preference save shows confirmation**
  - **Validates: Requirements 7.5**

- [x] 14. Implement web push notification subscription





  - Create /api/notifications/subscribe POST endpoint
  - Generate VAPID keys for web push
  - Store push subscriptions in database
  - Implement subscription management (add/remove)
  - _Requirements: 8.2_

- [x] 15. Create Supabase Edge Function for notification cron job




  - Create send-expiry-notifications Edge Function
  - Implement daily cron trigger (9 AM UTC)
  - Query coupons expiring in 7, 3, and 1 days
  - Match coupons against user reminder preferences
  - Send web push notifications with merchant, title, and days until expiry
  - Log notification delivery in notification_logs table
  - Implement deduplication logic to prevent duplicate notifications
  - Handle failed notifications and disable invalid subscriptions
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ]* 15.1 Write property test for coupon matching logic
  - **Property 21: Cron job identifies matching coupons**
  - **Validates: Requirements 8.1**

- [ ]* 15.2 Write property test for notification sending
  - **Property 22: Matching coupons trigger notifications**
  - **Validates: Requirements 8.2**

- [ ]* 15.3 Write property test for notification content
  - **Property 23: Notifications contain required information**
  - **Validates: Requirements 8.3**

- [ ]* 15.4 Write property test for deduplication
  - **Property 25: No duplicate notifications per interval**
  - **Validates: Requirements 8.5**

- [x] 16. Implement notification click handling





  - Add service worker for notification click events
  - Implement navigation to dashboard with coupon highlighting
  - Update notification_logs with click status
  - _Requirements: 8.4_

- [ ]* 16.1 Write property test for notification click behavior
  - **Property 24: Notification click opens dashboard**
  - **Validates: Requirements 8.4**

- [ ] 17. Implement RLS policy testing and verification
  - Create test suite for RLS policies on coupons table
  - Test user isolation (users cannot access other users' coupons)
  - Test storage RLS policies for images
  - Verify authentication token validation
  - _Requirements: 9.1, 9.2, 9.4_

- [ ]* 17.1 Write property test for RLS enforcement
  - **Property 26: RLS enforces data ownership**
  - **Validates: Requirements 9.1, 9.2, 9.4**

- [ ] 18. Implement account deletion functionality
  - Create /api/user/delete endpoint
  - Cascade delete all user coupons
  - Delete all user images from storage
  - Delete reminder preferences and push subscriptions
  - Delete notification logs
  - _Requirements: 9.5_

- [ ]* 18.1 Write property test for complete data deletion
  - **Property 28: Account deletion removes all data**
  - **Validates: Requirements 9.5**

- [ ] 19. Add animations and polish
  - Implement Framer Motion transitions for page navigation
  - Add loading skeletons for async operations
  - Animate coupon card hover states
  - Add micro-interactions for buttons and form inputs
  - Implement smooth filter/sort transitions
  - _Requirements: 5.4_

- [ ] 20. Implement error handling and user feedback
  - Add error boundaries for React components
  - Implement toast notifications for errors and success
  - Add retry logic for failed API calls
  - Display user-friendly error messages
  - Handle offline state gracefully
  - _Requirements: 4.3, 7.4_

- [ ] 21. Performance optimization
  - Implement image optimization with Next.js Image
  - Add pagination for large coupon lists
  - Optimize database queries with indexes
  - Implement code splitting for heavy components
  - Add caching for API responses
  - _Requirements: 5.1, 5.3_

- [ ] 22. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 23. Set up E2E tests with Playwright
  - Create E2E test for complete signup and coupon creation flow
  - Test filtering and sorting functionality
  - Test reminder configuration flow
  - Verify responsive design across devices

- [ ] 24. Documentation and deployment preparation
  - Create README with setup instructions
  - Document environment variables
  - Create deployment guide for Vercel and Supabase
  - Set up CI/CD pipeline
  - Configure production environment variables
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1, 7.1_
