import type { DateFormatType, DateFormatOption } from '../types';

export const DATE_FORMATS: DateFormatOption[] = [
  {
    format: 'DDMMYY',
    label: 'GG/AA/YY',
    example: '010180',
    converter: (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}${month}${year}`;
    },
  },
];

export function generateDateStrings(date: Date): Map<DateFormatType, string> {
  const result = new Map<DateFormatType, string>();

  for (const format of DATE_FORMATS) {
    result.set(format.format, format.converter(date));
  }

  return result;
}

export function getFormatLabel(format: DateFormatType): string {
  const found = DATE_FORMATS.find((f) => f.format === format);
  return found?.label ?? format;
}

export function formatDateForDisplay(date: Date, locale: string = 'tr-TR'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
