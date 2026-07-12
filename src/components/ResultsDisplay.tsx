import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Share2, Mail, X, Paperclip, Globe } from 'lucide-react';
import type { SearchResult } from '../types';
import { formatPosition } from '../utils/piSearch';
import { formatDateForDisplay } from '../utils/dateFormats';
import { generateCertificate, type CertificateLanguage, CERT_TEXTS } from '../utils/pdfGenerator';
import { ConfettiBurst } from './ConfettiBurst';
import { useCountUp } from '../hooks/useCountUp';

interface ResultsDisplayProps {
  result: SearchResult;
  date: Date;
  onDownload: (language: CertificateLanguage) => void;
  onSearchAgain: () => void;
}

export function ResultsDisplay({
  result,
  date,
  onDownload,
  onSearchAgain,
}: ResultsDisplayProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [language, setLanguage] = useState<CertificateLanguage>('tr');
  const formattedPosition = formatPosition(result.position);
  const formattedDate = formatDateForDisplay(date);

  // Position number counts up from 0 for a dramatic reveal
  const countUp = useCountUp(result.position, 1600, 400);

  useEffect(() => {
    const id = setTimeout(() => setShowConfetti(false), 2600);
    return () => clearTimeout(id);
  }, []);

  const handleShare = async () => {
    const shareText = `Doğum günümü Pi sayısının ${formattedPosition}. basamağında buldum! #PiDay #MyPiDay`;
    const filename = CERT_TEXTS[language].filename;

    // Try to share with PDF file
    if (navigator.share && navigator.canShare) {
      try {
        const pdfBlob = await generateCertificate({ date, result, language });
        const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

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
      const filename = CERT_TEXTS[language].filename;
      // Generate PDF and download first
      const pdfBlob = await generateCertificate({ date, result, language });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show modal reminder
      setShowEmailModal(true);

      // Wait a bit then open email client
      setTimeout(() => {
        const subject = encodeURIComponent('🎂 Pi Doğum Günü Sertifikam! π');
        const body = encodeURIComponent(
`Merhaba! 👋

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 DOĞUM GÜNÜMÜ Pİ SAYISINDA BULDUM! 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Tarih: ${formattedDate}
📍 Konum: ${formattedPosition}. basamak

Pi sayısındaki görünümü:
...${result.context.before}[${result.context.match}]${result.context.after}...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 Sertifikamı ekte bulabilirsiniz!

🔗 Sen de kendi Pi gününü bul:
${window.location.href}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#PiDay #MyPiDay #π #Matematik

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 www.zekapusulasi.com
🤖 FTC #24230 AG Robotik Takımı desteğiyle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }, 500);
    } catch {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Panoya kopyalandı!');
  };

  return (
    <AnimatePresence>
      {showConfetti && <ConfettiBurst />}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40, rotateX: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="result-card-glow bg-black/70 backdrop-blur-md rounded-2xl p-8 border border-pi-red-900/50 shadow-2xl">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
            className="relative w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pi-red-600 to-pi-red-900
                       flex items-center justify-center shadow-lg shadow-pi-red-900/50"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-pi-red-500/70"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            />
            <motion.span
              className="text-5xl text-white font-serif"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              π
            </motion.span>
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
              className="text-6xl font-bold text-pi-red-500 mb-2 font-mono tabular-nums"
              animate={
                countUp.done
                  ? {
                      scale: [1, 1.12, 1],
                      textShadow: [
                        '0 0 0px rgba(239,68,68,0)',
                        '0 0 42px rgba(239,68,68,0.95)',
                        '0 0 16px rgba(239,68,68,0.45)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              {formatPosition(countUp.value)}
            </motion.h2>
            <p className="text-gray-400 text-sm mb-4">
              pi sayisinin sonsuz basamaklarinda
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block bg-pi-red-950/50 px-4 py-2 rounded-lg"
            >
              <p className="text-white font-medium">{formattedDate}</p>
              <p className="text-gray-400 text-xs">
                Aranan: {result.searchString}
              </p>
            </motion.div>
          </motion.div>

          {/* Context Display: digits type in one by one, match flips in glowing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-black/50 rounded-xl p-4 mb-6 font-mono text-center overflow-x-auto"
          >
            <p className="text-gray-500 text-xs mb-2">Pi'deki konumu</p>
            <motion.p
              className="text-lg whitespace-nowrap"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.035, delayChildren: 0.8 } } }}
            >
              <span className="text-gray-500">
                {`...${result.context.before}`.split('').map((ch, i) => (
                  <motion.span
                    key={`b${i}`}
                    variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                    className="inline-block"
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
              <span className="match-pulse text-pi-red-400 font-bold bg-pi-red-900/30 px-1 rounded mx-1 inline-block">
                {result.context.match.split('').map((ch, i) => (
                  <motion.span
                    key={`m${i}`}
                    variants={{
                      hidden: { opacity: 0, rotateY: 90, scale: 1.6 },
                      visible: { opacity: 1, rotateY: 0, scale: 1 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="inline-block"
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
              <span className="text-gray-500">
                {`${result.context.after}...`.split('').map((ch, i) => (
                  <motion.span
                    key={`a${i}`}
                    variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                    className="inline-block"
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            </motion.p>
          </motion.div>

          {/* Language Selector for the certificate */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Globe className="w-4 h-4 text-gray-400" />
            <div className="flex bg-white/5 rounded-lg p-1">
              {(['tr', 'en', 'de'] as CertificateLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === lang
                      ? 'bg-pi-red-900/50 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-3 gap-3"
          >
            <motion.button
              onClick={() => onDownload(language)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-shimmer flex items-center justify-center gap-2 py-3 px-3
                         bg-gradient-to-r from-pi-red-700 to-pi-red-900
                         text-white rounded-xl hover:from-pi-red-600 hover:to-pi-red-800
                         transition-colors font-medium shadow-lg shadow-pi-red-900/30 text-sm"
            >
              <Download className="w-5 h-5" />
              İndir
            </motion.button>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 py-3 px-3
                         bg-white/10 text-white rounded-xl
                         hover:bg-white/20 transition-colors font-medium text-sm"
            >
              <Share2 className="w-5 h-5" />
              Paylaş
            </motion.button>
            <motion.button
              onClick={handleEmailShare}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 py-3 px-3
                         bg-white/10 text-white rounded-xl
                         hover:bg-white/20 transition-colors font-medium text-sm"
            >
              <Mail className="w-5 h-5" />
              E-posta
            </motion.button>
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

        {/* Email Reminder Modal */}
        <AnimatePresence>
          {showEmailModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEmailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-pi-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pi-red-900/30 flex items-center justify-center">
                    <Paperclip className="w-8 h-8 text-pi-red-500" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    PDF İndirildi!
                  </h3>

                  <p className="text-gray-400 mb-4">
                    E-posta uygulamanız açılacak. Lütfen indirilen{' '}
                    <span className="text-pi-red-400 font-medium">{CERT_TEXTS[language].filename}</span>{' '}
                    dosyasını e-postanıza ek olarak ekleyin.
                  </p>

                  <div className="bg-black/50 rounded-lg p-3 mb-4">
                    <p className="text-gray-500 text-xs mb-1">Dosya adı:</p>
                    <p className="text-white font-mono text-sm">📄 {CERT_TEXTS[language].filename}</p>
                  </div>

                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="w-full py-3 bg-gradient-to-r from-pi-red-700 to-pi-red-900
                               text-white rounded-xl hover:from-pi-red-600 hover:to-pi-red-800
                               transition-all font-medium"
                  >
                    Anladım
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
