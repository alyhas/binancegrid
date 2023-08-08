export enum OrderType {
  Market = "MARKET",
  Limit = "LIMIT",
  StopMarket = "STOP_MARKET",
  TakeProfitMarket = "TAKE_PROFIT_MARKET",
  TrailingStopMarket = "TRAILING_STOP_MARKET",
}

export enum OrderStatus {
  New = "NEW",
  Filled = "FILLED",
}

export enum OrderSide {
  Buy = "BUY",
  Sell = "SELL",
}

export enum OrderWorkingType {
  MarkPrice = "MARK_PRICE",
  ContractPrice = "CONTRACT_PRICE",
}

export enum PositionSide {
  Long = "LONG",
  Short = "SHORT",
  Both = "BOTH",
}

export enum ApiUserDataUpdateType {
  AccountUpdate = "ACCOUNT_UPDATE",
  OrderTradeUpdate = "ORDER_TRADE_UPDATE",
}
