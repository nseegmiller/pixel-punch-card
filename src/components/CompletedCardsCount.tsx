import { Icon } from './ui';

interface CompletedCardsCountProps {
  count: number;
}

const CompletedCardsCount = ({ count }: CompletedCardsCountProps) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon name="checkCircle" className="w-5 h-5 text-punch-success" />
      <span>
        {count} {count === 1 ? 'card' : 'cards'} completed
      </span>
    </div>
  );
};

export default CompletedCardsCount;
