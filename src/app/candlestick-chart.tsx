import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import useWebSocket from "react-use-websocket";
import axios from "axios";
import { Interval, KLineData } from "@/types";

const formatNumber = (value: number) => value.toFixed(2);

const socketUrl = process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL as string;

export function CandlestickChart({ interval }: { interval: Interval }) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [previousInterval, setPreviousInterval] = React.useState(interval);
  const [isLoading, setIsLoading] = useState(true);
  const [ohlc, setOhlc] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
  });

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true,
    onOpen: () => {
      sendMessage(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: ["btcusdt@kline_1s"],
          id: 1,
        })
      );
    },
  });

  // Function to fetch initial candlestick data
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Array<KLineData>>(
        `${process.env.NEXT_PUBLIC_BINANCE_VISION_BASE_URL}/api/v3/uiKlines`,
        {
          params: {
            symbol: "BTCUSDT",
            interval,
            limit: 1000,
          },
        }
      );

      const candlestickData = response.data.map((d) => ({
        time: (d[0] / 1000) as UTCTimestamp, // Convert milliseconds to seconds
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(candlestickData);
      }
      // chartRef.current?.timeScale().fitContent();
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [interval]);

  useEffect(() => {
    const chartEl = chartContainerRef.current;

    if (!chartEl) return;

    chartRef.current = createChart(chartEl, {
      width: chartEl.clientWidth,
      height: 400,
    });
    chartRef.current.applyOptions({
      watermark: {
        visible: true,
        fontSize: 60,
        horzAlign: "center",
        vertAlign: "center",
        color: "#F1F1F2",
        text: "Pintu Exchange",
      },
    });
    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: "#22c55e",
      borderUpColor: "#22c55e",
      wickUpColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      wickDownColor: "#ef4444",
    });

    fetchInitialData();

    chartRef.current.subscribeCrosshairMove(function (param) {
      if (!param || !param.time) return;
      const candlestick = candlestickSeriesRef.current
        ? param.seriesData.get(candlestickSeriesRef.current)
        : null;
      if (candlestick) {
        setOhlc({
          // @ts-expect-error
          open: candlestick.open,
          // @ts-expect-error
          high: candlestick.high,
          // @ts-expect-error
          low: candlestick.low,
          // @ts-expect-error
          close: candlestick.close,
        });
      }
    });

    return () => {
      chartRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (lastMessage !== null && !isLoading) {
      const messageData = JSON.parse(lastMessage.data);

      if (messageData.k) {
        const candlestickData = {
          time: (messageData.k.t / 1000) as UTCTimestamp, // Convert milliseconds to seconds
          open: parseFloat(messageData.k.o),
          high: parseFloat(messageData.k.h),
          low: parseFloat(messageData.k.l),
          close: parseFloat(messageData.k.c),
        };
        if (
          candlestickSeriesRef.current &&
          candlestickData.time &&
          !isLoading
        ) {
          candlestickSeriesRef.current.update(candlestickData);
          setOhlc({
            open: candlestickData.open,
            high: candlestickData.high,
            low: candlestickData.low,
            close: candlestickData.close,
          });
        }
      }
    }
  }, [isLoading, lastMessage]);

  useEffect(() => {
    if (interval !== previousInterval) {
      sendMessage(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`btcusdt@kline_${interval}`],
          id: 1,
        })
      );
      sendMessage(
        JSON.stringify({
          method: "UNSUBSCRIBE",
          params: [`btcusdt@kline_${previousInterval}`],
          id: 1,
        })
      );
      setPreviousInterval(interval);
    }

    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData([]); // Clear previous data
    }
    fetchInitialData();
  }, [fetchInitialData, interval, previousInterval, sendMessage]);

  return (
    <>
      <div className="tabular-nums flex gap-1.5 text-sm text-gray-600">
        <span>Open:</span>
        <span
          className={ohlc.close > ohlc.open ? "text-green-500" : "text-red-500"}
        >
          {formatNumber(ohlc.open)}
        </span>
        <span>High: </span>
        <span
          className={ohlc.close > ohlc.high ? "text-green-500" : "text-red-500"}
        >
          {formatNumber(ohlc.high)}
        </span>
        <span>Low:</span>
        <span
          className={ohlc.close > ohlc.low ? "text-green-500" : "text-red-500"}
        >
          {formatNumber(ohlc.low)}
        </span>
        <span>Close:</span>
        <span
          className={ohlc.close > ohlc.open ? "text-green-500" : "text-red-500"}
        >
          {formatNumber(ohlc.close)}
        </span>
      </div>
      <div ref={chartContainerRef}></div>
    </>
  );
}
