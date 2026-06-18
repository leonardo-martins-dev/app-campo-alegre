import React, { useState } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../core/auth/AuthContext';
import { colors, spacing, borderRadius } from '../theme';

export default function HeaderLogout() {
  const { logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    setShowConfirm(false);
    logout();
  };

  return (
    <>
      <Pressable
        onPress={() => setShowConfirm(true)}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View style={styles.pill}>
          <Text
            style={styles.text}
            allowFontScaling={false}
          >
            Sair
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
          onPress={() => setShowConfirm(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Deseja realmente sair?</Text>
            <Text style={styles.modalSubtitle}>Você precisará fazer login novamente para acessar o app.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnLogout}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.btnLogoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  pill: {
    backgroundColor: colors.primary + '18',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  text: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  btnCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  btnLogout: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
  },
  btnLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface,
  },
});
