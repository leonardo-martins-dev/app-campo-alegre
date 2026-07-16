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
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../../core/auth/AuthContext';
import { colors, spacing, borderRadius, shadows } from '../theme';

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
        hitSlop={8}
        accessibilityLabel="Sair"
      >
        <View style={styles.pill}>
          <LogOut size={14} color={colors.navy} strokeWidth={2.2} />
          <Text style={styles.text} allowFontScaling={false}>
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
            <Text style={styles.modalTitle}>Sair da conta?</Text>
            <Text style={styles.modalSubtitle}>
              Você precisará entrar novamente para usar o app.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.85}>
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
    minHeight: 40,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.navy,
    fontWeight: '600',
    fontSize: 13,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  btnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  btnLogout: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
  },
  btnLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
