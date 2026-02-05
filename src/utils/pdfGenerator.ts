import { jsPDF } from 'jspdf';
import type { SearchResult } from '../types';
import { formatPosition } from './piSearch';
import { generateCertificateNumber } from './certificateCounter';

interface CertificateData {
  date: Date;
  result: SearchResult;
}

// Turkce ay isimleri
const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function formatDateForPdf(date: Date): string {
  const day = date.getDate();
  const month = TURKISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
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

export async function generateCertificate(data: CertificateData): Promise<Blob> {
  const { date, result } = data;

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

  // White background for print
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Large central Pi watermark - elegant and prominent
  pdf.setTextColor(242, 238, 238);
  pdf.setFontSize(320);
  pdf.setFont('symbol', 'normal');
  pdf.text('p', centerX, pageHeight / 2 + 40, { align: 'center' });

  // Decorative smaller pi symbols in corners (subtle)
  pdf.setTextColor(245, 241, 241);
  pdf.setFontSize(45);
  pdf.setFont('symbol', 'normal');

  // Top corners
  pdf.text('p', 38, 42, { align: 'center' });
  pdf.text('p', pageWidth - 38, 42, { align: 'center' });

  // Bottom corners
  pdf.text('p', 38, pageHeight - 32, { align: 'center' });
  pdf.text('p', pageWidth - 38, pageHeight - 32, { align: 'center' });

  // Elegant double border
  pdf.setDrawColor(139, 0, 0);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  pdf.setLineWidth(0.5);
  pdf.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Corner decorations
  pdf.setLineWidth(1.5);
  // Top-left
  pdf.line(10, 25, 25, 25);
  pdf.line(25, 10, 25, 25);
  // Top-right
  pdf.line(pageWidth - 10, 25, pageWidth - 25, 25);
  pdf.line(pageWidth - 25, 10, pageWidth - 25, 25);
  // Bottom-left
  pdf.line(10, pageHeight - 25, 25, pageHeight - 25);
  pdf.line(25, pageHeight - 10, 25, pageHeight - 25);
  // Bottom-right
  pdf.line(pageWidth - 10, pageHeight - 25, pageWidth - 25, pageHeight - 25);
  pdf.line(pageWidth - 25, pageHeight - 10, pageWidth - 25, pageHeight - 25);

  // Title with Turkish characters
  pdf.setTextColor(139, 0, 0);
  pdf.setFontSize(32);
  pdf.setFont('Roboto', 'bold');
  pdf.text('Pİ DOĞUM GÜNÜ SERTİFİKASI', centerX, 45, { align: 'center' });

  // Decorative line under title
  pdf.setDrawColor(139, 0, 0);
  pdf.setLineWidth(1);
  pdf.line(centerX - 70, 52, centerX + 70, 52);

  // Date
  const dateText = formatDateForPdf(date);
  pdf.setTextColor(50, 50, 50);
  pdf.setFontSize(24);
  pdf.setFont('Roboto', 'bold');
  pdf.text(dateText, centerX, 72, { align: 'center' });

  // Subtitle with Turkish characters
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(11);
  pdf.setFont('Roboto', 'normal');
  pdf.text('tarihi Pİ sayısının sonsuza kadar giden basamakları içinde', centerX, 84, { align: 'center' });

  // Position number - main highlight
  pdf.setTextColor(139, 0, 0);
  pdf.setFontSize(72);
  pdf.setFont('Roboto', 'bold');
  const positionText = formatPosition(result.position);
  pdf.text(positionText, centerX, 120, { align: 'center' });

  // Position label with Turkish characters
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(12);
  pdf.setFont('Roboto', 'normal');
  pdf.text('. basamakta bulunmuştur.', centerX, 133, { align: 'center' });

  // Context box
  pdf.setFillColor(250, 248, 248);
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(centerX - 85, 143, 170, 24, 3, 3, 'FD');

  // Context digits
  const contextBefore = result.context.before;
  const contextMatch = result.context.match;
  const contextAfter = result.context.after;

  pdf.setFontSize(14);
  pdf.setFont('courier', 'normal');

  const fullContextText = `...${contextBefore}[${contextMatch}]${contextAfter}...`;
  const totalWidth = pdf.getTextWidth(fullContextText);
  const startX = centerX - totalWidth / 2;

  const beforePart = `...${contextBefore}`;
  const matchPart = `[${contextMatch}]`;
  const afterPart = `${contextAfter}...`;

  pdf.setTextColor(120, 120, 120);
  pdf.text(beforePart, startX, 158, { align: 'left' });

  const beforeWidth = pdf.getTextWidth(beforePart);
  pdf.setTextColor(139, 0, 0);
  pdf.setFont('courier', 'bold');
  pdf.text(matchPart, startX + beforeWidth, 158, { align: 'left' });

  const matchWidth = pdf.getTextWidth(matchPart);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('courier', 'normal');
  pdf.text(afterPart, startX + beforeWidth + matchWidth, 158, { align: 'left' });

  // Certificate number - top left corner
  const certNumber = generateCertificateNumber();
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('Roboto', 'normal');
  pdf.text(`Sertifika No: ${certNumber}`, 18, 22, { align: 'left' });

  // Footer - positioned inside border with Turkish characters
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('Roboto', 'normal');
  pdf.text('Bu Sertifika ve web sitesi FRC #6459 takım desteği ile üretilmiştir.', centerX, pageHeight - 22, { align: 'center' });

  pdf.setTextColor(139, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('Roboto', 'bold');
  pdf.text('www.zekapusulasi.com', centerX, pageHeight - 16, { align: 'center' });

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
