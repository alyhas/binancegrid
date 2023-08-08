import {
  OrderSide,
  OrderType,
  OrderWorkingType,
  PositionSide,
} from "../constants";

interface NewOrderCommonProps {
  symbol: string;
  quantity: string;
  type: OrderType;
  side: OrderSide;
  positionSide: PositionSide;
  workingType: OrderWorkingType;
}

// Types

export type NewApiMarketOrder = NewOrderCommonProps & {
  type: OrderType.Market;
};

export type NewApiLimitOrder = NewOrderCommonProps & {
  type: OrderType.Limit;
  price: string;
};

export type NewApiStopMarketOrder = NewOrderCommonProps & {
  type: OrderType.StopMarket;
  stopPrice: string;
  priceProtect: "TRUE" | "FALSE";
};

export type NewApiTakeProfitMarketOrder = NewOrderCommonProps & {
  type: OrderType.TakeProfitMarket;
  stopPrice: string;
  priceProtect: "TRUE" | "FALSE";
};

export type NewApiTrailingStopMarketOrder = NewOrderCommonProps & {
  type: OrderType.TrailingStopMarket;
  callbackRate: string;
  activationPrice?: string;
};

export type NewApiOrder =
  | NewApiMarketOrder
  | NewApiLimitOrder
  | NewApiStopMarketOrder
  | NewApiTakeProfitMarketOrder
  | NewApiTrailingStopMarketOrder;
