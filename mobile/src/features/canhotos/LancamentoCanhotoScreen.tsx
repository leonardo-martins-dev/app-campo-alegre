import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import { fetchNumerosCanhotoDisponiveis, registrarCanhotos } from '../../core/api/canhotos';
import { ImagePlus, ChevronDown, Plus, Trash2 } from 'lucide-react-native';

const POPOVER_GAP = 4;
const POPOVER_MAX_HEIGHT = 220;
const MAX_FOTOS = 3;

type Draft = {
  key: string;
  numero: string;
  photoUris: string[];
};

function newDraft(): Draft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    numero: '',
    photoUris: [],
  };
}

export default function LancamentoCanhotoScreen() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([newDraft()]);
  const [numeros, setNumeros] = useState<string[]>([]);
  const [dropdownForKey, setDropdownForKey] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [cameraForKey, setCameraForKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const triggerRefs = useRef<Record<string, View | null>>({});

  const reloadNumeros = useCallback(() => {
    fetchNumerosCanhotoDisponiveis(user?.lojaId)
      .then(setNumeros)
      .catch(() => setNumeros([]));
  }, [user?.lojaId]);

  useEffect(() => {
    reloadNumeros();
  }, [reloadNumeros]);

  const usedNumeros = useMemo(
    () => new Set(drafts.map((d) => d.numero).filter(Boolean)),
    [drafts]
  );

  const filteredNumbers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const current = drafts.find((d) => d.key === dropdownForKey)?.numero;
    return numeros.filter((n) => {
      if (usedNumeros.has(n) && n !== current) return false;
      if (!q) return true;
      return n.includes(q);
    });
  }, [filter, numeros, usedNumeros, drafts, dropdownForKey]);

  const updateDraft = (key: string, patch: Partial<Draft>) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  };

  const addDraft = () => setDrafts((prev) => [...prev, newDraft()]);

  const removeDraft = (key: string) => {
    setDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.key !== key)));
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Para anexar fotos do canhoto é preciso permitir acesso à câmera e à galeria.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleUploadPhoto = (key: string) => {
    const draft = drafts.find((d) => d.key === key);
    if (!draft) return;
    if (draft.photoUris.length >= MAX_FOTOS) {
      Alert.alert('Limite', `Máximo de ${MAX_FOTOS} fotos por canhoto.`);
      return;
    }

    Alert.alert('Foto do canhoto', 'De onde deseja obter a foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Câmera',
        onPress: async () => {
          const ok = await requestPermissions();
          if (!ok) return;
          setCameraForKey(key);
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const ok = await requestPermissions();
          if (!ok) return;
          const remaining = MAX_FOTOS - draft.photoUris.length;
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsMultipleSelection: remaining > 1,
            selectionLimit: remaining,
          });
          if (!result.canceled && result.assets?.length) {
            const uris = result.assets.map((a) => a.uri).slice(0, remaining);
            updateDraft(key, { photoUris: [...draft.photoUris, ...uris] });
          }
        },
      },
    ]);
  };

  const removePhoto = (key: string, index: number) => {
    const draft = drafts.find((d) => d.key === key);
    if (!draft) return;
    updateDraft(key, {
      photoUris: draft.photoUris.filter((_, i) => i !== index),
    });
  };

  const openDropdown = (key: string) => {
    setFilter('');
    setDropdownForKey(key);
  };

  useEffect(() => {
    if (dropdownForKey && triggerRefs.current[dropdownForKey]) {
      triggerRefs.current[dropdownForKey]?.measureInWindow((x, y, w, h) => {
        setTriggerLayout({ x, y, width: w, height: h });
      });
    } else {
      setTriggerLayout(null);
    }
  }, [dropdownForKey]);

  const selectNumero = (value: string) => {
    if (!dropdownForKey) return;
    updateDraft(dropdownForKey, { numero: value });
    setFilter('');
    setDropdownForKey(null);
  };

  const handleRegistrar = async () => {
    const invalid = drafts.find((d) => !d.numero || d.photoUris.length === 0);
    if (invalid) {
      Alert.alert(
        'Campos obrigatórios',
        'Cada canhoto precisa de número e pelo menos 1 foto (máx. 3).'
      );
      return;
    }
    if (!user?.id || !user.lojaId) {
      Alert.alert('Perfil incompleto', 'Seu usuário precisa estar vinculado a uma loja.');
      return;
    }

    setSubmitting(true);
    try {
      await registrarCanhotos(
        drafts.map((d) => ({ numero: d.numero, photoUris: d.photoUris })),
        { lojaId: user.lojaId, usuarioId: user.id }
      );
      const n = drafts.length;
      Alert.alert(
        'Sucesso',
        n === 1 ? 'Canhoto registrado com sucesso.' : `${n} canhotos registrados com sucesso.`
      );
      setDrafts([newDraft()]);
      reloadNumeros();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível registrar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoid}
      >
        <SectionTitle>Lançamento de canhotos</SectionTitle>
        <Text style={styles.hintTop}>
          Adicione um ou mais canhotos. Cada um aceita até {MAX_FOTOS} fotos.
        </Text>

        {drafts.map((draft, index) => (
          <View key={draft.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Canhoto {index + 1}</Text>
              {drafts.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeDraft(draft.key)}
                  hitSlop={8}
                  accessibilityLabel="Remover canhoto"
                >
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Número do canhoto</Text>
            <View
              ref={(r) => {
                triggerRefs.current[draft.key] = r;
              }}
              collapsable={false}
            >
              <Pressable style={styles.selectTrigger} onPress={() => openDropdown(draft.key)}>
                <Text
                  style={
                    draft.numero ? styles.selectTriggerText : styles.selectTriggerPlaceholder
                  }
                >
                  {draft.numero || 'Selecionar'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.label}>
              Fotos ({draft.photoUris.length}/{MAX_FOTOS})
            </Text>
            {draft.photoUris.length > 0 && (
              <View style={styles.photoRow}>
                {draft.photoUris.map((uri, idx) => (
                  <View key={`${uri}-${idx}`} style={styles.thumbWrap}>
                    <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.thumbRemove}
                      onPress={() => removePhoto(draft.key, idx)}
                    >
                      <Text style={styles.thumbRemoveText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {draft.photoUris.length < MAX_FOTOS && (
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => handleUploadPhoto(draft.key)}
                activeOpacity={0.85}
              >
                <ImagePlus size={24} color={colors.primary} />
                <Text style={styles.uploadBtnText}>
                  {draft.photoUris.length === 0 ? 'Adicionar foto' : 'Adicionar outra foto'}
                </Text>
                <Text style={styles.uploadHint}>Galeria ou câmera · máx. {MAX_FOTOS}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addDraft} activeOpacity={0.85}>
          <Plus size={20} color={colors.navy} />
          <Text style={styles.addBtnText}>Adicionar canhoto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegistrar}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {submitting
              ? 'Registrando...'
              : drafts.length === 1
                ? 'Registrar canhoto'
                : `Registrar ${drafts.length} canhotos`}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={!!dropdownForKey}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownForKey(null)}
        >
          <Pressable style={styles.popoverOverlay} onPress={() => setDropdownForKey(null)}>
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
                  showsVerticalScrollIndicator
                >
                  {filteredNumbers.length === 0 ? (
                    <Text style={styles.popoverEmpty}>Nenhum</Text>
                  ) : (
                    filteredNumbers.map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={styles.popoverOption}
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

        <Modal visible={!!cameraForKey} animationType="slide" statusBarTranslucent>
          <CanhotoCamera
            onCapture={(uri) => {
              if (cameraForKey) {
                const draft = drafts.find((d) => d.key === cameraForKey);
                if (draft && draft.photoUris.length < MAX_FOTOS) {
                  updateDraft(cameraForKey, {
                    photoUris: [...draft.photoUris, uri],
                  });
                }
              }
              setCameraForKey(null);
            }}
            onCancel={() => setCameraForKey(null)}
          />
        </Modal>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  avoid: { flex: 1 },
  hintTop: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.navy },
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
  selectTriggerText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  selectTriggerPlaceholder: { fontSize: 15, color: colors.textSecondary },
  popoverOverlay: { flex: 1, backgroundColor: 'transparent' },
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
  popoverList: { maxHeight: POPOVER_MAX_HEIGHT },
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
  popoverOptionText: { fontSize: 14, color: colors.text },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  thumbWrap: { position: 'relative' },
  thumb: { width: 72, height: 72, borderRadius: borderRadius.sm },
  thumbRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRemoveText: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 16 },
  uploadBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  uploadBtnText: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  uploadHint: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  addBtnText: { color: colors.navy, fontWeight: '700', fontSize: 15 },
  button: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: -0.2 },
  buttonDisabled: { opacity: 0.7 },
});
