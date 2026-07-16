export const APP_NAME = 'Campo Alegre';

/** URL pública da política de privacidade (App Store). */
export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? 'https://noponto.io/privacidade';

export const STORAGE_KEYS = {
  TOKEN: '@campo_alegre_token',
  USER: '@campo_alegre_user',
  CHECKLIST_COLAB: '@campo_alegre_checklist_colab',
} as const;
