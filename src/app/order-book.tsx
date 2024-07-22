import { useWsOrderBookWs } from "@/hooks/ws/use-order-book-ws";

export function OrderBook() {
  const { data } = useWsOrderBookWs();

  if (!data) return <div>Loading...</div>;

  return (
    <div className="min-w-full md:min-w-[250px] md:flex-col flex gap-6 md:gap-2">
      <div className="max-md:w-full">
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
      <div className="max-md:w-full">
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
