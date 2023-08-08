import {
  OrderSide,
  OrderStatus,
  OrderType,
  PositionSide,
  ApiUserDataUpdateType,
} from "../constants";

interface OrderUpdateCommonProps {
  s: string; // symbol
  q: string; // quantity
  ap: string; // average price
  R: boolean; // Reduce only flag
  S: OrderSide;
  ot: OrderType;
  ps: PositionSide;
  X: OrderStatus;
  rp?: string;
}

// Status

type FilledOrderUpdate = OrderUpdateCommonProps & {
  X: OrderStatus.Filled;
  ap: string; // average price filled
};

type StatusAwareOrderTradeUpdate = FilledOrderUpdate;

// Types

export type ApiMarketOrderUpdate = StatusAwareOrderTradeUpdate & {
  ot: OrderType.Market;
};

export type ApiLimitOrderUpdate = StatusAwareOrderTradeUpdate & {
  ot: OrderType.Limit;
  p: string; // original price
};

export type ApiStopMarketOrderUpdate = StatusAwareOrderTradeUpdate & {
  ot: OrderType.StopMarket | OrderType.TakeProfitMarket;
  sp: string; // stop price
};

export type ApiTrailingStopMarketOrderUpdate = StatusAwareOrderTradeUpdate & {
  ot: OrderType.TrailingStopMarket;
  AP: string; // activation price
  cr: string; // callback rate
};

export type ApiOrderUpdate =
  | ApiMarketOrderUpdate
  | ApiLimitOrderUpdate
  | ApiStopMarketOrderUpdate
  | ApiTrailingStopMarketOrderUpdate;

export interface ApiPosition {
  s: string; // symbol
  pa: string; // position amount
  ep: string; // entry price
  ps: PositionSide;
}

export interface ApiOrderTradeUpdate {
  type: ApiUserDataUpdateType.OrderTradeUpdate;
  o: ApiOrderUpdate;
}

export interface ApiAccountUpdate {
  type: ApiUserDataUpdateType.AccountUpdate;
  a: {
    P: ApiPosition[];
  };
}

export type BinanceUserDataUpdate = ApiAccountUpdate | ApiOrderTradeUpdate;
