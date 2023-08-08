import dotenv from "dotenv";
dotenv.config();

// REQUIRED env vars
if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
  throw new Error("Binance keys are required.");
}

export const environment = {
  BINANCE_API_KEY: process.env.BINANCE_API_KEY,
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET,
  PORT: process.env.PORT || 3000,
};
