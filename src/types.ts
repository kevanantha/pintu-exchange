/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#uiklines
 * KLineData is an array of 11 elements.
 */
export type KLineData = [
  number, // Kline open time
  string, // Open price
  string, // High price
  string, // Low price
  string, // Close price
  string, // Volume
  number, // Kline close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string // Unused field. Ignore.
];

/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#kline-intervals
 * KLineData is the data structure of the response from the Binance API.
 */
export type Interval =
  | "1s"
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

/**
 * For the full list of symbols, @see https://data-api.binance.vision/api/v3/exchangeInfo
 */
export type SymbolCoin =
  | "BTCUSDT"
  | "ETHUSDT"
  | "BNBUSDT"
  | "ADAUSDT"
  | "XRPUSDT"
  | "ETHBTC";

export type KlinesRespond = {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#klinecandlestick-streams-for-utc
 */
export type KlinesWsResponse = {
  e: string; // Event type
  E: number; // Event time
  s: SymbolCoin; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: SymbolCoin; // Symbol
    i: Interval; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
};

/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#trade-streams
 * TradeStream is the data structure of the response from the Binance API.
 */
export type TradeStream = {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
};

/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
 */
export type PartialOrderBookWsResponse = {
  lastUpdateId: number; // Last update ID
  bids: Array<
    // Bids to be updated
    [
      string, // Price level to be updated
      string // Quantity
    ]
  >;
  asks: Array<
    // Asks to be updated
    [
      string, // Price level to be updated
      string // Quantity
    ]
  >;
};

/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#order-book
 */
export type OrderBookResponse = {
  lastUpdateId: number;
  bids: Array<[string, string]>;
  asks: Array<[string, string]>;
};

export type OrderBookRespond = {
  bids: Array<[string, string]>;
  asks: Array<[string, string]>;
};

/**
 * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
 */
export type OrderBookWsResponse = {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID in event
  u: number; // Final update ID in event
  b: Array<
    // Bids to be updated
    [
      string, // Price level to be updated
      string // Quantity
    ]
  >;
  a: Array<
    // Asks to be updated
    [
      string, // Price level to be updated
      string // Quantity
    ]
  >;
};
