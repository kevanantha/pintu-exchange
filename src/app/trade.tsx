import { useTradeWs } from "@/hooks/ws/use-agg-trade-ws";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function Trade() {
  const { data, className } = useTradeWs();

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
