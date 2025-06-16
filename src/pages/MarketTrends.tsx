import React, { useEffect, useRef } from 'react';

const MarketTrends: React.FC = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "light",
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": false,
      "showSymbolLogo": false,
      "showFloatingTooltip": true,
      "width": "400",
      "height": "550",
      "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
      "plotLineColorFalling": "rgba(41, 98, 255, 1)",
      "gridLineColor": "rgba(240, 243, 250, 0)",
      "scaleFontColor": "rgba(15, 15, 15, 1)",
      "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
      "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
      "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
      "tabs": [
        {
          "title": "Indices",
          "symbols": [
            {
              "s": "FOREXCOM:SPXUSD",
              "d": "S&P 500 Index"
            },
            {
              "s": "FOREXCOM:NSXUSD",
              "d": "US 100 Cash CFD"
            },
            {
              "s": "FOREXCOM:DJI",
              "d": "Dow Jones Industrial Average Index"
            },
            {
              "s": "INDEX:NKY",
              "d": "Japan 225"
            },
            {
              "s": "INDEX:DEU40",
              "d": "DAX Index"
            },
            {
              "s": "FOREXCOM:UKXGBP",
              "d": "FTSE 100 Index"
            }
          ],
          "originalTitle": "Indices"
        },
        {
          "title": "Forex",
          "symbols": [
            {
              "s": "FX:EURUSD",
              "d": "EUR to USD"
            },
            {
              "s": "FX:GBPUSD",
              "d": "GBP to USD"
            },
            {
              "s": "FX:USDJPY",
              "d": "USD to JPY"
            },
            {
              "s": "FX:USDCHF",
              "d": "USD to CHF"
            },
            {
              "s": "FX:AUDUSD",
              "d": "AUD to USD"
            },
            {
              "s": "FX:USDCAD",
              "d": "USD to CAD"
            }
          ],
          "originalTitle": "Forex"
        },
        {
          "title": "Futures",
          "symbols": [
            {
              "s": "BMFBOVESPA:ISP1!",
              "d": "S&P 500 Index Futures"
            },
            {
              "s": "BMFBOVESPA:EUR1!",
              "d": "Euro Futures"
            },
            {
              "s": "PYTH:WTI3!",
              "d": "WTI CRUDE OIL"
            },
            {
              "s": "BMFBOVESPA:ETH1!",
              "d": "Hydrous ethanol"
            },
            {
              "s": "BMFBOVESPA:CCM1!",
              "d": "Corn"
            }
          ],
          "originalTitle": "Futures"
        },
        {
          "title": "Bonds",
          "symbols": [
            {
              "s": "EUREX:FGBL1!",
              "d": "Euro Bund"
            },
            {
              "s": "EUREX:FBTP1!",
              "d": "Euro BTP"
            },
            {
              "s": "EUREX:FGBM1!",
              "d": "Euro BOBL"
            }
          ],
          "originalTitle": "Bonds"
        }
      ]
    });

    if (widgetRef.current) {
      const widgetContainer = widgetRef.current.querySelector('.tradingview-widget-container__widget');
      if (widgetContainer) {
        widgetContainer.appendChild(script);
      }
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={widgetRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener nofollow" 
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default MarketTrends;
