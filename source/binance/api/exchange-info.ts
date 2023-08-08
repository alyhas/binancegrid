export type SymbolInfoPriceFilter = {
  filterType: "PRICE_FILTER",
  tickSize: string,
}

export type SymbolInfoMarketLotSizeFilter = {
  filterType: "MARKET_LOT_SIZE",
  minQty: string,
}

export type SymbolInfoFilters = SymbolInfoPriceFilter | SymbolInfoMarketLotSizeFilter;

export interface BinanceSymbolInfo {
  symbol: string;
  pricePrecision: string;
  quantityPrecision: string;
  filters: SymbolInfoFilters[];
}

export interface BinanceExchangeInfo {
  symbols: BinanceSymbolInfo[];
}
