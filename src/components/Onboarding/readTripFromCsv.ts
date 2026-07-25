import type { TripGroup } from '../../types';
import { parseSplitwiseCSVToTrip } from '../../services';

/** Reads a Splitwise CSV export, resolving null when the file held nothing usable. */
export function readTripFromCsv(file: File): Promise<TripGroup | null> {
  return new Promise((resolve) => {
    const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return resolve(null);
      const { trip } = parseSplitwiseCSVToTrip(text, defaultName);
      resolve(trip.expenses.length > 0 || trip.members.length > 0 ? trip : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}
