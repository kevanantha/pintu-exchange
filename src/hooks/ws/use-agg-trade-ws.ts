import useWebSocket from "react-use-websocket";

import { TradeStream } from "@/types";
import { useEffect, useRef } from "react";

const sockerUrl = `${
  process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL as string
}/btcusdt@aggTrade`;

export function useTradeWs() {
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
