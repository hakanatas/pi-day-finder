import { jsPDF } from 'jspdf';
import type { SearchResult } from '../types';
import { formatPosition } from './piSearch';
import { generateCertificateNumber } from './certificateCounter';

export type CertificateLanguage = 'tr' | 'en' | 'de';

interface CertificateData {
  date: Date;
  result: SearchResult;
  language?: CertificateLanguage;
}

const MONTHS: Record<CertificateLanguage, string[]> = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
};

function formatDateForPdf(date: Date, lang: CertificateLanguage): string {
  const day = date.getDate();
  const month = MONTHS[lang][date.getMonth()];
  const year = date.getFullYear();
  if (lang === 'en') return `${month} ${day}, ${year}`;
  if (lang === 'de') return `${day}. ${month} ${year}`;
  return `${day} ${month} ${year}`;
}

export const CERT_TEXTS = {
  tr: {
    eyebrow: 'π GÜNÜ ETKİNLİĞİ',
    title: 'Pİ DOĞUM GÜNÜ SERTİFİKASI',
    lead: 'Bu belge,',
    subtitle: 'tarihinin, π sayısının sonsuza uzanan ondalık basamakları arasında',
    foundAt: 'numaralı basamakta bulunduğunu belgeler.',
    contextLabel: 'π İÇİNDEKİ GÖRÜNÜMÜ',
    certNo: 'Sertifika No:',
    issued: 'Veriliş:',
    footer: 'Bu sertifika ve web sitesi FTC #24230 AG Robotik Takımı desteğiyle üretilmiştir.',
    filename: 'pi-sertifikasi.pdf',
  },
  en: {
    eyebrow: 'π DAY ACTIVITY',
    title: 'PI BIRTHDAY CERTIFICATE',
    lead: 'This document certifies that',
    subtitle: 'was found among the infinite decimal digits of π, at position',
    foundAt: 'after the decimal point.',
    contextLabel: 'AS SEEN INSIDE π',
    certNo: 'Certificate No:',
    issued: 'Issued:',
    footer: 'This certificate and website were created with the support of FTC Team #24230 AG Robotik.',
    filename: 'pi-certificate.pdf',
  },
  de: {
    eyebrow: 'π-TAG AKTIVITÄT',
    title: 'PI-GEBURTSTAGSZERTIFIKAT',
    lead: 'Dieses Dokument bescheinigt, dass',
    subtitle: 'in den unendlichen Dezimalstellen der Zahl π gefunden wurde – an Position',
    foundAt: 'nach dem Komma.',
    contextLabel: 'SO ERSCHEINT ES IN π',
    certNo: 'Zertifikat-Nr.:',
    issued: 'Ausgestellt:',
    footer: 'Dieses Zertifikat und die Website wurden mit Unterstützung des FTC-Teams #24230 erstellt.',
    filename: 'pi-zertifikat.pdf',
  },
} as const;

// Letterspaced small-caps effect used for the eyebrow and context labels
function spaced(s: string): string {
  return s.split('').join(' ');
}

// Load font as base64
async function loadFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// First digits of pi used for the decorative ring
const PI_RING_DIGITS =
  '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745';

// Palette
const DEEP_RED: [number, number, number] = [139, 0, 0];
const ACCENT_RED: [number, number, number] = [185, 28, 28];
const GOLD: [number, number, number] = [176, 141, 87];
const IVORY: [number, number, number] = [253, 250, 245];
const CHARCOAL: [number, number, number] = [55, 50, 47];
const MUTED: [number, number, number] = [125, 113, 105];

export async function generateCertificate(data: CertificateData): Promise<Blob> {
  const { date, result, language = 'tr' } = data;
  const t = CERT_TEXTS[language];

  // Create landscape A4 PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Load and add Roboto fonts with Turkish character support
  try {
    const baseUrl = import.meta.env.BASE_URL;
    const [regularFont, boldFont] = await Promise.all([
      loadFontAsBase64(`${baseUrl}fonts/Roboto-Regular.ttf`),
      loadFontAsBase64(`${baseUrl}fonts/Roboto-Bold.ttf`)
    ]);

    pdf.addFileToVFS('Roboto-Regular.ttf', regularFont);
    pdf.addFileToVFS('Roboto-Bold.ttf', boldFont);
    pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    pdf.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  } catch (error) {
    console.warn('Could not load custom fonts, using defaults:', error);
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // ---- Background -------------------------------------------------------
  pdf.setFillColor(...IVORY);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Large central pi watermark, barely-there warm tint
  pdf.setTextColor(246, 238, 231);
  pdf.setFontSize(300);
  pdf.setFont('symbol', 'normal');
  pdf.text('p', centerX, pageHeight / 2 + 38, { align: 'center' });

  // Ring of pi digits circling the center of the certificate
  const ringCx = centerX;
  const ringCy = 104;
  const ringR = 76;
  const ringCount = 96;
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(226, 204, 196);
  for (let i = 0; i < ringCount; i++) {
    const phi = (i / ringCount) * 360; // degrees clockwise from 12 o'clock
    if (phi < 40 || phi > 320) continue; // keep the top arc clear of the header
    const rad = (phi * Math.PI) / 180;
    const x = ringCx + ringR * Math.sin(rad);
    const y = ringCy - ringR * Math.cos(rad);
    pdf.text(PI_RING_DIGITS[i % PI_RING_DIGITS.length], x, y, {
      align: 'center',
      angle: -phi,
    });
  }

  // ---- Frame ------------------------------------------------------------
  // Outer deep-red band
  pdf.setDrawColor(...DEEP_RED);
  pdf.setLineWidth(2.4);
  pdf.rect(9, 9, pageWidth - 18, pageHeight - 18);
  // Gold inner line
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.6);
  pdf.rect(13, 13, pageWidth - 26, pageHeight - 26);
  // Hairline
  pdf.setDrawColor(...DEEP_RED);
  pdf.setLineWidth(0.25);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Corner flourishes: red L-marks + gold diamonds
  const corner = (cx: number, cy: number, dx: number, dy: number) => {
    pdf.setDrawColor(...DEEP_RED);
    pdf.setLineWidth(1.1);
    pdf.line(cx + dx * 4, cy + dy * 12, cx + dx * 12, cy + dy * 12);
    pdf.line(cx + dx * 12, cy + dy * 4, cx + dx * 12, cy + dy * 12);
    // small gold diamond just inside the corner
    const gx = cx + dx * 18;
    const gy = cy + dy * 18;
    pdf.setFillColor(...GOLD);
    pdf.triangle(gx, gy - 2.1, gx + 2.1, gy, gx, gy + 2.1, 'F');
    pdf.triangle(gx, gy - 2.1, gx - 2.1, gy, gx, gy + 2.1, 'F');
  };
  corner(9, 9, 1, 1);
  corner(pageWidth - 9, 9, -1, 1);
  corner(9, pageHeight - 9, 1, -1);
  corner(pageWidth - 9, pageHeight - 9, -1, -1);

  // ---- Header -----------------------------------------------------------
  pdf.setTextColor(...MUTED);
  pdf.setFontSize(9);
  pdf.setFont('Roboto', 'normal');
  pdf.text(spaced(t.eyebrow), centerX, 30, { align: 'center' });

  pdf.setTextColor(...DEEP_RED);
  pdf.setFontSize(30);
  pdf.setFont('Roboto', 'bold');
  pdf.text(t.title, centerX, 42, { align: 'center' });

  // Gold divider with pi medallion in the middle
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.7);
  pdf.line(centerX - 72, 49.5, centerX - 9, 49.5);
  pdf.line(centerX + 9, 49.5, centerX + 72, 49.5);
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(13);
  pdf.setFont('symbol', 'normal');
  pdf.text('p', centerX, 51.7, { align: 'center' });

  // ---- Statement --------------------------------------------------------
  pdf.setTextColor(...MUTED);
  pdf.setFontSize(11);
  pdf.setFont('Roboto', 'normal');
  pdf.text(t.lead, centerX, 62, { align: 'center' });

  const dateText = formatDateForPdf(date, language);
  pdf.setTextColor(...CHARCOAL);
  pdf.setFontSize(26);
  pdf.setFont('Roboto', 'bold');
  pdf.text(dateText, centerX, 73, { align: 'center' });

  pdf.setTextColor(...MUTED);
  pdf.setFontSize(11);
  pdf.setFont('Roboto', 'normal');
  pdf.text(t.subtitle, centerX, 82, { align: 'center' });

  // ---- Position number (with soft drop shadow) --------------------------
  const positionText = formatPosition(result.position);
  pdf.setFont('Roboto', 'bold');
  pdf.setFontSize(58);
  pdf.setTextColor(238, 219, 213); // shadow
  pdf.text(positionText, centerX + 0.9, 109.9, { align: 'center' });
  pdf.setTextColor(...ACCENT_RED);
  pdf.text(positionText, centerX, 109, { align: 'center' });

  pdf.setTextColor(...CHARCOAL);
  pdf.setFontSize(12);
  pdf.setFont('Roboto', 'normal');
  pdf.text(t.foundAt, centerX, 120, { align: 'center' });

  // ---- Context strip ----------------------------------------------------
  pdf.setFillColor(250, 245, 238);
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(centerX - 88, 130, 176, 26, 3, 3, 'FD');

  pdf.setTextColor(...MUTED);
  pdf.setFontSize(7.5);
  pdf.setFont('Roboto', 'normal');
  pdf.text(spaced(t.contextLabel), centerX, 137, { align: 'center' });

  const contextBefore = `...${result.context.before}`;
  const contextMatch = result.context.match;
  const contextAfter = `${result.context.after}...`;

  pdf.setFontSize(13);
  pdf.setFont('courier', 'bold');
  const matchW = pdf.getTextWidth(contextMatch);
  pdf.setFont('courier', 'normal');
  const beforeW = pdf.getTextWidth(contextBefore);
  const afterW = pdf.getTextWidth(contextAfter);
  const pillPad = 2.2;
  const pillGap = 1.4;
  const totalW = beforeW + matchW + afterW + pillPad * 2 + pillGap * 2;
  let cx0 = centerX - totalW / 2;
  const cy0 = 148.5;

  pdf.setTextColor(150, 138, 130);
  pdf.text(contextBefore, cx0, cy0);
  cx0 += beforeW + pillGap;

  // red pill behind the matched date, white digits on top
  pdf.setFillColor(...DEEP_RED);
  pdf.roundedRect(cx0, cy0 - 4.6, matchW + pillPad * 2, 6.6, 1.6, 1.6, 'F');
  pdf.setTextColor(255, 252, 248);
  pdf.setFont('courier', 'bold');
  pdf.text(contextMatch, cx0 + pillPad, cy0);
  cx0 += matchW + pillPad * 2 + pillGap;

  pdf.setTextColor(150, 138, 130);
  pdf.setFont('courier', 'normal');
  pdf.text(contextAfter, cx0, cy0);

  // ---- Seal (bottom-right rosette) --------------------------------------
  const sealX = pageWidth - 42;
  const sealY = pageHeight - 44;
  // ribbon tails
  pdf.setFillColor(120, 0, 0);
  pdf.triangle(sealX - 7, sealY + 8, sealX - 2, sealY + 24, sealX - 12, sealY + 21, 'F');
  pdf.triangle(sealX + 7, sealY + 8, sealX + 12, sealY + 21, sealX + 2, sealY + 24, 'F');
  // scalloped edge
  pdf.setFillColor(...DEEP_RED);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    pdf.circle(sealX + Math.cos(a) * 12.5, sealY + Math.sin(a) * 12.5, 2.1, 'F');
  }
  // body
  pdf.circle(sealX, sealY, 12.5, 'F');
  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.circle(sealX, sealY, 10.2);
  // pi glyph
  pdf.setTextColor(255, 250, 244);
  pdf.setFontSize(26);
  pdf.setFont('symbol', 'normal');
  pdf.text('p', sealX, sealY + 3.4, { align: 'center' });
  // year under the glyph
  pdf.setFontSize(6.5);
  pdf.setFont('Roboto', 'bold');
  pdf.text(String(new Date().getFullYear()), sealX, sealY + 7.6, { align: 'center' });

  // ---- Certificate number & footer --------------------------------------
  const certNumber = generateCertificateNumber();
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  pdf.setFont('Roboto', 'normal');
  pdf.text(`${t.certNo} ${certNumber}`, 33, pageHeight - 24, { align: 'left' });
  pdf.text(`${t.issued} ${formatDateForPdf(new Date(), language)}`, 33, pageHeight - 19.5, { align: 'left' });

  pdf.setFontSize(9);
  pdf.setTextColor(...MUTED);
  pdf.text(t.footer, centerX, pageHeight - 24, { align: 'center' });

  pdf.setTextColor(...DEEP_RED);
  pdf.setFontSize(10);
  pdf.setFont('Roboto', 'bold');
  pdf.text('www.zekapusulasi.com', centerX, pageHeight - 18.5, { align: 'center' });

  return pdf.output('blob');
}

export function downloadCertificate(
  blob: Blob,
  filename: string = 'pi-sertifikasi.pdf'
): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
