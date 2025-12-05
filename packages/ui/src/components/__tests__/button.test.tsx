import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders with default variant', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { rerender, container } = render(<Button variant="default">Default</Button>);
    expect(container.querySelector('button')).toBeTruthy();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(container.querySelector('button')).toBeTruthy();

    rerender(<Button variant="outline">Outline</Button>);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Button size="default">Default</Button>);
    expect(container.querySelector('button')).toBeTruthy();

    rerender(<Button size="sm">Small</Button>);
    expect(container.querySelector('button')).toBeTruthy();

    rerender(<Button size="lg">Large</Button>);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('can be disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});
