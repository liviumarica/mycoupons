# Requirements Document

## Introduction

The Coupon Management Platform (Phase 1) is a web application that enables users to digitally manage their discount and loyalty coupons. The system extracts coupon information from text or images using AI, stores coupons securely, and provides proactive expiration reminders through web push notifications. This phase focuses exclusively on the web application, with architecture designed to support future mobile and browser extension integrations.

## Glossary

- **CouponApp**: The web application system for managing discount and loyalty coupons
- **User**: An authenticated individual who manages coupons through the CouponApp
- **Coupon**: A digital representation of a discount or loyalty offer containing merchant, code, discount details, and validity period
- **AI Extraction Service**: The OpenAI-powered server-side service that processes text and images to extract structured coupon data
- **Coupon Dashboard**: The main interface displaying all saved coupons with filtering and sorting capabilities
- **Reminder Configuration**: User-defined settings specifying when to receive expiration notifications (e.g., 7, 3, 1 days before)
- **Web Push Notification**: Browser-based notification sent to users about upcoming coupon expirations
- **Supabase**: The backend infrastructure providing authentication, database, storage, and scheduled jobs
- **RLS**: Row Level Security policies in Supabase ensuring users can only access their own data

## Requirements

### Requirement 1

**User Story:** As a new user, I want to sign up and log in securely, so that I can access my personal coupon collection from any device.

#### Acceptance Criteria

1. WHEN a user visits the CouponApp THEN the CouponApp SHALL display a sign-up and login interface
2. WHEN a user provides their email address for authentication THEN the CouponApp SHALL send a magic link to that email address
3. WHEN a user clicks the magic link THEN the CouponApp SHALL authenticate the user and grant access to their dashboard
4. WHILE a user session is active THEN the CouponApp SHALL maintain authentication state across page navigations
5. WHEN a user logs out THEN the CouponApp SHALL terminate the session and redirect to the login page

### Requirement 2

**User Story:** As a user, I want to add coupons by pasting text, so that I can quickly save promotional codes I receive via email or messaging.

#### Acceptance Criteria

1. WHEN a user accesses the coupon creation interface THEN the CouponApp SHALL display a text input area for pasting coupon information
2. WHEN a user pastes text and submits THEN the AI Extraction Service SHALL process the text and extract structured coupon data
3. WHEN the AI Extraction Service processes text THEN the AI Extraction Service SHALL identify merchant, title, code, discount_type, discount_value, valid_from, valid_until, conditions, and source fields
4. WHEN extraction completes THEN the CouponApp SHALL display the extracted data in an editable review form
5. WHEN the extracted data contains empty or uncertain fields THEN the CouponApp SHALL mark those fields for user attention

### Requirement 3

**User Story:** As a user, I want to add coupons by uploading images or screenshots, so that I can digitize physical coupons or promotional graphics.

#### Acceptance Criteria

1. WHEN a user accesses the coupon creation interface THEN the CouponApp SHALL display an image upload control accepting common image formats
2. WHEN a user uploads an image file THEN the CouponApp SHALL store the image securely in Supabase Storage
3. WHEN an image is uploaded THEN the AI Extraction Service SHALL process the image using vision capabilities and extract structured coupon data
4. WHEN the AI Extraction Service processes an image THEN the AI Extraction Service SHALL identify merchant, title, code, discount_type, discount_value, valid_from, valid_until, conditions, and source fields
5. WHEN extraction from an image completes THEN the CouponApp SHALL display the extracted data in an editable review form with the original image preview

### Requirement 4

**User Story:** As a user, I want to review and edit extracted coupon data before saving, so that I can correct any AI extraction errors and ensure accuracy.

#### Acceptance Criteria

1. WHEN extracted coupon data is displayed THEN the CouponApp SHALL present all fields in an editable form
2. WHEN a user modifies any field THEN the CouponApp SHALL validate the input according to field type constraints
3. WHEN a user attempts to save with invalid data THEN the CouponApp SHALL display validation errors and prevent saving
4. WHEN a user confirms the reviewed data THEN the CouponApp SHALL save the coupon to the Supabase database with the user's ID
5. WHEN a coupon is successfully saved THEN the CouponApp SHALL redirect the user to the Coupon Dashboard and display a success confirmation

### Requirement 5

**User Story:** As a user, I want to view all my coupons in a beautiful dashboard, so that I can easily browse and access my saved offers.

#### Acceptance Criteria

1. WHEN a user navigates to the Coupon Dashboard THEN the CouponApp SHALL retrieve and display all coupons belonging to that user
2. WHEN coupons are displayed THEN the CouponApp SHALL show merchant, title, discount details, expiration date, and code for each coupon
3. WHEN the dashboard renders THEN the CouponApp SHALL apply responsive layout adapting to mobile, tablet, and desktop screen sizes
4. WHEN coupons load or update THEN the CouponApp SHALL animate transitions using Framer Motion for smooth visual feedback
5. WHEN a user has no coupons THEN the CouponApp SHALL display an empty state with guidance to add the first coupon

### Requirement 6

**User Story:** As a user, I want to filter and sort my coupons, so that I can quickly find relevant offers like those expiring soon.

#### Acceptance Criteria

1. WHEN a user accesses filter controls THEN the CouponApp SHALL provide options to filter by merchant, discount type, and expiration status
2. WHEN a user applies a filter THEN the CouponApp SHALL display only coupons matching the selected criteria
3. WHEN a user accesses sort controls THEN the CouponApp SHALL provide options to sort by expiration date, merchant name, and discount value
4. WHEN a user selects a sort option THEN the CouponApp SHALL reorder the displayed coupons according to the selected criteria
5. WHEN a user selects "expiring soon" filter THEN the CouponApp SHALL display coupons expiring within the next 14 days

### Requirement 7

**User Story:** As a user, I want to configure reminder preferences, so that I can receive timely notifications before my coupons expire.

#### Acceptance Criteria

1. WHEN a user accesses reminder settings THEN the CouponApp SHALL display options to enable notifications at 7, 3, and 1 days before expiration
2. WHEN a user enables or disables reminder options THEN the CouponApp SHALL save the preferences to the Supabase database
3. WHEN a user enables web push notifications for the first time THEN the CouponApp SHALL request browser notification permissions
4. WHEN browser notification permission is denied THEN the CouponApp SHALL inform the user that reminders cannot be sent
5. WHEN reminder preferences are saved THEN the CouponApp SHALL display a confirmation message

### Requirement 8

**User Story:** As a user, I want to receive web push notifications for upcoming expirations, so that I don't miss opportunities to use my coupons.

#### Acceptance Criteria

1. WHEN the daily Supabase cron job executes THEN the CouponApp SHALL identify all coupons matching user reminder configurations
2. WHEN coupons match reminder criteria THEN the CouponApp SHALL send web push notifications to the respective users
3. WHEN a web push notification is sent THEN the notification SHALL include the merchant name, coupon title, and days until expiration
4. WHEN a user clicks a notification THEN the CouponApp SHALL open the browser to the Coupon Dashboard with the relevant coupon highlighted
5. WHEN a coupon has already triggered a reminder at a specific interval THEN the CouponApp SHALL not send duplicate notifications for that interval

### Requirement 9

**User Story:** As a user, I want my coupon data to be secure and private, so that only I can access my personal offers.

#### Acceptance Criteria

1. WHEN the CouponApp stores coupon data THEN Supabase SHALL enforce Row Level Security policies restricting access to the coupon owner
2. WHEN a user attempts to access coupon data THEN Supabase SHALL verify the user's authentication token before returning data
3. WHEN the AI Extraction Service is invoked THEN the CouponApp SHALL call OpenAI APIs only from the server side with secure API keys
4. WHEN images are uploaded THEN Supabase Storage SHALL apply RLS policies ensuring only the owner can access their images
5. WHEN a user deletes their account THEN the CouponApp SHALL remove all associated coupon data and images

### Requirement 10

**User Story:** As a developer, I want the codebase structured for future expansion, so that mobile apps and browser extensions can be added without major refactoring.

#### Acceptance Criteria

1. WHEN the project is initialized THEN the CouponApp SHALL use a monorepo structure with apps and packages directories
2. WHEN shared UI components are created THEN the CouponApp SHALL place them in a packages/ui directory for reuse
3. WHEN core business logic is implemented THEN the CouponApp SHALL place it in a packages/core directory for cross-platform sharing
4. WHEN the web app is built THEN the CouponApp SHALL reside in the apps/web directory
5. WHERE future mobile or extension apps are added THEN the CouponApp SHALL allow them to import from shared packages without code duplication
