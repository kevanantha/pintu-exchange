import useWebSocket from "react-use-websocket";

import { binanceVisionInstance } from "@/fetcher";
import {
  OrderBookRespond,
  OrderBookResponse,
  OrderBookWsResponse,
} from "@/types";

import { useEffect, useRef, useState } from "react";

const socketUrl = process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL as string;

export function useWsOrderBookWs() {
  const [orderBook, setOrderBook] = useState<OrderBookRespond>();
  const [lastUpdatedId, setLastUpdatedId] = useState<number>(0);
  const messageQueue = useRef<OrderBookWsResponse[]>([]);
  const isSnapshotLoaded = useRef(false);
  const { lastJsonMessage } = useWebSocket<OrderBookWsResponse>(
    `${socketUrl}/btcusdt@depth`,
    {
      shouldReconnect: (closeEvent) => true,
    }
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data } = await binanceVisionInstance.get<OrderBookResponse>(
          `/depth`,
          {
            params: {
              symbol: "BTCUSDT",
              limit: 1000,
            },
          }
        );
        setOrderBook({
          bids: data.bids,
          asks: data.asks,
        });
        setLastUpdatedId(data.lastUpdateId);
        isSnapshotLoaded.current = true;
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  /**
   * Process the message queue
   * This function will process the message queue and update the order book
   * based on the messages received.
   *
   * The logic is based on the following Binance documentation:
   * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#how-to-manage-a-local-order-book-correctly
   */
  function processMessageQueue() {
    if (!isSnapshotLoaded.current || !lastUpdatedId) return;

    while (messageQueue.current.length > 0) {
      const message = messageQueue.current.shift();
      if (!message) return;

      if (message.u <= lastUpdatedId) {
        continue;
      }

      if (message.U <= lastUpdatedId + 1 && message.u >= lastUpdatedId + 1) {
        setLastUpdatedId(message.u);

        setOrderBook((prevOrderBook) => {
          if (!prevOrderBook) return { bids: [], asks: [] };

          const newBids = [...prevOrderBook.bids];
          const newAsks = [...prevOrderBook.asks];

          message.b.forEach(([price, qty]: [string, string]) => {
            const index = newBids.findIndex((bid) => bid[0] === price);
            if (qty === "0.00000000") {
              if (index !== -1) newBids.splice(index, 1);
            } else {
              if (index !== -1) {
                newBids[index] = [price, qty];
              } else {
                newBids.push([price, qty]);
              }
            }
          });

          message.a.forEach(([price, qty]: [string, string]) => {
            const index = newAsks.findIndex((ask) => ask[0] === price);
            if (qty === "0.00000000") {
              if (index !== -1) newAsks.splice(index, 1);
            } else {
              if (index !== -1) {
                newAsks[index] = [price, qty];
              } else {
                newAsks.push([price, qty]);
              }
            }
          });

          return {
            bids: newBids
              .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
              .slice(0, 20),
            asks: newAsks
              .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
              .slice(0, 20),
          };
        });
      } else {
        console.error("Out of order update or missing messages in between");
      }
    }
  }

  useEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.e === "depthUpdate") {
        messageQueue.current.push(lastJsonMessage);
        processMessageQueue();
      }
    }
  }, [lastJsonMessage]);

  return { data: orderBook };
}
