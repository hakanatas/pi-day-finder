// Certificate counter utility using localStorage
// Format: PI-2026314-XXXXX (PI-YYYMMDD-TOTAL)

const STORAGE_KEY = 'pi-certificate-total';

function getTotal(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return parseInt(stored, 10) || 0;
    }
  } catch {
    // If localStorage fails, return 0
  }
  return 0;
}

function saveTotal(total: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(total));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function generateCertificateNumber(): string {
  // Increment total
  const newTotal = getTotal() + 1;
  saveTotal(newTotal);

  // Get today's date for the format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Format: PI-YYYYMMDD-XXXXX (total number)
  const serialNumber = String(newTotal).padStart(5, '0');
  return `PI-${dateStr}-${serialNumber}`;
}

export function getTotalCertificates(): number {
  return getTotal();
}
