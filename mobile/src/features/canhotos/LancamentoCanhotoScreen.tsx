import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  type LayoutRectangle,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import CanhotoCamera from '../../shared/components/CanhotoCamera';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { useAuth } from '../../core/auth/AuthContext';
import { fetchNumerosCanhotoDisponiveis, registrarCanhoto } from '../../core/api/canhotos';
import { ImagePlus, ChevronDown } from 'lucide-react-native';

const POPOVER_GAP = 4;
const POPOVER_MAX_HEIGHT = 220;

export default function LancamentoCanhotoScreen() {
  const { user } = useAuth();
  const [numero, setNumero] = useState('');
  const [numeros, setNumeros] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filter, setFilter] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCanhotoCamera, setShowCanhotoCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    fetchNumerosCanhotoDisponiveis(user?.lojaId)
      .then(setNumeros)
      .catch(() => setNumeros([]));
  }, [user?.lojaId]);

  const filteredNumbers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return numeros;
    return numeros.filter((n) => n.includes(q));
  }, [filter, numeros]);

  const handleRegistrar = async () => {
    if (!numero || !photoUri) {
      Alert.alert('Campos obrigatórios', 'Selecione o número do canhoto e anexe a foto.');
      return;
    }
    if (!user?.id || !user.lojaId) {
      Alert.alert('Perfil incompleto', 'Seu usuário precisa estar vinculado a uma loja.');
      return;
    }
    setSubmitting(true);
    try {
      await registrarCanhoto({
        numero,
        lojaId: user.lojaId,
        usuarioId: user.id,
        photoUri,
      });
      Alert.alert('Sucesso', 'Canhoto registrado com sucesso.');
      setNumero('');
      setPhotoUri(null);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível registrar o canhoto.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, w, h) => {
        setTriggerLayout({ x, y, width: w, height: h });
      });
    } else {
      setTriggerLayout(null);
    }
  }, [dropdownVisible]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Para anexar a foto do canhoto é preciso permitir acesso à câmera e à galeria.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleUploadPhoto = () => {
    Alert.alert('Foto do canhoto', 'De onde deseja obter a foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Câmera',
        onPress: async () => {
          const ok = await requestPermissions();
          if (!ok) return;
          setShowCanhotoCamera(true);
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const ok = await requestPermissions();
          if (!ok) return;
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
        },
      },
    ]);
  };

  const selectNumero = (value: string) => {
    setNumero(value);
    setFilter('');
    setDropdownVisible(false);
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoid}
      >
        <SectionTitle>Novo canhoto</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.label}>Número do canhoto</Text>
          <View ref={triggerRef} collapsable={false}>
            <Pressable
              style={styles.selectTrigger}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={numero ? styles.selectTriggerText : styles.selectTriggerPlaceholder}>
                {numero || 'Selecionar'}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <Pressable style={styles.popoverOverlay} onPress={() => setDropdownVisible(false)}>
              {triggerLayout && (
                <Pressable
                  style={[
                    styles.popover,
                    {
                      top: triggerLayout.y + triggerLayout.height + POPOVER_GAP,
                      left: triggerLayout.x,
                      width: triggerLayout.width,
                    },
                  ]}
                  onPress={(e) => e.stopPropagation()}
                >
                  <TextInput
                    style={styles.popoverFilter}
                    placeholder="Filtrar..."
                    placeholderTextColor={colors.textSecondary}
                    value={filter}
                    onChangeText={setFilter}
                    autoFocus
                    autoCapitalize="none"
                    keyboardType="number-pad"
                  />
                  <ScrollView
                    style={styles.popoverList}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                  >
                    {filteredNumbers.length === 0 ? (
                      <Text style={styles.popoverEmpty}>Nenhum</Text>
                    ) : (
                      filteredNumbers.map((n) => (
                        <TouchableOpacity
                          key={n}
                          style={[styles.popoverOption, numero === n && styles.popoverOptionSelected]}
                          onPress={() => selectNumero(n)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.popoverOptionText}>{n}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </Pressable>
              )}
            </Pressable>
          </Modal>

          <Text style={styles.label}>Foto do canhoto</Text>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handleUploadPhoto}
            activeOpacity={0.85}
          >
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
                <Text style={styles.photoChange}>Toque para trocar a foto</Text>
              </View>
            ) : (
              <>
                <ImagePlus size={28} color={colors.primary} />
                <Text style={styles.uploadBtnText}>Fazer upload da foto do canhoto</Text>
                <Text style={styles.uploadHint}>Galeria ou câmera</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleRegistrar}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{submitting ? 'Registrando...' : 'Registrar canhoto'}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showCanhotoCamera} animationType="slide" statusBarTranslucent>
          <CanhotoCamera
            onCapture={(uri) => {
              setPhotoUri(uri);
              setShowCanhotoCamera(false);
            }}
            onCancel={() => setShowCanhotoCamera(false)}
          />
        </Modal>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  avoid: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  selectTriggerText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  selectTriggerPlaceholder: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  popoverOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  popover: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  popoverFilter: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    fontSize: 14,
    color: colors.text,
  },
  popoverList: {
    maxHeight: POPOVER_MAX_HEIGHT,
  },
  popoverEmpty: {
    ...typography.small,
    color: colors.textSecondary,
    padding: spacing.sm,
    textAlign: 'center',
  },
  popoverOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  popoverOptionSelected: {
    backgroundColor: colors.primary + '14',
  },
  popoverOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  uploadBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  uploadBtnText: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  uploadHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  photoPreview: {
    width: '100%',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
  },
  photoChange: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buttonDisabled: { opacity: 0.7 },
});
