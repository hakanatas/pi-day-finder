// Certificate counter utility using localStorage
// Format: PI-YYYYMMDD-XXXXX

interface CounterData {
  date: string;
  count: number;
  total: number;
}

const STORAGE_KEY = 'pi-certificate-counter';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getCounterData(): CounterData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // If localStorage fails, return default
  }
  return { date: getTodayString(), count: 0, total: 0 };
}

function saveCounterData(data: CounterData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function generateCertificateNumber(): string {
  const today = getTodayString();
  let data = getCounterData();

  // Reset daily counter if it's a new day
  if (data.date !== today) {
    data = { date: today, count: 0, total: data.total };
  }

  // Increment counters
  data.count += 1;
  data.total += 1;

  // Save updated data
  saveCounterData(data);

  // Format: PI-YYYYMMDD-XXXXX
  const serialNumber = String(data.count).padStart(5, '0');
  return `PI-${today}-${serialNumber}`;
}

export function getTotalCertificates(): number {
  const data = getCounterData();
  return data.total;
}

export function getTodayCertificates(): number {
  const data = getCounterData();
  const today = getTodayString();
  return data.date === today ? data.count : 0;
}
