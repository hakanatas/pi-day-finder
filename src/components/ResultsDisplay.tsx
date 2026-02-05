import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Share2, Mail } from 'lucide-react';
import type { SearchResult } from '../types';
import { formatPosition } from '../utils/piSearch';
import { formatDateForDisplay } from '../utils/dateFormats';
import { generateCertificate } from '../utils/pdfGenerator';

interface ResultsDisplayProps {
  result: SearchResult;
  date: Date;
  onDownload: () => void;
  onSearchAgain: () => void;
}

export function ResultsDisplay({
  result,
  date,
  onDownload,
  onSearchAgain,
}: ResultsDisplayProps) {
  const formattedPosition = formatPosition(result.position);
  const formattedDate = formatDateForDisplay(date);

  const handleShare = async () => {
    const shareText = `Doğum günümü Pi sayısının ${formattedPosition}. basamağında buldum! #PiDay #MyPiDay`;

    // Try to share with PDF file
    if (navigator.share && navigator.canShare) {
      try {
        const pdfBlob = await generateCertificate({ date, result });
        const pdfFile = new File([pdfBlob], 'pi-sertifikasi.pdf', { type: 'application/pdf' });

        if (navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            title: 'Pi Günümü Buldum!',
            text: shareText,
            files: [pdfFile],
          });
          return;
        }
      } catch {
        // Fall through to text-only share
      }
    }

    // Fallback to text-only share
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pi Günümü Buldum!',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const handleEmailShare = async () => {
    try {
      // Generate PDF and download first
      const pdfBlob = await generateCertificate({ date, result });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pi-sertifikasi.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Then open email client
      const subject = encodeURIComponent('Pi Doğum Günü Sertifikam!');
      const body = encodeURIComponent(
        `Merhaba,\n\nDoğum günümü Pi sayısının ${formattedPosition}. basamağında buldum!\n\n` +
        `Tarih: ${formattedDate}\n` +
        `Pi'deki konum: ...${result.context.before}[${result.context.match}]${result.context.after}...\n\n` +
        `Sertifikamı ekte bulabilirsiniz.\n\n` +
        `Sen de kendi Pi gününü bul: ${window.location.href}\n\n` +
        `#PiDay #MyPiDay`
      );

      window.location.href = `mailto:?subject=${subject}&body=${body}`;

      alert('PDF indirildi! Lütfen e-postanıza ek olarak ekleyin.');
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Panoya kopyalandı!');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="bg-black/70 backdrop-blur-md rounded-2xl p-8 border border-pi-red-900/50 shadow-2xl">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pi-red-600 to-pi-red-900
                       flex items-center justify-center shadow-lg shadow-pi-red-900/50"
          >
            <span className="text-5xl text-white font-serif">π</span>
          </motion.div>

          {/* Main Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <p className="text-gray-300 mb-2">Tarihin bulundugu konum</p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-6xl font-bold text-pi-red-500 mb-2 font-mono"
            >
              {formattedPosition}
            </motion.h2>
            <p className="text-gray-400 text-sm mb-4">
              pi sayisinin sonsuz basamaklarinda
            </p>

            <div className="inline-block bg-pi-red-950/50 px-4 py-2 rounded-lg">
              <p className="text-white font-medium">{formattedDate}</p>
              <p className="text-gray-400 text-xs">
                Aranan: {result.searchString}
              </p>
            </div>
          </motion.div>

          {/* Context Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-black/50 rounded-xl p-4 mb-6 font-mono text-center overflow-x-auto"
          >
            <p className="text-gray-500 text-xs mb-2">Pi'deki konumu</p>
            <p className="text-lg whitespace-nowrap">
              <span className="text-gray-500">...{result.context.before}</span>
              <span className="text-pi-red-500 font-bold bg-pi-red-900/30 px-1 rounded mx-1">
                {result.context.match}
              </span>
              <span className="text-gray-500">{result.context.after}...</span>
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-3 gap-3"
          >
            <button
              onClick={onDownload}
              className="flex items-center justify-center gap-2 py-3 px-3
                         bg-gradient-to-r from-pi-red-700 to-pi-red-900
                         text-white rounded-xl hover:from-pi-red-600 hover:to-pi-red-800
                         transition-all font-medium shadow-lg shadow-pi-red-900/30 text-sm"
            >
              <Download className="w-5 h-5" />
              İndir
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-3
                         bg-white/10 text-white rounded-xl
                         hover:bg-white/20 transition-all font-medium text-sm"
            >
              <Share2 className="w-5 h-5" />
              Paylaş
            </button>
            <button
              onClick={handleEmailShare}
              className="flex items-center justify-center gap-2 py-3 px-3
                         bg-white/10 text-white rounded-xl
                         hover:bg-white/20 transition-all font-medium text-sm"
            >
              <Mail className="w-5 h-5" />
              E-posta
            </button>
          </motion.div>

          {/* Search Again */}
          <button
            onClick={onSearchAgain}
            className="w-full mt-4 py-3 text-gray-400 hover:text-white
                       flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Baska bir tarih ara
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
