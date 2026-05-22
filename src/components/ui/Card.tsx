import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '../../lib/cn';

type CardProps = ViewProps & {
  children: ReactNode;
  padded?: boolean;
};

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <View className={cn('rounded-2xl border border-ink-100 bg-white shadow-sm', padded && 'p-4', className)} {...props}>
      {children}
    </View>
  );
}
