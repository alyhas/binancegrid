import { NewOrder } from "binance-api-node";
import createDebug from "debug";
import { isDefined } from "../../lib/maybe";
import { isError, isResult } from "../../lib/results";
import { BinanceClient } from "../api/client";
import { BinanceOpenOrder } from "../api/open-orders";
import { OrderStatus, OrderType, PositionSide } from "../constants";
import { transformOpenOrderFromApi } from "../transformers/fromApi/transformOpenOrderFromApi";
import { transformOrderToApi } from "../transformers/toApi/transformOrderToApi";
import { getSymbolInfo } from "./symbol-info";

const debug = createDebug("bot:binance:domain:orders");

export enum OrderEffect {
  IncreasePosition = "IncreasePosition",
  DecreasePosition = "DecreasePosition",
}

// Props

interface CommonOrderProps {
  symbol: string;
  quantity: number;
  side: PositionSide;
  effect: OrderEffect;
  status?: OrderStatus;
  type: OrderType;
}

// STATUS

export type UncommittedOrder = CommonOrderProps & {
  status: undefined;
};

export type OpenOrder = CommonOrderProps & {
  status: OrderStatus.New;
  orderId: number;
};

export type FilledOrder = CommonOrderProps & {
  status: OrderStatus.Filled;
  filledAtPrice: number;
  profit: number;
};

type StatusAwareOrder = UncommittedOrder | OpenOrder | FilledOrder;

// TYPE

export type MarketOrder = StatusAwareOrder & {
  type: OrderType.Market;
};

export type LimitOrder = StatusAwareOrder & {
  type: OrderType.Limit;
  price: number;
};

export type StopMarketOrder = StatusAwareOrder & {
  type: OrderType.StopMarket;
  stopPrice: number;
};

export type TakeProfitMarketOrder = StatusAwareOrder & {
  type: OrderType.TakeProfitMarket;
  stopPrice: number;
};

export type TrailingStopMarketOrder = StatusAwareOrder & {
  type: OrderType.TrailingStopMarket;
  callbackRate: number;
  activationPrice?: number;
};

// COMBINED

export type Order =
  | MarketOrder
  | LimitOrder
  | StopMarketOrder
  | TakeProfitMarketOrder
  | TrailingStopMarketOrder;

export function getOpenOrders(symbol: string, side?: PositionSide) {
  return async (client: BinanceClient): Promise<OpenOrder[]> => {
    const binanceOpenOrders = ((await client.futuresOpenOrders({
      symbol,
    })) as unknown) as BinanceOpenOrder[];

    return binanceOpenOrders
      .map(transformOpenOrderFromApi)
      .filter(isDefined)
      .filter((o) => (side ? o.side === side : true));
  };
}

export function placeOrder(order: Order) {
  return async (client: BinanceClient) => {
    const symbolInfo = await getSymbolInfo(order.symbol)(client);
    if (isError(symbolInfo)) {
      return symbolInfo; // pass down error
    }
    debug(symbolInfo);
    const newOrder = transformOrderToApi(order, symbolInfo);
    debug("Placing order: %O", newOrder);
    if (isResult(newOrder)) {
      try {
        await client.futuresOrder(newOrder as NewOrder);
      } catch (error: unknown) {
        debug(error);
        if (error instanceof Error && error.message === "Internal error; unable to process your request. Please try again.") {
          setTimeout(() => placeOrder(order), 5000);
        }
      }
    }
  };
}

export function cancelOrder(order: OpenOrder) {
  return (client: BinanceClient) => {
    debug("Cancelling order: %O", order);
    if (order.status === OrderStatus.New) {
      return client.futuresCancelOrder({
        symbol: order.symbol,
        orderId: order.orderId,
      });
    }
  };
}

export function cancelOrders(orders: OpenOrder[]) {
  return async (client: BinanceClient) => {
    for (const order of orders) {
      await cancelOrder(order)(client);
    }
  }
}

export function cancelOpenOrders(symbol: string, side?: PositionSide) {
  return async (client: BinanceClient) => {
    const openOrders = await getOpenOrders(symbol, side)(client);
    await cancelOrders(openOrders)(client);
  };
}
