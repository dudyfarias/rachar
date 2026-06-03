import { DefaultTheme, NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Loading } from '../components/ui';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { OnboardingScreen } from '../features/auth/screens/OnboardingScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { AddItemsScreen } from '../features/bills/screens/AddItemsScreen';
import { AddPeopleScreen } from '../features/bills/screens/AddPeopleScreen';
import { BillHistoryScreen } from '../features/bills/screens/BillHistoryScreen';
import { HomeScreen } from '../features/bills/screens/HomeScreen';
import { NewBillScreen } from '../features/bills/screens/NewBillScreen';
import { ResultScreen } from '../features/bills/screens/ResultScreen';
import { SharedBillScreen } from '../features/bills/screens/SharedBillScreen';
import { ReceiptCaptureScreen } from '../features/receipts/screens/ReceiptCaptureScreen';
import { ReceiptProcessingScreen } from '../features/receipts/screens/ReceiptProcessingScreen';
import { ReceiptReviewScreen } from '../features/receipts/screens/ReceiptReviewScreen';
import { SocialHubScreen } from '../features/social/screens/SocialHubScreen';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F6F8F7',
    card: '#F6F8F7',
    primary: '#00A676',
    text: '#0F172A',
  },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['rachae://'],
  config: {
    screens: {
      SharedBill: 'bill/:token',
    },
  },
};

export function RootNavigator() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const hasSeenOnboarding = useAppStore((state) => state.hasSeenOnboarding);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const session = useAuthStore((state) => state.session);

  if (!hasHydrated || isAuthLoading) {
    return <Loading label="Preparando seu racha..." />;
  }

  return (
    <NavigationContainer linking={linking} theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: '#F6F8F7' }, headerShown: false }}>
        {!hasSeenOnboarding ? (
          <>
            <Stack.Screen component={OnboardingScreen} name="Onboarding" />
            <Stack.Screen component={SharedBillScreen} name="SharedBill" />
          </>
        ) : !session ? (
          <>
            <Stack.Screen component={LoginScreen} name="Login" />
            <Stack.Screen component={RegisterScreen} name="Register" />
            <Stack.Screen component={SharedBillScreen} name="SharedBill" />
          </>
        ) : (
          <>
            <Stack.Screen component={HomeScreen} name="Home" />
            <Stack.Screen component={ReceiptCaptureScreen} name="ReceiptCapture" />
            <Stack.Screen component={ReceiptProcessingScreen} name="ReceiptProcessing" />
            <Stack.Screen component={ReceiptReviewScreen} name="ReceiptReview" />
            <Stack.Screen component={SocialHubScreen} name="SocialHub" />
            <Stack.Screen component={NewBillScreen} name="NewBill" />
            <Stack.Screen component={AddPeopleScreen} name="AddPeople" />
            <Stack.Screen component={AddItemsScreen} name="AddItems" />
            <Stack.Screen component={ResultScreen} name="Result" />
            <Stack.Screen component={BillHistoryScreen} name="BillHistory" />
            <Stack.Screen component={SharedBillScreen} name="SharedBill" />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
