"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BasketItem, DietTag, StoreId, UserPrefs } from "./types";

const BASKET_KEY = "basketwise.basket.v1";
const PREFS_KEY = "basketwise.prefs.v1";

export const DEFAULT_PREFS: UserPrefs = {
  loyaltyCards: [],
  timeValuePerHourPence: 1000, // £10/hr default
  maxStores: 2,
  dietTags: [],
};

interface AppState {
  basket: BasketItem[];
  prefs: UserPrefs;
  hydrated: boolean;
  addToBasket: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromBasket: (productId: string) => void;
  clearBasket: () => void;
  basketCount: number;
  toggleLoyaltyCard: (storeId: StoreId) => void;
  setTimeValue: (pencePerHour: number) => void;
  setMaxStores: (n: number) => void;
  setPostcode: (postcode: string) => void;
  toggleDietTag: (tag: DietTag) => void;
}

const Ctx = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBasket(load<{ items: BasketItem[] }>(BASKET_KEY, { items: [] }).items);
    setPrefs(load<UserPrefs>(PREFS_KEY, DEFAULT_PREFS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(BASKET_KEY, JSON.stringify({ items: basket }));
  }, [basket, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  const addToBasket = useCallback((productId: string, qty = 1) => {
    setBasket((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setBasket((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  }, []);

  const removeFromBasket = useCallback((productId: string) => {
    setBasket((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearBasket = useCallback(() => setBasket([]), []);

  const toggleLoyaltyCard = useCallback((storeId: StoreId) => {
    setPrefs((p) => ({
      ...p,
      loyaltyCards: p.loyaltyCards.includes(storeId)
        ? p.loyaltyCards.filter((s) => s !== storeId)
        : [...p.loyaltyCards, storeId],
    }));
  }, []);

  const setTimeValue = useCallback((pencePerHour: number) => {
    setPrefs((p) => ({ ...p, timeValuePerHourPence: pencePerHour }));
  }, []);

  const setMaxStores = useCallback((n: number) => {
    setPrefs((p) => ({ ...p, maxStores: Math.min(4, Math.max(1, n)) }));
  }, []);

  const setPostcode = useCallback((postcode: string) => {
    setPrefs((p) => ({ ...p, postcode }));
  }, []);

  const toggleDietTag = useCallback((tag: DietTag) => {
    setPrefs((p) => ({
      ...p,
      dietTags: p.dietTags.includes(tag)
        ? p.dietTags.filter((t) => t !== tag)
        : [...p.dietTags, tag],
    }));
  }, []);

  const basketCount = useMemo(
    () => basket.reduce((s, i) => s + i.qty, 0),
    [basket]
  );

  const value = useMemo(
    () => ({
      basket,
      prefs,
      hydrated,
      addToBasket,
      setQty,
      removeFromBasket,
      clearBasket,
      basketCount,
      toggleLoyaltyCard,
      setTimeValue,
      setMaxStores,
      setPostcode,
      toggleDietTag,
    }),
    [
      basket,
      prefs,
      hydrated,
      addToBasket,
      setQty,
      removeFromBasket,
      clearBasket,
      basketCount,
      toggleLoyaltyCard,
      setTimeValue,
      setMaxStores,
      setPostcode,
      toggleDietTag,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
