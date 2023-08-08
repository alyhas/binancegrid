import { assertNever } from "../../../lib/maybe";
import { Result } from "../../../lib/results";
import {
  NewApiOrder,
  NewApiTrailingStopMarketOrder,
} from "../../api/new-orders";
import { OrderType, OrderWorkingType } from "../../constants";
import { Order } from "../../domain/orders";
import { SymbolInfo } from "../../domain/symbol-info";
import { getOrderSide } from "../../domain/utils";

function calculateOrderPrice(price: number, precision: number, tickSize: number) {
  return (Math.round(price / tickSize) * tickSize).toFixed(precision);
}

export const transformOrderToApi = (
  order: Order,
  symbolInfo: SymbolInfo
): Result<NewApiOrder> => {
  if (order.type === OrderType.Market) {
    return {
      type: OrderType.Market,
      symbol: order.symbol,
      positionSide: order.side,
      side: getOrderSide(order.side, order.effect),
      quantity: order.quantity.toFixed(symbolInfo.quantityPrecision),
      workingType: OrderWorkingType.MarkPrice,
    };
  }
  if (order.type === OrderType.Limit) {
    return {
      type: OrderType.Limit,
      symbol: order.symbol,
      positionSide: order.side,
      side: getOrderSide(order.side, order.effect),
      quantity: order.quantity.toFixed(symbolInfo.quantityPrecision),
      price: calculateOrderPrice(order.price, symbolInfo.pricePrecision, symbolInfo.tickSize),
      workingType: OrderWorkingType.MarkPrice,
    };
  }
  if (order.type === OrderType.StopMarket) {
    return {
      type: OrderType.StopMarket,
      symbol: order.symbol,
      positionSide: order.side,
      side: getOrderSide(order.side, order.effect),
      quantity: order.quantity.toFixed(symbolInfo.quantityPrecision),
      stopPrice: order.stopPrice.toFixed(symbolInfo.pricePrecision),
      workingType: OrderWorkingType.MarkPrice,
      priceProtect: "TRUE",
    };
  }
  if (order.type === OrderType.TakeProfitMarket) {
    return {
      type: OrderType.TakeProfitMarket,
      symbol: order.symbol,
      positionSide: order.side,
      side: getOrderSide(order.side, order.effect),
      quantity: order.quantity.toFixed(symbolInfo.quantityPrecision),
      stopPrice: order.stopPrice.toFixed(symbolInfo.pricePrecision),
      workingType: OrderWorkingType.MarkPrice,
      priceProtect: "TRUE",
    };
  }
  if (order.type === OrderType.TrailingStopMarket) {
    const newOrder: NewApiOrder = {
      type: OrderType.TrailingStopMarket,
      symbol: order.symbol,
      positionSide: order.side,
      side: getOrderSide(order.side, order.effect),
      quantity: order.quantity.toFixed(symbolInfo.quantityPrecision),
      callbackRate: order.callbackRate.toString(),
      workingType: OrderWorkingType.MarkPrice,
    };
    if (order.activationPrice) {
      newOrder.activationPrice = order.activationPrice.toFixed(
        symbolInfo.pricePrecision
      );
    }
    return newOrder;
  }
  assertNever(order); // exhaustive check
};

export function transformToApiMarketOrder(order: NewApiOrder): NewApiOrder {
  return {
    type: OrderType.Market,
    symbol: order.symbol,
    quantity: order.quantity,
    side: order.side,
    positionSide: order.positionSide,
    workingType: order.workingType,
  };
}

export function removeActivationPriceFromTrailingOrder(
  order: NewApiTrailingStopMarketOrder
): NewApiOrder {
  if (!order.activationPrice) {
    return order;
  }
  delete order.activationPrice;
  return order;
}
