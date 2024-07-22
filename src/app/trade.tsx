import { TradeStream } from "@/types";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const sockerUrl = `${
  process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL as string
}/btcusdt@aggTrade`;

export function Trade() {
  const { data, className } = useWsTrade();

  return (
    <div>
      <span>BTC/USDT</span>{" "}
      {data?.p ? (
        <span className={`tabular-nums ${className}`}>
          {formatCurrency(parseFloat(data.p))}
        </span>
      ) : null}
    </div>
  );
}

function useWsTrade() {
  const tradeRef = useRef<TradeStream>();
  const classRef = useRef<string>();

  const { lastJsonMessage } = useWebSocket<TradeStream>(sockerUrl, {
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (!lastJsonMessage) return;

    tradeRef.current = lastJsonMessage;
    classRef.current = lastJsonMessage.m ? "text-red-500" : "text-green-500";
  }, [lastJsonMessage]);

  return {
    data: tradeRef.current,
    className: classRef.current,
  };
}
