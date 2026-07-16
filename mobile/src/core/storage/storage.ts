import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';
import type { User } from '../auth/types';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
}

/** Checklist diário do colaborador */
export interface ChecklistColab {
  data: string;
  canhotos: boolean;
  procedimento: boolean;
  quebra: boolean;
  /** Checklist do dia já foi registrado (enviado) */
  registrado?: boolean;
  registradoEm?: string;
}

const checklistKey = () => `${STORAGE_KEYS.CHECKLIST_COLAB}_${new Date().toISOString().slice(0, 10)}`;

export async function getChecklistColab(): Promise<ChecklistColab | null> {
  const key = checklistKey();
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChecklistColab;
  } catch {
    return null;
  }
}

export async function setChecklistColab(updates: Partial<Omit<ChecklistColab, 'data'>>): Promise<ChecklistColab> {
  const key = checklistKey();
  const data = new Date().toISOString().slice(0, 10);
  const current = await getChecklistColab();
  const next: ChecklistColab = {
    data,
    canhotos: updates.canhotos ?? current?.canhotos ?? false,
    procedimento: updates.procedimento ?? current?.procedimento ?? false,
    quebra: updates.quebra ?? current?.quebra ?? false,
    registrado: updates.registrado ?? current?.registrado ?? false,
    registradoEm: updates.registradoEm ?? current?.registradoEm,
  };
  await AsyncStorage.setItem(key, JSON.stringify(next));
  return next;
}
