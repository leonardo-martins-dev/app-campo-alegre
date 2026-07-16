import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenLayout from '../../shared/components/ScreenLayout';
import SectionTitle from '../../shared/components/SectionTitle';
import LojaPicker from '../../shared/components/LojaPicker';
import { CHECKLIST_PROMOTOR_11 } from '../../shared/mock/data';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { useAuth } from '../../core/auth/AuthContext';
import { enviarProcedimento, fetchChecklistTemplate } from '../../core/api/procedimentos';
import { ImagePlus } from 'lucide-react-native';

type ChecklistItem = { id: string; label: string; requiresPhoto: boolean };

export default function ProcedimentosPromotoresScreen() {
  const { user } = useAuth();
  const [loja, setLoja] = useState<{ id: string; nome: string } | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_PROMOTOR_11);
  const [submitting, setSubmitting] = useState(false);
  const [concluidos, setConcluidos] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchChecklistTemplate('promotor')
      .then((items) => {
        setChecklist(items);
        const initialPhotos: Record<string, string[]> = {};
        items.filter((i) => i.requiresPhoto).forEach((i) => {
          initialPhotos[i.id] = [];
        });
        setPhotos(initialPhotos);
      })
      .catch(() => setChecklist(CHECKLIST_PROMOTOR_11));
  }, []);

  const toggle = (id: string) => {
    setConcluidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'É preciso permitir acesso à câmera e à galeria para anexar fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  const pickImage = useCallback(
    async (itemId: string, source: 'camera' | 'library') => {
      const opts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: source === 'camera',
        aspect: source === 'camera' ? [4, 3] : undefined,
        allowsMultipleSelection: source === 'library',
        selectionLimit: source === 'library' ? 10 : 1,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(opts)
          : await ImagePicker.launchImageLibraryAsync(opts);
      if (!result.canceled && result.assets?.length) {
        const uris = result.assets.map((a) => a.uri);
        setPhotos((prev) => ({ ...prev, [itemId]: [...prev[itemId], ...uris] }));
      }
    },
    []
  );

  const handleAddPhoto = useCallback(
    (itemId: string) => {
      Alert.alert('Anexar foto', 'Galeria ou câmera?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Câmera',
          onPress: async () => {
            const ok = await requestPermissions();
            if (ok) pickImage(itemId, 'camera');
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const ok = await requestPermissions();
            if (ok) pickImage(itemId, 'library');
          },
        },
      ]);
    },
    [requestPermissions, pickImage]
  );

  const removePhoto = (itemId: string, index: number) => {
    setPhotos((prev) => ({
      ...prev,
      [itemId]: prev[itemId].filter((_, i) => i !== index),
    }));
  };

  const totalItens = checklist.length;
  const concluidosCount = checklist.filter((i) => concluidos[i.id]).length;
  const allChecked = totalItens > 0 && concluidosCount === totalItens;
  const photoItemsOk = checklist
    .filter((i) => i.requiresPhoto)
    .every((i) => (photos[i.id]?.length ?? 0) >= 1);
  const canSubmit = allChecked && photoItemsOk;

  const handleEnviar = async () => {
    if (!canSubmit || !loja || !user?.id) {
      if (!loja) Alert.alert('Supermercado', 'Selecione o supermercado.');
      return;
    }
    setSubmitting(true);
    try {
      await enviarProcedimento({
        tipo: 'promotor',
        lojaId: loja.id,
        usuarioId: user.id,
        itens: checklist.map((i) => ({
          id: i.id,
          label: i.label,
          concluido: !!concluidos[i.id],
          requiresPhoto: i.requiresPhoto,
        })),
        fotos: photos,
      });
      Alert.alert('Procedimento enviado', 'Seu checklist foi registrado com sucesso.', [{ text: 'OK' }]);
      setConcluidos({});
      const resetPhotos: Record<string, string[]> = {};
      checklist.filter((i) => i.requiresPhoto).forEach((i) => {
        resetPhotos[i.id] = [];
      });
      setPhotos(resetPhotos);
      setLoja(null);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível enviar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <SectionTitle>Checklist procedimentos promotores</SectionTitle>

      <LojaPicker
        label="Supermercado"
        placeholder="Selecionar supermercado"
        selectedIds={loja ? [loja.id] : []}
        multiple={false}
        onChange={(lojas) => setLoja(lojas[0] ?? null)}
      />

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {concluidosCount} de {totalItens} itens concluídos
        </Text>
        <View style={[styles.barBg, { borderRadius: borderRadius.full }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${totalItens ? (concluidosCount / totalItens) * 100 : 0}%`,
                borderRadius: borderRadius.full,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.card}>
        {checklist.map((item) => {
          const checked = concluidos[item.id];
          const itemPhotos = item.requiresPhoto ? photos[item.id] ?? [] : [];
          return (
            <View key={item.id} style={styles.rowWrap}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => toggle(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.check, checked && styles.checkOk]}>
                  {checked && <Text style={styles.checkText}>✓</Text>}
                </View>
                <Text style={[styles.itemLabel, checked && styles.labelDone]}>{item.label}</Text>
              </TouchableOpacity>
              {item.requiresPhoto && (
                <View style={styles.photoBlock}>
                  {itemPhotos.length > 0 ? (
                    <View style={styles.photoRow}>
                      {itemPhotos.slice(0, 4).map((uri, idx) => (
                        <View key={idx} style={styles.thumbWrap}>
                          <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.thumbRemove}
                            onPress={() => removePhoto(item.id, idx)}
                          >
                            <Text style={styles.thumbRemoveText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {itemPhotos.length > 4 && (
                        <Text style={styles.thumbMore}>+{itemPhotos.length - 4}</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.photoHint}>Nenhum arquivo escolhido</Text>
                  )}
                  <TouchableOpacity
                    style={styles.photoBtn}
                    onPress={() => handleAddPhoto(item.id)}
                  >
                    <ImagePlus size={18} color={colors.primary} />
                    <Text style={styles.photoBtnText}>
                      Anexe pelo menos uma foto (múltiplas permitidas)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleEnviar}
        disabled={!canSubmit}
        activeOpacity={0.85}
      >
        <Text style={[styles.buttonText, !canSubmit && styles.buttonTextDisabled]}>
          Enviar procedimento
        </Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  progress: { marginBottom: spacing.md },
  progressText: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  barBg: { height: 6, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowWrap: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.xs },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkOk: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  itemLabel: { ...typography.body, color: colors.text, flex: 1, fontSize: 14 },
  labelDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  photoBlock: { marginLeft: 36, marginTop: 4, marginBottom: spacing.sm },
  photoHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  photoBtnText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  thumbWrap: { position: 'relative' },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  thumbRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRemoveText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  thumbMore: { ...typography.small, color: colors.textSecondary, alignSelf: 'center' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: { backgroundColor: colors.surfaceElevated, opacity: 0.8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  buttonTextDisabled: { color: colors.textSecondary },
});
