import { Icon } from './ui';

interface CompletedCardsCountProps {
  count: number;
}

const CompletedCardsCount = ({ count }: CompletedCardsCountProps) => {
  return (
    <div className={`flex items-center gap-2 text-sm text-ui-secondary ${count === 0 ? 'invisible' : ''}`}>
      <Icon name="checkCircle" className="w-6 h-6 text-punch-success" />
      <span>
        {count} {count === 1 ? 'card' : 'cards'} completed
      </span>
    </div>
  );
};

export default CompletedCardsCount;
