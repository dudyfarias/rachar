import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '../../lib/cn';

type InputProps = TextInputProps & {
  containerClassName?: string;
  error?: string;
  helper?: string;
  label?: string;
};

export function Input({ className, containerClassName, error, helper, label, ...props }: InputProps) {
  return (
    <View className={cn('gap-2', containerClassName)}>
      {label ? <Text className="text-sm font-semibold text-ink-700">{label}</Text> : null}
      <TextInput
        className={cn(
          'h-12 rounded-xl border bg-white px-4 text-base text-ink-900',
          error ? 'border-danger' : 'border-ink-100',
          className,
        )}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error ? <Text className="text-xs font-medium text-danger">{error}</Text> : null}
      {!error && helper ? <Text className="text-xs text-ink-500">{helper}</Text> : null}
    </View>
  );
}
