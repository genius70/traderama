
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TradingChartProps {
  symbol: string;
}

const TradingChart = ({ symbol }: TradingChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TradingView widget integration
    if (chartRef.current) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol || 'SPY',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tradingview_chart'
      });
      
      chartRef.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle>Market Chart - {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={chartRef}
          id="tradingview_chart"
          className="w-full h-[550px]"
        />
      </CardContent>
    </Card>
  );
};

export default TradingChart;
