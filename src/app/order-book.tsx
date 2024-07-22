import {
  OrderBookRespond,
  OrderBookResponse,
  OrderBookWsResponse,
  PartialOrderBookWsResponse,
} from "@/types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

const socketUrl = process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL as string;

export function OrderBook() {
  const { data } = useWsOrderBook();

  if (!data) return <div>Loading...</div>;

  return (
    <div className="min-w-1/2 flex-col flex gap-2">
      <div>
        <div className="flex justify-between items-center mb-2 text-gray-600">
          <h3 className="flex-1">Price</h3>
          <h3 className="flex-1 text-right">Amount</h3>
        </div>
        <div className="flex flex-col">
          {data.bids.map(([price, quantity], index) => (
            <div key={index} className="tabular-nums text-red-500 text-sm flex">
              <div className="flex-1">{parseFloat(price).toFixed(2)}</div>
              <div className="flex-1 text-right">
                {parseFloat(quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2 text-gray-600">
          <h3 className="flex-1">Price</h3>
          <h3 className="flex-1 text-right">Amount</h3>
        </div>
        <div className="flex flex-col">
          {data.asks.map(([price, quantity], index) => (
            <div
              key={index}
              className="tabular-nums text-green-500 text-sm flex"
            >
              <div className="flex-1">{parseFloat(price).toFixed(2)}</div>
              <div className="flex-1 text-right">
                {parseFloat(quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function useWsOrderBook() {
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
        const { data } = await axios.get<OrderBookResponse>(
          `${process.env.NEXT_PUBLIC_BINANCE_VISION_BASE_URL}/api/v3/depth`,
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
