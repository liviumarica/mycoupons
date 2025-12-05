import * as React from 'react';
import { cn } from '../lib/utils';
import { Label } from './label';

interface FormFieldContextValue {
  name: string;
  error?: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

const useFormField = () => {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error('useFormField must be used within FormField');
  }
  return context;
};

interface FormFieldProps {
  name: string;
  error?: string;
  children: React.ReactNode;
}

const FormField = ({ name, error, children }: FormFieldProps) => {
  return (
    <FormFieldContext.Provider value={{ name, error }}>
      <div className="space-y-2">{children}</div>
    </FormFieldContext.Provider>
  );
};

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { error, name } = useFormField();

  return (
    <div
      ref={ref}
      id={`${name}-form-item`}
      aria-describedby={error ? `${name}-form-item-message` : undefined}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, name } = useFormField();
  const body = error || children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={`${name}-form-item-message`}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
