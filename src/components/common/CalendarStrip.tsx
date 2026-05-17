import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function CalendarStrip({ selectedDate, onDateSelect }: CalendarStripProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(selectedDate, { weekStartsOn: 1 }));
  const [direction, setDirection] = useState(0);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setDirection(-1);
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setDirection(1);
    setWeekStart(addDays(weekStart, 7));
  };

  return (
    <div className="hidden sm:block relative py-2 transition-all duration-500">
      {/* Header with Centered Month/Year and Side Navigation */}
      <div className="flex items-center justify-between mb-2 px-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>

        <h3 className="text-xl font-bold text-white tracking-wide">
          {format(weekStart, 'MMMM yyyy')}
        </h3>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-all active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Days Strip */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={weekStart.toISOString()}
            custom={direction}
            initial={{ x: direction * 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex justify-between gap-2 px-2"
          >
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateSelect(day)}
                  className={`relative flex flex-col items-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300 ${isSelected
                      ? 'bg-white text-primary shadow-lg scale-105 z-10'
                      : 'text-white/80 hover:bg-white/10'
                    }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-primary/70' : 'text-white/60'
                    }`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className="text-xl font-black tabular-nums">
                    {format(day, 'd')}
                  </span>

                  {isSelected && (
                    <motion.div
                      layoutId="activeDayHighlight"
                      className="absolute inset-0 rounded-2xl ring-2 ring-white/20"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
