import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface DateInputFormProps {
  onSearch: (date: Date) => void;
  isSearching: boolean;
}

export function DateInputForm({ onSearch, isSearching }: DateInputFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      onSearch(new Date(selectedDate));
    }
  };

  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
    >
      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-pi-red-900/30 shadow-2xl">
        {/* Title */}
        <motion.div variants={item} className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{
              y: [0, -8, 0],
              textShadow: [
                '0 0 18px rgba(239,68,68,0.35)',
                '0 0 42px rgba(239,68,68,0.85)',
                '0 0 18px rgba(239,68,68,0.35)',
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-pi-red-500 font-serif">π</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 font-serif">
            Pi Gununu Bul
          </h1>
          <p className="text-gray-400 text-sm">
            Dogum tarihinin pi sayisinin hangi basamaginda oldugunu kesfet
          </p>
        </motion.div>

        {/* Date Picker */}
        <motion.div variants={item} className="mb-6">
          <label className="block text-gray-300 text-sm mb-2 font-medium">
            Dogum Tarihin
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-4 bg-black/50 border border-pi-red-900/50 rounded-xl
                         text-white text-lg focus:outline-none focus:border-pi-red-500
                         focus:ring-2 focus:ring-pi-red-500/20 transition-all
                         [&::-webkit-calendar-picker-indicator]:filter
                         [&::-webkit-calendar-picker-indicator]:invert"
              required
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-pi-red-500 w-5 h-5 pointer-events-none" />
          </div>
        </motion.div>

        {/* Info Text */}
        <motion.div variants={item} className="mb-6 p-3 bg-pi-red-950/30 rounded-lg border border-pi-red-900/20">
          <p className="text-gray-400 text-xs">
            Tarihin GGAAYY formatinda (ornek: 01/01/1980 = 010180)
            pi sayisinin ilk 10.000.000 basamaginda aranacaktir.
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!selectedDate || isSearching}
          variants={item}
          className="btn-shimmer w-full py-4 bg-gradient-to-r from-pi-red-700 to-pi-red-900
                     text-white font-bold rounded-xl text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-pi-red-600 hover:to-pi-red-800
                     focus:outline-none focus:ring-2 focus:ring-pi-red-500/50
                     transition-colors shadow-lg shadow-pi-red-900/30"
          whileHover={{ scale: isSearching ? 1 : 1.03, y: isSearching ? 0 : -2 }}
          whileTap={{ scale: isSearching ? 1 : 0.97 }}
        >
          {isSearching ? (
            <span className="flex items-center justify-center gap-3">
              <LoadingSpinner size="sm" />
              Pi'de araniyor...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Pi Gunumu Bul
            </span>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
