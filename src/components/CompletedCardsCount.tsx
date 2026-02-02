interface CompletedCardsCountProps {
  count: number;
}

const CompletedCardsCount = ({ count }: CompletedCardsCountProps) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <svg
        className="w-5 h-5 text-punch-success"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {count} {count === 1 ? 'card' : 'cards'} completed
      </span>
    </div>
  );
};

export default CompletedCardsCount;
