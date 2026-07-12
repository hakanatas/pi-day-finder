import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePiDigits } from './hooks/usePiDigits';
import { searchAllFormats } from './utils/piSearch';
import { generateCertificate, downloadCertificate, type CertificateLanguage, CERT_TEXTS } from './utils/pdfGenerator';
import { PiBackground } from './components/PiBackground';
import { DateInputForm } from './components/DateInputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { DigitScanner } from './components/DigitScanner';
import type { SearchResult, AppStage } from './types';

// Shared cinematic stage transition: blur in / blur out
const stageVariants = {
  initial: { opacity: 0, scale: 0.96, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
};
const stageTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

function App() {
  const piDigits = usePiDigits();
  const [appState, setAppState] = useState<AppStage>({ stage: 'loading' });
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);

  // Update app state when pi digits finish loading
  if (piDigits.isLoading && appState.stage !== 'loading') {
    setAppState({ stage: 'loading' });
  } else if (!piDigits.isLoading && !piDigits.error && appState.stage === 'loading') {
    setAppState({ stage: 'input' });
  }

  const handleSearch = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      setAppState({ stage: 'searching', date });

      // Let the digit-scanner animation play before revealing the result
      setTimeout(() => {
        const result = searchAllFormats(piDigits.digits, date);

        if (result) {
          setCurrentResult(result);
          setAppState({ stage: 'result', date, result });
        } else {
          setAppState({ stage: 'notFound', date });
        }
      }, 2300);
    },
    [piDigits.digits]
  );

  const handleDownload = useCallback(async (language: CertificateLanguage) => {
    if (!currentDate || !currentResult) return;

    try {
      const blob = await generateCertificate({
        date: currentDate,
        result: currentResult,
        language,
      });
      downloadCertificate(blob, CERT_TEXTS[language].filename);
    } catch (error) {
      console.error('Sertifika olusturulamadi:', error);
      alert('Sertifika olusturulurken bir hata olustu.');
    }
  }, [currentDate, currentResult]);

  const handleSearchAgain = useCallback(() => {
    setCurrentDate(null);
    setCurrentResult(null);
    setAppState({ stage: 'input' });
  }, []);

  const loadingProgress = piDigits.total > 0 ? (piDigits.loaded / piDigits.total) * 100 : 0;

  return (
    <div className="min-h-screen w-full relative">
      {/* Background */}
      <PiBackground digits={piDigits.digits} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {appState.stage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="relative inline-block mb-8">
                {/* orbiting digits */}
                <motion.div
                  className="absolute inset-[-28px]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                >
                  {['3', '1', '4'].map((d, i) => (
                    <span
                      key={d + i}
                      className="absolute text-pi-red-400/80 font-mono text-xl"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 120}deg) translateY(-4.6rem)`,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </motion.div>
                <motion.div
                  className="text-8xl"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-pi-red-500 font-serif pi-glow">π</span>
                </motion.div>
              </div>
              <h2 className="text-2xl text-white mb-4 font-serif">Pi Yukleniyor...</h2>
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pi-red-700 to-pi-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-gray-500 mt-2 text-sm font-mono">
                {Math.round(loadingProgress)}% ({piDigits.loaded.toLocaleString()} basamak)
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {piDigits.error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-red-900/50"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl text-white mb-2">Hata Olustu</h2>
              <p className="text-gray-400 mb-4">{piDigits.error.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-pi-red-700 text-white rounded-lg hover:bg-pi-red-600 transition-colors"
              >
                Tekrar Dene
              </button>
            </motion.div>
          )}

          {/* Input State */}
          {appState.stage === 'input' && (
            <motion.div
              key="input"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stageTransition}
            >
              <DateInputForm onSearch={handleSearch} isSearching={false} />
            </motion.div>
          )}

          {/* Searching State */}
          {appState.stage === 'searching' && (
            <motion.div
              key="searching"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stageTransition}
              className="w-full"
            >
              <DigitScanner digits={piDigits.digits} />
            </motion.div>
          )}

          {/* Result State */}
          {appState.stage === 'result' && currentResult && currentDate && (
            <motion.div
              key="result"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stageTransition}
            >
              <ResultsDisplay
                result={currentResult}
                date={currentDate}
                onDownload={handleDownload}
                onSearchAgain={handleSearchAgain}
              />
            </motion.div>
          )}

          {/* Not Found State */}
          {appState.stage === 'notFound' && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-pi-red-900/50"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl text-white mb-2">Bulunamadi</h2>
              <p className="text-gray-400 mb-4">
                Tarihin ilk 10 milyon basamakta bulunamadi. Bu cok nadir bir durum!
              </p>
              <button
                onClick={handleSearchAgain}
                className="px-6 py-2 bg-pi-red-700 text-white rounded-lg hover:bg-pi-red-600 transition-colors"
              >
                Baska Tarih Dene
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 text-center text-sm"
        >
          <p className="text-gray-600 mb-2">
            π sayisinin ilk 10.000.000 basamaginda arama yapilmaktadir
          </p>
          <p className="text-gray-400">
            Bu etkinlik sayfasi{' '}
            <a
              href="https://www.thebluealliance.com/team/6459"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pi-red-500 hover:text-pi-red-400 font-medium transition-colors"
            >
              FTC #24230 AG Robotik Takimi
            </a>
            {' '}destegiyle olusturulmustur
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
