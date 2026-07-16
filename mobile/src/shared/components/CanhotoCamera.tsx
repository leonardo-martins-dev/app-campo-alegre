import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Proporção canhoto/boleto: largura:altura ≈ 2.8:1 */
const FRAME_ASPECT = 2.8;
const FRAME_WIDTH_RATIO = 0.9;
const FRAME_BORDER_COLOR = '#00FF00';
const OVERLAY_OPACITY = 0.65;

export type CanhotoCameraProps = {
  onCapture: (imageUri: string) => void;
  onCancel?: () => void;
};

/**
 * Calcula a área de crop na imagem capturada correspondente ao frame central (90% largura, proporção 2.8:1).
 * A captura pode ter dimensões diferentes da tela; usamos a mesma proporção lógica (centro 90% largura, altura proporcional).
 */
export function calculateCropArea(
  imageWidth: number,
  imageHeight: number
): { originX: number; originY: number; width: number; height: number } {
  const cropWidth = imageWidth * FRAME_WIDTH_RATIO;
  const cropHeight = cropWidth / FRAME_ASPECT;
  const originX = Math.max(0, (imageWidth - cropWidth) / 2);
  const originY = Math.max(0, (imageHeight - cropHeight) / 2);
  return {
    originX,
    originY,
    width: Math.min(cropWidth, imageWidth),
    height: Math.min(cropHeight, imageHeight),
  };
}

export default function CanhotoCamera({ onCapture, onCancel }: CanhotoCameraProps) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const frameWidth = SCREEN_WIDTH * FRAME_WIDTH_RATIO;
  const frameHeight = frameWidth / FRAME_ASPECT;
  const frameLeft = (SCREEN_WIDTH - frameWidth) / 2;
  const frameTop = (SCREEN_HEIGHT - frameHeight) / 2;

  useEffect(() => {
    if (!cameraReady) return;
    scanLineAnim.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: frameHeight,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [cameraReady, frameHeight, scanLineAnim]);

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        setCapturing(false);
        return;
      }
      const cropRect = calculateCropArea(photo.width, photo.height);
      const context = ImageManipulator.ImageManipulator.manipulate(photo.uri);
      context.crop(cropRect);
      const rendered = await context.renderAsync();
      const result = await rendered.saveAsync({
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      onCapture(result.uri);
    } catch (e) {
      if (__DEV__) console.warn('CanhotoCamera capture/crop error', e);
      setCapturing(false);
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>É preciso permitir acesso à câmera para fotografar o canhoto.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Conceder permissão</Text>
        </TouchableOpacity>
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Overlay: áreas escuras + frame central transparente */}
      <View style={styles.overlay} pointerEvents="none">
        {/* Top */}
        <View style={[styles.overlayBar, { top: 0, left: 0, right: 0, height: frameTop }]} />
        {/* Bottom */}
        <View
          style={[
            styles.overlayBar,
            {
              top: frameTop + frameHeight,
              left: 0,
              right: 0,
              height: SCREEN_HEIGHT - frameTop - frameHeight,
            },
          ]}
        />
        {/* Left */}
        <View
          style={[
            styles.overlayBar,
            { top: frameTop, left: 0, width: frameLeft, height: frameHeight },
          ]}
        />
        {/* Right */}
        <View
          style={[
            styles.overlayBar,
            { top: frameTop, right: 0, width: frameLeft, height: frameHeight },
          ]}
        />

        {/* Texto acima do frame */}
        <View style={[styles.textWrap, { bottom: SCREEN_HEIGHT - frameTop + 8 }]}>
          <Text style={styles.instructionText}>Posicione o canhoto dentro da área</Text>
        </View>

        {/* Borda do frame (retângulo central transparente) */}
        <View
          style={[
            styles.frameBorder,
            {
              left: frameLeft,
              top: frameTop,
              width: frameWidth,
              height: frameHeight,
            },
          ]}
        >
          {/* Linha animada (scanner) */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLineAnim }],
              },
            ]}
          />
        </View>
      </View>

      {/* Controles (captura / cancelar) */}
      <View style={styles.controls}>
        {onCancel && (
          <TouchableOpacity style={styles.controlBtn} onPress={onCancel} disabled={capturing}>
            <Text style={styles.controlBtnText}>Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.captureBtn, capturing && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={!cameraReady || capturing}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.captureBtnInner} />
          )}
        </TouchableOpacity>
        {onCancel && <View style={styles.controlBtn} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  message: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  permBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#00FF00',
    borderRadius: 8,
  },
  permBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelBtnText: { color: '#fff', fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBar: {
    position: 'absolute',
    backgroundColor: `rgba(0,0,0,${OVERLAY_OPACITY})`,
  },
  textWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  frameBorder: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: FRAME_BORDER_COLOR,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 255, 0, 0.7)',
  },
  controls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 48 : 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  controlBtn: {
    minWidth: 80,
    paddingVertical: 12,
    alignItems: 'center',
  },
  controlBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnDisabled: {
    opacity: 0.6,
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});
