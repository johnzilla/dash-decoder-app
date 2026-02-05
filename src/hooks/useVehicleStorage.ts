import { useMemo } from 'react';
import { Vehicle, StoredVehicle, StoredVehicleSchema } from '../types';

const STORAGE_KEY = 'dash-decoder-vehicle';
const EXPIRY_DAYS = 90;

/**
 * Hook for managing vehicle data in localStorage with expiry.
 * Vehicles are stored for 90 days before requiring re-confirmation.
 */
export function useVehicleStorage() {
  /**
   * Retrieves stored vehicle from localStorage.
   * Validates data structure and checks expiry.
   * Returns null if no vehicle, expired, or corrupted data.
   */
  const getVehicle = (): Vehicle | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const validated = StoredVehicleSchema.parse(parsed);

      // Check if expired (90 days)
      const now = Date.now();
      const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (now - validated.timestamp > expiryMs) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Return vehicle without timestamp
      const { timestamp: _, ...vehicle } = validated;
      return vehicle;
    } catch {
      // Corrupted data - clear storage
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  };

  /**
   * Saves vehicle to localStorage with current timestamp.
   */
  const saveVehicle = (vehicle: Vehicle): void => {
    const stored: StoredVehicle = {
      ...vehicle,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  };

  /**
   * Removes vehicle from localStorage.
   */
  const clearVehicle = (): void => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Memoize current stored vehicle value
  const storedVehicle = useMemo(() => getVehicle(), []);

  return {
    getVehicle,
    saveVehicle,
    clearVehicle,
    storedVehicle,
  };
}
