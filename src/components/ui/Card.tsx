import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '../../lib/cn';

type CardProps = ViewProps & {
  children: ReactNode;
  padded?: boolean;
  variant?: 'brand' | 'dark' | 'default' | 'soft';
};

const variantClassNames = {
  brand: 'border-brand-500 bg-brand-500',
  dark: 'border-ink-900 bg-ink-900',
  default: 'border-ink-100 bg-white',
  soft: 'border-brand-100 bg-brand-50',
};

export function Card({ children, className, padded = true, variant = 'default', ...props }: CardProps) {
  return (
    <View className={cn('rounded-2xl border shadow-sm', variantClassNames[variant], padded && 'p-4', className)} {...props}>
      {children}
    </View>
  );
}
