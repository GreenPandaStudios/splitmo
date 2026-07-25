import type { TripGroup } from '../../types';

const HEADERS = ['ID', 'Title', 'Amount', 'Currency', 'PayerId', 'Date', 'Category'];

/** Downloads the trip's expenses as a CSV file. Returns false when there is nothing to export. */
export function exportLedgerCsv(trip: TripGroup): boolean {
  if (trip.expenses.length === 0) return false;

  const rows = trip.expenses.map((e) => [
    e.id, `"${e.title.replace(/"/g, '""')}"`, e.amount, e.currency, e.paidByMemberId, e.date, e.category,
  ]);
  const csv = [HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(`data:text/csv;charset=utf-8,${csv}`));
  link.setAttribute('download', `${trip.name.replace(/\s+/g, '_')}_expenses.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
