import axios from "axios";

export const binanceVisionInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BINANCE_VISION_BASE_URL + "/api/v3",
  headers: {
    "Content-Type": "application/json",
  },
});
