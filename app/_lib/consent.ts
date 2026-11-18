"use client";

import { useSyncExternalStore } from "react";

/** Consent choices stored in localStorage. */
export type AdConsent = "granted" | "denied" | "unknown";

const STORAGE_KEY = "pz_ad_consent";

const listeners = new Set<() => void>();
let lastNotifiedConsent: AdConsent = "unknown";

function readFromStorage(): AdConsent {
  if (typeof window === "undefined") return "unknown";
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    // Deny access to ad scripts when storage is blocked.
  }
  return "unknown";
}

function emitChange() {
  lastNotifiedConsent = readFromStorage();
  for (const fn of listeners) fn();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  const wasGranted = lastNotifiedConsent === "granted";
  emitChange();
  if (wasGranted && lastNotifiedConsent !== "granted") {
    window.location.reload();
  }
}

function subscribe(cb: () => void) {
  if (listeners.size === 0) {
    lastNotifiedConsent = readFromStorage();
    window.addEventListener("storage", onStorage);
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): AdConsent {
  return "unknown";
}

/**
 * React hook that tracks the user's ad-consent choice reactively.
 *
 * Returns `'granted'`, `'denied'`, or `'unknown'` (no choice yet).
 * SSR always returns `'unknown'`.
 */
export function useAdConsent(): AdConsent {
  return useSyncExternalStore(subscribe, readFromStorage, getServerSnapshot);
}

/**
 * Persist the user's consent choice and notify all subscribers.
 *
 * Passing `'unknown'` removes the stored value (revoke).
 */
export function setAdConsent(value: AdConsent): void {
  if (typeof window === "undefined") return;

  try {
    if (value === "unknown") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  } catch {
    return;
  }

  emitChange();
}

/**
 * Non-reactive read for use outside React (e.g. ad-slot guard).
 *
 * Returns `true` only if the user explicitly granted consent.
 */
export function consentGiven(): boolean {
  return readFromStorage() === "granted";
}
