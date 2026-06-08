import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';

import { cn } from '../../lib/cn';

type ButtonVariant = 'danger' | 'ghost' | 'money' | 'primary' | 'secondary';
type ButtonSize = 'lg' | 'md' | 'sm';

type ButtonProps = PressableProps & {
  children?: ReactNode;
  leftIcon?: ReactNode;
  loading?: boolean;
  size?: ButtonSize;
  textClassName?: string;
  title?: string;
  variant?: ButtonVariant;
};

const variantClassNames: Record<ButtonVariant, string> = {
  danger: 'bg-danger',
  ghost: 'bg-transparent',
  money: 'bg-money-500',
  primary: 'bg-brand-500',
  secondary: 'bg-ink-900',
};

const textVariantClassNames: Record<ButtonVariant, string> = {
  danger: 'text-white',
  ghost: 'text-ink-700',
  money: 'text-ink-900',
  primary: 'text-white',
  secondary: 'text-white',
};

const sizeClassNames: Record<ButtonSize, string> = {
  lg: 'h-14 px-6',
  md: 'h-12 px-5',
  sm: 'h-10 px-4',
};

export function Button({
  accessibilityLabel,
  children,
  className,
  disabled,
  leftIcon,
  loading,
  size = 'md',
  textClassName,
  title,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      className={cn(
        'items-center justify-center rounded-xl',
        'active:scale-[0.98]',
        variantClassNames[variant],
        sizeClassNames[size],
        isDisabled && 'opacity-60',
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' || variant === 'money' ? '#0F172A' : '#FFFFFF'} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon}
          {children}
          {!children && title ? (
            <Text className={cn('text-center text-base font-bold', textVariantClassNames[variant], textClassName)}>{title}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
