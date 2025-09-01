import React from 'react';

interface CopyTradingProps {
  strategyId: string;
}

const CopyTradingComponent: React.FC<CopyTradingProps> = ({ strategyId }) => {
  return (
    <div className="text-xs text-muted-foreground">
      Strategy ID: {strategyId}
    </div>
  );
};

export default CopyTradingComponent;
