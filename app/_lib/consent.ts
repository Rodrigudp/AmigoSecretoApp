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

function refreshConsent() {
  const wasGranted = lastNotifiedConsent === "granted";
  emitChange();
  if (wasGranted && lastNotifiedConsent !== "granted") {
    window.location.reload();
  }
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) refreshConsent();
}

function subscribe(cb: () => void) {
  if (listeners.size === 0) {
    lastNotifiedConsent = readFromStorage();
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", refreshConsent);
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", refreshConsent);
    }
  };
}

function getServerSnapshot(): AdConsent {
  return "unknown";
}

export function useAdConsent(): AdConsent {
  return useSyncExternalStore(subscribe, readFromStorage, getServerSnapshot);
}

function clearConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    localStorage.setItem(STORAGE_KEY, "unknown");
  }
}

/** Returns whether the new choice is effective in storage. */
export function setAdConsent(value: AdConsent): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (value === "unknown") {
      clearConsent();
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  } catch {
    // Read back below in case storage became inaccessible and ads are now blocked.
  }

  emitChange();
  return lastNotifiedConsent === value;
}

export function consentGiven(): boolean {
  return readFromStorage() === "granted";
}
