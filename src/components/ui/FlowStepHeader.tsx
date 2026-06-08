import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { cn } from '../../lib/cn';

type FlowStepHeaderProps = {
  className?: string;
  currentStep: number;
  steps?: string[];
  testID?: string;
};

const defaultSteps = ['Scan', 'Conferir', 'Pessoas', 'Itens', 'Resultado'];

export function FlowStepHeader({ className, currentStep, steps = defaultSteps, testID }: FlowStepHeaderProps) {
  return (
    <View className={cn('px-5 pb-4', className)} testID={testID}>
      <View className="flex-row items-start justify-between gap-1">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <View key={step} className="flex-1 items-center">
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full border',
                  isDone || isActive ? 'border-brand-500 bg-brand-500' : 'border-ink-100 bg-white',
                )}
              >
                {isDone ? (
                  <Check color="#FFFFFF" size={15} />
                ) : (
                  <Text className={cn('text-xs font-black', isActive ? 'text-white' : 'text-ink-500')}>{stepNumber}</Text>
                )}
              </View>
              <Text
                className={cn(
                  'mt-2 text-center text-xs font-bold',
                  isActive ? 'text-brand-700' : isDone ? 'text-ink-700' : 'text-ink-400',
                )}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
