# Design Document

## Overview

The Coupon Management Platform (Phase 1) is a Next.js web application built with the App Router, leveraging Supabase for backend services and OpenAI for intelligent coupon data extraction. The architecture follows a monorepo structure to facilitate future expansion into mobile and browser extension platforms while maintaining code reusability.

The application provides a seamless user experience for capturing, managing, and tracking discount coupons through an elegant interface powered by shadcn/ui components and Framer Motion animations. Server-side AI processing ensures secure API key management, while Supabase handles authentication, data persistence, file storage, and scheduled notification jobs.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js App (App Router)                   │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Pages      │  │  Components  │               │    │
│  │  │  /login      │  │  shadcn/ui   │               │    │
│  │  │  /dashboard  │  │  Framer      │               │    │
│  │  │  /add-coupon │  │  Motion      │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/coupons/extract    (POST - text/image)        │  │
│  │  /api/coupons            (GET, POST, PUT, DELETE)   │  │
│  │  /api/notifications/subscribe (POST)                │  │
│  │  /api/reminders          (GET, PUT)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────────┐
│   OpenAI API         │           │      Supabase            │
│  ┌────────────────┐  │           │  ┌────────────────────┐ │
│  │ GPT-4 Vision   │  │           │  │  Auth (Magic Link) │ │
│  │ Text Models    │  │           │  │  Postgres DB       │ │
│  └────────────────┘  │           │  │  Storage (Images)  │ │
└──────────────────────┘           │  │  Edge Functions    │ │
                                    │  │  Cron Jobs         │ │
                                    │  └────────────────────┘ │
                                    └──────────────────────────┘
```

### Monorepo Structure

```
coupon-management/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # App Router pages
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   └── signup/
│       │   ├── (dashboard)/
│       │   │   ├── dashboard/
│       │   │   ├── add-coupon/
│       │   │   └── settings/
│       │   ├── api/            # API routes
│       │   └── layout.tsx
│       ├── components/         # Web-specific components
│       ├── lib/                # Web utilities
│       └── public/
├── packages/
│   ├── ui/                     # Shared UI components (shadcn/ui)
│   │   ├── components/
│   │   └── styles/
│   ├── core/                   # Shared business logic
│   │   ├── types/
│   │   ├── utils/
│   │   └── validation/
│   └── supabase/               # Supabase client & types
│       ├── client.ts
│       ├── types.ts
│       └── migrations/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Components and Interfaces

### Frontend Components

#### Page Components

1. **LoginPage** (`app/(auth)/login/page.tsx`)
   - Renders magic link authentication form
   - Handles email submission and success states
   - Redirects authenticated users to dashboard

2. **DashboardPage** (`app/(dashboard)/dashboard/page.tsx`)
   - Displays coupon grid/list with filters and sorting
   - Manages filter and sort state
   - Handles coupon deletion and updates

3. **AddCouponPage** (`app/(dashboard)/add-coupon/page.tsx`)
   - Provides text input and image upload interfaces
   - Displays extraction progress and results
   - Renders review/edit form for extracted data

4. **SettingsPage** (`app/(dashboard)/settings/page.tsx`)
   - Manages reminder preferences
   - Handles notification permission requests
   - Displays user account information

#### UI Components (shadcn/ui based)

1. **CouponCard**
   - Props: `coupon: Coupon, onDelete: () => void, onEdit: () => void`
   - Displays coupon information with merchant logo, discount badge, expiration countdown
   - Animated hover states with Framer Motion

2. **CouponForm**
   - Props: `initialData?: Partial<Coupon>, onSubmit: (data: Coupon) => void, onCancel: () => void`
   - Editable form for all coupon fields with validation
   - Date pickers for validity periods

3. **FilterBar**
   - Props: `filters: FilterState, onFilterChange: (filters: FilterState) => void`
   - Dropdown filters for merchant, discount type, expiration status
   - Sort selector with animation

4. **ImageUploader**
   - Props: `onUpload: (file: File) => void, maxSize: number`
   - Drag-and-drop zone with preview
   - Progress indicator during upload

5. **ExtractionReview**
   - Props: `extractedData: ExtractedCoupon, originalSource: string | File, onConfirm: (data: Coupon) => void`
   - Side-by-side view of original source and extracted fields
   - Confidence indicators for each field

### API Routes

#### `/api/coupons/extract` (POST)
- **Input**: `{ type: 'text' | 'image', content: string | FormData }`
- **Process**: 
  1. Validate authentication
  2. If image, upload to Supabase Storage
  3. Call OpenAI API with appropriate model (GPT-4 Vision for images, GPT-4 for text)
  4. Parse and structure response
- **Output**: `{ success: boolean, data: ExtractedCoupon, confidence: Record<string, number> }`

#### `/api/coupons` (GET, POST, PUT, DELETE)
- **GET**: Retrieve all user coupons with optional filters
- **POST**: Create new coupon after review
- **PUT**: Update existing coupon
- **DELETE**: Remove coupon and associated images

#### `/api/notifications/subscribe` (POST)
- **Input**: `{ subscription: PushSubscription }`
- **Process**: Store push subscription in database linked to user
- **Output**: `{ success: boolean }`

#### `/api/reminders` (GET, PUT)
- **GET**: Retrieve user reminder preferences
- **PUT**: Update reminder preferences (7, 3, 1 day options)

### Supabase Edge Function

#### `send-expiry-notifications`
- **Trigger**: Daily cron job (runs at 9 AM UTC)
- **Process**:
  1. Query coupons expiring in 7, 3, or 1 days
  2. Match against user reminder preferences
  3. Retrieve user push subscriptions
  4. Send web push notifications via Web Push API
  5. Log notification delivery status
- **Error Handling**: Retry failed notifications, disable invalid subscriptions

## Data Models

### Database Schema (Supabase Postgres)

#### `users` table (managed by Supabase Auth)
```sql
-- Extended with custom fields
id: uuid (PK)
email: text
created_at: timestamp
```

#### `coupons` table
```sql
id: uuid (PK)
user_id: uuid (FK -> users.id)
merchant: text
title: text
code: text
discount_type: enum('percent', 'amount', 'bogo', 'other')
discount_value: numeric
valid_from: date
valid_until: date
conditions: text
source: enum('text', 'image')
image_url: text (nullable)
created_at: timestamp
updated_at: timestamp
```

**RLS Policies**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

#### `reminder_preferences` table
```sql
id: uuid (PK)
user_id: uuid (FK -> users.id, unique)
remind_7_days: boolean (default: true)
remind_3_days: boolean (default: true)
remind_1_day: boolean (default: true)
created_at: timestamp
updated_at: timestamp
```

**RLS Policies**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`

#### `push_subscriptions` table
```sql
id: uuid (PK)
user_id: uuid (FK -> users.id)
endpoint: text
p256dh: text
auth: text
created_at: timestamp
```

**RLS Policies**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

#### `notification_logs` table
```sql
id: uuid (PK)
user_id: uuid (FK -> users.id)
coupon_id: uuid (FK -> coupons.id)
notification_type: enum('7_day', '3_day', '1_day')
sent_at: timestamp
status: enum('sent', 'failed', 'clicked')
```

### TypeScript Types

```typescript
// packages/core/types/coupon.ts
export type DiscountType = 'percent' | 'amount' | 'bogo' | 'other';
export type CouponSource = 'text' | 'image';

export interface Coupon {
  id: string;
  userId: string;
  merchant: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date;
  validUntil: Date;
  conditions: string;
  source: CouponSource;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedCoupon {
  merchant: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date | null;
  validUntil: Date | null;
  conditions: string;
  confidence: Record<string, number>;
}

export interface ReminderPreferences {
  id: string;
  userId: string;
  remind7Days: boolean;
  remind3Days: boolean;
  remind1Day: boolean;
}

export interface FilterState {
  merchant?: string;
  discountType?: DiscountType;
  expirationStatus?: 'all' | 'expiring_soon' | 'active' | 'expired';
  sortBy: 'expiration' | 'merchant' | 'discount_value';
  sortOrder: 'asc' | 'desc';
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Magic link authentication flow
*For any* valid email address, when a user requests authentication, the system should send a magic link, and when that link is used, the user should be authenticated and granted dashboard access.
**Validates: Requirements 1.2, 1.3**

### Property 2: Session persistence across navigation
*For any* authenticated user session and any valid page navigation within the application, the authentication state should remain active without requiring re-authentication.
**Validates: Requirements 1.4**

### Property 3: Logout terminates session
*For any* authenticated user, when logout is triggered, the session should be terminated and the user should be redirected to the login page.
**Validates: Requirements 1.5**

### Property 4: Text extraction produces structured output
*For any* text input submitted for extraction, the AI Extraction Service should return a response containing all required fields: merchant, title, code, discount_type, discount_value, valid_from, valid_until, conditions, and source.
**Validates: Requirements 2.3**

### Property 5: Extraction results display in review form
*For any* extraction result (text or image), the application should display all extracted fields in an editable form.
**Validates: Requirements 2.4, 3.5**

### Property 6: Empty fields are marked for attention
*For any* extraction result where one or more fields are empty or have low confidence, those fields should be visually marked to indicate they need user review.
**Validates: Requirements 2.5**

### Property 7: Image upload stores in Supabase
*For any* valid image file uploaded by a user, the file should be successfully stored in Supabase Storage and return a valid URL.
**Validates: Requirements 3.2**

### Property 8: Image extraction uses vision model
*For any* image submitted for extraction, the AI Extraction Service should invoke OpenAI's vision-capable model and return structured coupon data.
**Validates: Requirements 3.3, 3.4**

### Property 9: Form validation enforces field constraints
*For any* field in the coupon form and any user input, the validation should enforce the appropriate type constraints (e.g., dates are valid dates, discount values are numeric).
**Validates: Requirements 4.2**

### Property 10: Invalid data prevents saving
*For any* coupon form submission with validation errors, the system should display error messages and prevent the save operation from completing.
**Validates: Requirements 4.3**

### Property 11: Saved coupons include user ID
*For any* valid coupon data confirmed by a user, when saved to the database, the coupon record should include the authenticated user's ID.
**Validates: Requirements 4.4**

### Property 12: Successful save redirects to dashboard
*For any* successfully saved coupon, the application should redirect the user to the dashboard and display a success confirmation.
**Validates: Requirements 4.5**

### Property 13: Dashboard displays user's coupons only
*For any* authenticated user, the dashboard should retrieve and display only coupons where the user_id matches the authenticated user's ID.
**Validates: Requirements 5.1**

### Property 14: Coupon cards display required fields
*For any* coupon displayed in the dashboard, the card should render merchant, title, discount details, expiration date, and code.
**Validates: Requirements 5.2**

### Property 15: Responsive layout adapts to viewport
*For any* viewport size (mobile, tablet, desktop), the dashboard layout should adapt appropriately without horizontal scrolling or broken layouts.
**Validates: Requirements 5.3**

### Property 16: Filter returns matching coupons only
*For any* filter criteria applied (merchant, discount type, or expiration status) and any set of coupons, the displayed results should include only coupons that match all active filter criteria.
**Validates: Requirements 6.2**

### Property 17: Sort reorders coupons correctly
*For any* sort criteria (expiration date, merchant name, or discount value) and any set of coupons, the displayed coupons should be ordered according to the selected criteria and direction.
**Validates: Requirements 6.4**

### Property 18: Expiring soon filter shows 14-day window
*For any* set of coupons, when the "expiring soon" filter is applied, only coupons with valid_until dates within the next 14 days should be displayed.
**Validates: Requirements 6.5**

### Property 19: Reminder preferences persist to database
*For any* reminder preference configuration (7-day, 3-day, 1-day toggles), when saved, the preferences should be stored in the database linked to the user's ID.
**Validates: Requirements 7.2**

### Property 20: Preference save shows confirmation
*For any* successful reminder preference save operation, the application should display a confirmation message to the user.
**Validates: Requirements 7.5**

### Property 21: Cron job identifies matching coupons
*For any* execution of the daily cron job, the system should identify all coupons where the expiration date minus current date matches a user's enabled reminder intervals (7, 3, or 1 days).
**Validates: Requirements 8.1**

### Property 22: Matching coupons trigger notifications
*For any* coupon that matches reminder criteria, the system should send a web push notification to the coupon owner's registered push subscription endpoints.
**Validates: Requirements 8.2**

### Property 23: Notifications contain required information
*For any* web push notification sent, the notification payload should include the merchant name, coupon title, and number of days until expiration.
**Validates: Requirements 8.3**

### Property 24: Notification click opens dashboard
*For any* notification clicked by a user, the application should open to the dashboard with the relevant coupon highlighted or scrolled into view.
**Validates: Requirements 8.4**

### Property 25: No duplicate notifications per interval
*For any* coupon and reminder interval combination, if a notification has already been sent for that specific interval, no duplicate notification should be sent.
**Validates: Requirements 8.5**

### Property 26: RLS enforces data ownership
*For any* database query on the coupons table, Supabase RLS policies should ensure that users can only access, modify, or delete coupons where user_id matches their authenticated ID.
**Validates: Requirements 9.1, 9.2, 9.4**

### Property 27: AI extraction is server-side only
*For any* extraction request (text or image), the OpenAI API call should be made exclusively from Next.js API routes with API keys stored in environment variables, never exposed to the client.
**Validates: Requirements 9.3**

### Property 28: Account deletion removes all data
*For any* user account deletion, all associated coupons, images, reminder preferences, and push subscriptions should be removed from the database and storage.
**Validates: Requirements 9.5**

## Error Handling

### Client-Side Error Handling

1. **Network Errors**
   - Display user-friendly error messages for failed API calls
   - Implement retry logic with exponential backoff for transient failures
   - Show offline indicators when network is unavailable

2. **Validation Errors**
   - Display inline validation errors on form fields
   - Prevent form submission until all errors are resolved
   - Provide helpful error messages with correction guidance

3. **Authentication Errors**
   - Redirect to login page when session expires
   - Display clear messages for invalid magic links
   - Handle token refresh failures gracefully

4. **File Upload Errors**
   - Validate file size and type before upload
   - Display progress and error states clearly
   - Provide retry options for failed uploads

### Server-Side Error Handling

1. **OpenAI API Errors**
   - Implement retry logic with exponential backoff (max 3 attempts)
   - Log errors with request context for debugging
   - Return structured error responses to client
   - Handle rate limiting with appropriate delays
   - Fallback to partial extraction if possible

2. **Database Errors**
   - Wrap database operations in try-catch blocks
   - Log errors with query context
   - Return appropriate HTTP status codes (400, 404, 500)
   - Implement transaction rollback for multi-step operations

3. **Storage Errors**
   - Validate file uploads before processing
   - Clean up orphaned files on failed operations
   - Handle storage quota exceeded errors
   - Implement retry logic for transient storage failures

4. **Cron Job Errors**
   - Log all notification failures with user and coupon context
   - Implement dead letter queue for failed notifications
   - Disable invalid push subscriptions automatically
   - Send error alerts for critical failures

### Error Logging and Monitoring

- Use structured logging with correlation IDs
- Implement error tracking service integration (e.g., Sentry)
- Monitor error rates and set up alerts for anomalies
- Log user actions leading to errors for debugging

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the testing framework for unit tests, providing fast execution and excellent TypeScript support.

**Unit Test Coverage:**

1. **Utility Functions**
   - Date formatting and calculation functions
   - Validation functions for coupon fields
   - Filter and sort logic functions

2. **Component Logic**
   - Form validation behavior
   - State management in components
   - Event handler functions

3. **API Route Handlers**
   - Request validation
   - Error handling paths
   - Response formatting

4. **Edge Cases**
   - Empty state handling (no coupons)
   - Permission denied scenarios
   - Invalid file uploads
   - Expired coupons

**Example Unit Tests:**
```typescript
// Test specific validation logic
describe('validateCouponCode', () => {
  it('should accept alphanumeric codes', () => {
    expect(validateCouponCode('SAVE20')).toBe(true);
  });
  
  it('should reject empty codes', () => {
    expect(validateCouponCode('')).toBe(false);
  });
});
```

### Property-Based Testing

The application will use **fast-check** as the property-based testing library, which provides excellent TypeScript support and a rich set of generators.

**Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Tests will use seed-based randomization for reproducibility
- Failed test cases will be shrunk to minimal failing examples

**Property Test Requirements:**

1. **Tagging Convention**
   - Each property-based test MUST include a comment with the format:
     `// Feature: coupon-management-web, Property {number}: {property_text}`
   - This links the test to the correctness property in this design document

2. **One Test Per Property**
   - Each correctness property listed above MUST be implemented by exactly ONE property-based test
   - Tests should be comprehensive enough to validate the entire property

3. **Generator Strategy**
   - Create smart generators that produce valid domain objects (coupons, users, dates)
   - Use constrained generators to focus on relevant input spaces
   - Combine generators to create complex test scenarios

**Example Property-Based Tests:**
```typescript
// Feature: coupon-management-web, Property 16: Filter returns matching coupons only
describe('Coupon filtering', () => {
  it('should return only coupons matching filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(couponGenerator()),
        fc.record({
          merchant: fc.option(fc.string()),
          discountType: fc.option(fc.constantFrom('percent', 'amount', 'bogo')),
        }),
        (coupons, filters) => {
          const filtered = filterCoupons(coupons, filters);
          return filtered.every(coupon => matchesFilters(coupon, filters));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: coupon-management-web, Property 17: Sort reorders coupons correctly
describe('Coupon sorting', () => {
  it('should order coupons according to sort criteria', () => {
    fc.assert(
      fc.property(
        fc.array(couponGenerator(), { minLength: 2 }),
        fc.constantFrom('expiration', 'merchant', 'discount_value'),
        fc.constantFrom('asc', 'desc'),
        (coupons, sortBy, sortOrder) => {
          const sorted = sortCoupons(coupons, sortBy, sortOrder);
          return isCorrectlyOrdered(sorted, sortBy, sortOrder);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify the interaction between components, API routes, and Supabase:

1. **Authentication Flow**
   - Complete magic link flow from email to dashboard access
   - Session persistence across page loads

2. **Coupon Creation Flow**
   - Text extraction → review → save → display in dashboard
   - Image upload → extraction → review → save

3. **Notification System**
   - Cron job execution → coupon matching → notification sending
   - Notification click → dashboard navigation

4. **Data Security**
   - RLS policy enforcement
   - User isolation verification

### End-to-End Testing

E2E tests will use **Playwright** to test complete user workflows:

1. User signs up and logs in
2. User adds coupon via text
3. User adds coupon via image
4. User filters and sorts coupons
5. User configures reminders
6. User receives and clicks notification

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   - Use Next.js automatic code splitting
   - Lazy load heavy components (image uploader, chart libraries)
   - Implement route-based splitting

2. **Image Optimization**
   - Use Next.js Image component for automatic optimization
   - Implement lazy loading for coupon images
   - Generate thumbnails for dashboard view

3. **State Management**
   - Use React Server Components where possible
   - Implement optimistic updates for better UX
   - Cache filter and sort preferences locally

4. **Animation Performance**
   - Use CSS transforms for animations
   - Implement will-change hints for animated elements
   - Reduce motion for users with accessibility preferences

### Backend Optimization

1. **Database Queries**
   - Create indexes on frequently queried columns (user_id, valid_until)
   - Use database views for complex queries
   - Implement pagination for large coupon lists

2. **API Response Caching**
   - Cache OpenAI extraction results temporarily
   - Implement stale-while-revalidate for dashboard data
   - Use Supabase realtime for live updates

3. **File Storage**
   - Compress images before storage
   - Implement CDN for image delivery
   - Set appropriate cache headers

4. **Cron Job Optimization**
   - Batch notification sending
   - Use database indexes for date-based queries
   - Implement rate limiting for external API calls

## Security Considerations

### Authentication & Authorization

1. **Supabase Auth**
   - Use secure magic link tokens with expiration
   - Implement CSRF protection
   - Enforce HTTPS for all connections

2. **Row Level Security**
   - Enable RLS on all tables
   - Test policies thoroughly
   - Audit policy changes

3. **API Security**
   - Validate all input on server side
   - Implement rate limiting on API routes
   - Use environment variables for secrets

### Data Protection

1. **Sensitive Data**
   - Never log coupon codes or user emails
   - Encrypt sensitive data at rest
   - Implement secure deletion

2. **File Uploads**
   - Validate file types and sizes
   - Scan uploads for malware
   - Implement storage quotas per user

3. **API Keys**
   - Store OpenAI keys in environment variables
   - Rotate keys regularly
   - Monitor API usage for anomalies

## Deployment Strategy

### Environment Setup

1. **Development**
   - Local Supabase instance using Docker
   - Local Next.js development server
   - Mock OpenAI responses for testing

2. **Staging**
   - Separate Supabase project
   - Vercel preview deployments
   - Real OpenAI integration with lower rate limits

3. **Production**
   - Production Supabase project
   - Vercel production deployment
   - Full OpenAI integration with monitoring

### CI/CD Pipeline

1. **Automated Testing**
   - Run unit tests on every commit
   - Run property-based tests on pull requests
   - Run E2E tests before deployment

2. **Code Quality**
   - ESLint and Prettier checks
   - TypeScript type checking
   - Bundle size analysis

3. **Deployment**
   - Automatic deployment to Vercel on main branch merge
   - Database migrations via Supabase CLI
   - Environment variable validation

### Monitoring & Observability

1. **Application Monitoring**
   - Error tracking with Sentry
   - Performance monitoring with Vercel Analytics
   - User analytics with privacy-focused tools

2. **Infrastructure Monitoring**
   - Supabase dashboard metrics
   - API usage tracking
   - Storage usage monitoring

3. **Alerting**
   - Error rate thresholds
   - API quota warnings
   - Database performance alerts

## Future Extensibility

### Monorepo Preparation

The current architecture supports future expansion:

1. **Shared Packages**
   - `packages/core`: Business logic, types, validation
   - `packages/ui`: Reusable UI components
   - `packages/supabase`: Database client and types

2. **Future Apps**
   - `apps/mobile`: React Native mobile app
   - `apps/extension`: Browser extension
   - Both can import from shared packages

3. **API Abstraction**
   - Core business logic is platform-agnostic
   - API routes can be adapted for different platforms
   - Supabase client works across web and mobile

### Planned Features (Post-Phase 1)

1. **Mobile App**
   - Native camera integration for coupon capture
   - Push notifications via native APIs
   - Offline support with local database

2. **Browser Extension**
   - Automatic coupon detection on shopping sites
   - One-click coupon saving
   - Price comparison features

3. **Advanced Features**
   - Coupon sharing with friends
   - Merchant loyalty program integration
   - Price drop alerts
   - Shopping list integration
