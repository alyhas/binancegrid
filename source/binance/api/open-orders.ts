import {
  OrderSide,
  OrderStatus,
  OrderType,
  OrderWorkingType,
  PositionSide,
} from "../constants";

interface OpenOrderCommonProps {
  symbol: string;
  orderId: number;
  origQty: string;
  type: OrderType;
  side: OrderSide;
  positionSide: PositionSide;
  status: OrderStatus.New;
  workingType: OrderWorkingType;
}

// Types

export type OpenLimitOrder = OpenOrderCommonProps & {
  type: OrderType.Limit;
  price: string;
};

export type OpenStopMarketOrder = OpenOrderCommonProps & {
  type: OrderType.StopMarket;
  stopPrice: string;
};

export type OpenTakeProfitMarketOrder = OpenOrderCommonProps & {
  type: OrderType.TakeProfitMarket;
  stopPrice: string;
};

export type OpenTrailingStopMarketOrder = OpenOrderCommonProps & {
  type: OrderType.TrailingStopMarket;
  activatePrice: string;
  priceRate: string; // callback rate
};

export type BinanceOpenOrder =
  | OpenLimitOrder
  | OpenStopMarketOrder
  | OpenTakeProfitMarketOrder
  | OpenTrailingStopMarketOrder;
