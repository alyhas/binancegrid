import createDebug from "debug";
import { isError, Result } from "../../lib/results";
import { BinanceClient } from "../api/client";
import { BinanceExchangeInfo } from "../api/exchange-info";
import { getMarkPrice } from "./currency";

const debug = createDebug("bot:binance:domain:symbol-info");

export interface SymbolInfo {
  markPrice: number;
  minOrderQuantity: number;
  quantityPrecision: number;
  pricePrecision: number;
  tickSize: number;
}

export function getSymbolInfo(symbol: string) {
  return async (client: BinanceClient): Promise<Result<SymbolInfo>> => {
    const exchangeInfo = ((await client.futuresExchangeInfo()) as unknown) as BinanceExchangeInfo;
    const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === symbol);
    if (!symbolInfo) return new Error(`Expected symbol info for ${symbol}`);
    debug(symbolInfo);
    const marketLotSizeFilter = symbolInfo.filters.find(
      (f) => f.filterType === "MARKET_LOT_SIZE"
    );
    if (!marketLotSizeFilter || marketLotSizeFilter.filterType !== "MARKET_LOT_SIZE") {
      return new Error(`Expected to find market lot filter for ${symbol}`);
    }
    const tickSizeFilter = symbolInfo.filters.find(
      (f) => f.filterType === "PRICE_FILTER"
    );
    if (!tickSizeFilter || tickSizeFilter.filterType !== "PRICE_FILTER") {
      return new Error(`Expected to find PRICE_FILTER for ${symbol}`);
    }
    debug(marketLotSizeFilter);
    const markPriceResult = await getMarkPrice(symbol)(client);
    if (isError(markPriceResult)) {
      return markPriceResult;
    }
    return {
      markPrice: markPriceResult,
      pricePrecision: parseFloat(symbolInfo.pricePrecision),
      quantityPrecision: parseFloat(symbolInfo.quantityPrecision),
      minOrderQuantity: parseFloat(marketLotSizeFilter.minQty),
      tickSize: parseFloat(tickSizeFilter.tickSize)
    };
  };
}
