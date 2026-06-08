import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Camera, Image as ImageIcon, ScanLine } from 'lucide-react-native';
import { CameraView, type CameraCapturedPicture, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

import { Button, Card, FlowStepHeader, Header, Loading } from '../../../components/ui';
import { useReceiptStore } from '../../../stores/receiptStore';
import type { ReceiptImage } from '../../../types/receipt';
import type { RootStackParamList } from '../../../types/navigation';

type ReceiptCaptureNavigation = NativeStackNavigationProp<RootStackParamList, 'ReceiptCapture'>;

function imageFromPhoto(photo: CameraCapturedPicture): ReceiptImage {
  return {
    height: photo.height,
    mimeType: 'image/jpeg',
    uri: photo.uri,
    width: photo.width,
  };
}

export function ReceiptCaptureScreen() {
  const navigation = useNavigation<ReceiptCaptureNavigation>();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const resetReceipt = useReceiptStore((state) => state.reset);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ReceiptImage | null>(null);

  async function ensureCameraPermission() {
    if (permission?.granted) {
      return true;
    }

    const response = await requestPermission();
    return response.granted;
  }

  async function handleTakePhoto() {
    const hasPermission = await ensureCameraPermission();

    if (!hasPermission) {
      Alert.alert('Camera indisponivel', 'Autorize o uso da camera para capturar a conta.');
      return;
    }

    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Camera carregando', 'Tente novamente em alguns segundos.');
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92, skipProcessing: false });
      setSelectedImage(imageFromPhoto(photo));
    } catch (error) {
      Alert.alert('Falha na captura', error instanceof Error ? error.message : 'Nao foi possivel tirar a foto.');
    } finally {
      setIsCapturing(false);
    }
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset) {
      Alert.alert('Imagem indisponivel', 'Nao foi possivel carregar a imagem selecionada.');
      return;
    }

    setSelectedImage({
      fileName: asset.fileName,
      height: asset.height,
      mimeType: asset.mimeType,
      uri: asset.uri,
      width: asset.width,
    });
  }

  function handleProcessImage() {
    if (!selectedImage) {
      Alert.alert('Conta nao selecionada', 'Capture ou selecione uma imagem para processar.');
      return;
    }

    resetReceipt();
    navigation.navigate('ReceiptProcessing', { image: selectedImage });
  }

  if (!permission) {
    return <Loading label="Abrindo camera..." />;
  }

  return (
    <View className="flex-1 bg-background" testID="screen-receipt-capture">
      <Header eyebrow="Passo 1 de 5" onBack={navigation.goBack} testID="receipt-capture-header" title="Capturar nota" />
      <FlowStepHeader currentStep={1} testID="receipt-capture-flow-steps" />

      <View className="flex-1 px-5 pb-5">
        <View className="overflow-hidden rounded-2xl bg-ink-900" style={{ aspectRatio: 0.72 }} testID="receipt-capture-preview">
          {selectedImage ? (
            <Image resizeMode="cover" source={{ uri: selectedImage.uri }} style={{ height: '100%', width: '100%' }} />
          ) : permission.granted ? (
            <CameraView
              ref={cameraRef}
              className="flex-1"
              facing="back"
              flash="off"
              mode="picture"
              onCameraReady={() => setIsCameraReady(true)}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Camera color="#FFFFFF" size={40} />
              <Text className="mt-4 text-center text-base font-bold text-white">Permissao da camera pendente.</Text>
            </View>
          )}

          <View className="absolute inset-6 rounded-2xl border-2 border-white/70" />
        </View>

        <Card className="mt-4" variant={selectedImage ? 'soft' : 'default'}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
              <ScanLine color="#00A676" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-ink-900">
                {selectedImage ? 'Imagem pronta para processar' : 'Aponte para a comanda'}
              </Text>
              <Text className="mt-1 text-sm text-ink-500">
                {selectedImage ? 'Crop e compressao entram no processamento.' : 'Use boa luz e enquadre a conta inteira.'}
              </Text>
            </View>
            {selectedImage ? (
              <Pressable
                accessibilityLabel="Remover imagem"
                accessibilityRole="button"
                testID="receipt-capture-clear-image-button"
                onPress={() => setSelectedImage(null)}
              >
                <Text className="text-sm font-bold text-danger">Trocar</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      </View>

      <View className="gap-3 border-t border-ink-100 bg-background px-5 pb-5 pt-4">
        {selectedImage ? (
          <>
            <Button size="lg" testID="receipt-capture-process-button" title="Processar conta" onPress={handleProcessImage} />
            <Button
              leftIcon={<ImageIcon color="#FFFFFF" size={18} />}
              testID="receipt-capture-gallery-button"
              title="Trocar imagem"
              variant="secondary"
              onPress={handlePickImage}
            />
          </>
        ) : (
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              leftIcon={<Camera color="#FFFFFF" size={18} />}
              loading={isCapturing}
              testID="receipt-capture-camera-button"
              title={permission.granted ? 'Capturar' : 'Permitir'}
              onPress={handleTakePhoto}
            />
            <Button
              className="flex-1"
              leftIcon={<ImageIcon color="#FFFFFF" size={18} />}
              testID="receipt-capture-gallery-button"
              title="Galeria"
              variant="secondary"
              onPress={handlePickImage}
            />
          </View>
        )}
      </View>
    </View>
  );
}
