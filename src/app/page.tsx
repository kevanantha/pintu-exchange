"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERVALS } from "@/constants";
import { Interval } from "@/types";
import { Trade } from "./trade";
import { CandlestickChart } from "./candlestick-chart";
import { cn } from "@/lib/utils";
import { OrderBook } from "./order-book";

export default function Home() {
  const [interval, setInterval] = useState<Interval>("1s");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-44 py-20">
      <div className="w-full flex gap-6">
        <Card className="w-[250px]">
          <CardHeader>
            <CardTitle>Order Book</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderBook />
          </CardContent>
        </Card>
        <Card className="self-baseline flex-1">
          <CardHeader>
            <CardTitle>
              <Trade />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex gap-2 mb-4">
                {INTERVALS.map((itv) => (
                  <button
                    className={cn(
                      "border border-primary text-primary bg-transparent text-xs py-1 px-2 rounded",
                      itv === interval && "bg-primary text-white"
                    )}
                    key={itv}
                    onClick={() => {
                      setInterval(itv);
                    }}
                  >
                    {itv}
                  </button>
                ))}
              </div>
              <CandlestickChart interval={interval} />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
