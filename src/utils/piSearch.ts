import type { DateFormatType, SearchResult } from '../types';
import { generateDateStrings } from './dateFormats';

export function searchPiDigits(
  piDigits: string,
  searchString: string,
  format: DateFormatType
): SearchResult {
  const index = piDigits.indexOf(searchString);

  if (index === -1) {
    return {
      position: -1,
      searchString,
      format,
      found: false,
      context: { before: '', match: '', after: '' },
    };
  }

  // Position is 0-indexed to match mypiday.com
  // Pi = 3.14159... so position 0 = '1', position 1 = '4', etc.
  const position = index;

  return {
    position,
    searchString,
    format,
    found: true,
    context: {
      before: piDigits.slice(Math.max(0, index - 10), index),
      match: searchString,
      after: piDigits.slice(index + searchString.length, index + searchString.length + 10),
    },
  };
}

export function searchAllFormats(piDigits: string, date: Date): SearchResult | null {
  const dateStrings = generateDateStrings(date);
  let earliestResult: SearchResult | null = null;

  for (const [format, dateString] of dateStrings) {
    const result = searchPiDigits(piDigits, dateString, format);

    if (result.found) {
      if (!earliestResult || result.position < earliestResult.position) {
        earliestResult = result;
      }
    }
  }

  return earliestResult;
}

export function formatPosition(position: number): string {
  // Format with space separator instead of dots (1.234.567 -> 1 234 567)
  return position.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
