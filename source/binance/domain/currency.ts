import { MarkPriceResult } from "binance-api-node";
import { Maybe } from "../../lib/maybe";
import { Result } from "../../lib/results";
import { BinanceClient } from "../api/client";
import { PositionSide } from "../constants";
import { OpenOrder, Order } from "./orders";
import { Position } from "./positions";
import { SymbolInfo } from "./symbol-info";

export interface Currency {
  symbol: string;
  positions: Position[];
  openOrders: (Order & OpenOrder)[];
  symbolInfo: SymbolInfo;
}

// Utils

export function getMarkPrice(symbol: string) {
  return async (client: BinanceClient): Promise<Result<number>> => {
    const prices = (await client.futuresMarkPrice()) as MarkPriceResult[];
    const symbolPrices = prices.find((p) => p.symbol === symbol);
    if (!symbolPrices) return new Error(`Expected mark price for ${symbol}`);
    return parseFloat(symbolPrices.markPrice);
  };
}

export function isHedging(currency: Currency): boolean {
  return currency.positions.length > 1;
}

export function hasNoPositions(currency: Currency): boolean {
  return currency.positions.length === 0;
}

export function getPosition(
  currency: Currency,
  side: PositionSide
): Maybe<Position> {
  const position = currency.positions.find((p) => p.side === side);
  return position ?? null;
}

export function getPositionsDelta(main: Position, hedge: Position) {
  return main.amount - hedge.amount;
}