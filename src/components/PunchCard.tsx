import { useState, useCallback, useEffect, useRef } from 'react';
import { History } from '@/types';
import { PUNCHES_PER_CARD, CELEBRATION_DURATION_MS } from '@/utils/constants';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useHabitsContext } from '@/context/HabitsContext';
import PunchSlot from './PunchSlot';
import CompletionCelebration from './CompletionCelebration';
import CustomPunchModal from './CustomPunchModal';
import blueCard from '@/assets/blue-card.png';

interface PunchCardProps {
  cardId: string;
  punches: History[];
  habitId: string;
  habitName: string;
}

// Native image dimensions
const CARD_W = 128;
const CARD_H = 64;

// Circle centers in native image pixels (derived from pixel analysis)
const CIRCLE_X = [15.5, 39.5, 63.5, 87.5, 111.5]; // 5 columns
const CIRCLE_Y = [30.5, 48.5];                       // 2 rows

// Punch image native size
const PUNCH_SIZE = 14; // punch.png is 14×14

// Top-strip text area in native pixels (rows 0–18, before perforated line at row 19)
const TEXT_AREA_TOP    = 3;
const TEXT_AREA_HEIGHT = 16;
const TEXT_AREA_PAD_X  = 10;

const PunchCard = ({ cardId, punches, habitId: _habitId, habitName }: PunchCardProps) => {
  const { punch, unpunch } = useHabitsContext();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCustomPunchModal, setShowCustomPunchModal] = useState(false);
  const [scale, setScale] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Integer-scale the card to fit its container — eliminates sub-pixel artifacts
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const s = Math.max(1, Math.floor(width / CARD_W));
      setScale(s);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePunch = useCallback(async () => {
    const result = await punch(cardId);
    if (result.completed) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), CELEBRATION_DURATION_MS);
    }
  }, [punch, cardId]);

  const { execute: executePunch, loading: punchLoading } = useAsyncAction(handlePunch);

  const handleSlotClick = async (index: number) => {
    const punchAtSlot = punches[index];
    if (punchAtSlot) {
      try { await unpunch(punchAtSlot.id); }
      catch (err) { console.error('Error unpunching:', err); }
    } else {
      try { await executePunch(); }
      catch (err) { console.error('Error punching:', err); }
    }
  };

  const handleRightClick = () => {
    if (punches.length < PUNCHES_PER_CARD) setShowCustomPunchModal(true);
  };

  const slots = Array.from({ length: PUNCHES_PER_CARD }, (_, i) => punches[i] || null);

  const cardW   = CARD_W * scale;
  const cardH   = CARD_H * scale;
  const slotPx  = PUNCH_SIZE * scale; // slot side length in CSS pixels

  return (
    <>
      {/* Outer div fills the column; we measure its width to pick the integer scale */}
      <div ref={containerRef} className="w-full">
        <div className="relative mx-auto" style={{ width: cardW, height: cardH }}>
          {/* Pixel-art card at exact integer scale */}
          <img
            src={blueCard}
            alt=""
            draggable={false}
            className="pixelated absolute inset-0 select-none"
            style={{ width: cardW, height: cardH }}
          />

          {/* Habit name centered in the top strip (native rows 3–19) */}
          <div
            className="absolute flex items-center justify-center overflow-hidden pointer-events-none"
            style={{
              top:           TEXT_AREA_TOP    * scale,
              left:          TEXT_AREA_PAD_X  * scale,
              right:         TEXT_AREA_PAD_X  * scale,
              height:        TEXT_AREA_HEIGHT * scale,
            }}
          >
            <span
              className="truncate w-full text-center leading-none"
              style={{
                fontFamily: 'FSPixelSans, monospace',
                // 58px is the user-confirmed good size at scale=4; scale proportionally
                fontSize:   Math.round(14.5 * scale) + 'px',
                color:      '#f8e6d0',
                lineHeight: 1,
              }}
            >
              {habitName}
            </span>
          </div>

          {/* Punch slots — exact integer pixel positions, no translate needed */}
          {slots.map((punchData, index) => {
            const col = index % 5;
            const row = Math.floor(index / 5);
            const left = Math.round(CIRCLE_X[col] * scale - slotPx / 2);
            const top  = Math.round(CIRCLE_Y[row] * scale - slotPx / 2);
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width:  slotPx,
                  height: slotPx,
                }}
              >
                <PunchSlot
                  punch={punchData}
                  onClick={() => handleSlotClick(index)}
                  onRightClick={handleRightClick}
                  disabled={punchLoading || (punchData === null && punches.length !== index)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {showCelebration && <CompletionCelebration />}

      {showCustomPunchModal && (
        <CustomPunchModal
          cardId={cardId}
          habitName={habitName}
          onClose={() => setShowCustomPunchModal(false)}
        />
      )}
    </>
  );
};

export default PunchCard;
