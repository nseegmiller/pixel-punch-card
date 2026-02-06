import { Icon } from './ui';

interface CompletedCardsCountProps {
  count: number;
}

const CompletedCardsCount = ({ count }: CompletedCardsCountProps) => {
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-400 ${count === 0 ? 'invisible' : ''}`}>
      <Icon name="checkCircle" className="w-5 h-5 text-punch-success" />
      <span>
        {count} {count === 1 ? 'card' : 'cards'} completed
      </span>
    </div>
  );
};

export default CompletedCardsCount;
