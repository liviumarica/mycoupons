# @coupon-management/ui

Shared UI component library built with shadcn/ui, Radix UI, and Framer Motion.

## Installation

This package is part of the monorepo and is automatically available to other packages.

## Setup

1. Import the global styles in your app's main CSS file:

```css
@import '@coupon-management/ui/styles/globals.css';
```

Or in your Next.js app layout:

```tsx
import '@coupon-management/ui/styles/globals.css';
```

2. Ensure your Tailwind config extends the UI package config:

```js
// tailwind.config.ts
import uiConfig from '@coupon-management/ui/tailwind.config';

export default {
  ...uiConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
```

## Components

### Button

```tsx
import { Button } from '@coupon-management/ui';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input

```tsx
import { Input } from '@coupon-management/ui';

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@coupon-management/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge

```tsx
import { Badge } from '@coupon-management/ui';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Form Components

```tsx
import { FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@coupon-management/ui';

<FormField name="email" error={errors.email}>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input type="email" />
  </FormControl>
  <FormDescription>We'll never share your email.</FormDescription>
  <FormMessage />
</FormField>
```

### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@coupon-management/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast

```tsx
import { useToast, Toaster } from '@coupon-management/ui';

// Add Toaster to your app layout
<Toaster />

// Use in components
function MyComponent() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Success!",
          description: "Your action was completed.",
        });
      }}
    >
      Show Toast
    </Button>
  );
}
```

## Animations

Framer Motion animation variants are available for common patterns:

```tsx
import { motion } from 'framer-motion';
import { fadeIn, slideUp, cardHover, pageTransition } from '@coupon-management/ui';

// Fade in animation
<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Content
</motion.div>

// Card with hover effect
<motion.div variants={cardHover} initial="rest" whileHover="hover" whileTap="tap">
  <Card>...</Card>
</motion.div>

// Page transition
<motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
  Page content
</motion.div>

// Stagger children
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={listItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## Available Animation Variants

- `fadeIn` - Simple fade in/out
- `slideUp` - Slide up from bottom
- `slideDown` - Slide down from top
- `scale` - Scale in/out
- `staggerContainer` - Container for staggered children
- `cardHover` - Card hover effect
- `buttonPress` - Button press effect
- `pageTransition` - Page transition
- `listItem` - List item animation
- `modalOverlay` - Modal overlay animation
- `modalContent` - Modal content animation

## Utilities

### cn (className merger)

```tsx
import { cn } from '@coupon-management/ui';

<div className={cn('base-class', condition && 'conditional-class', className)} />
```
