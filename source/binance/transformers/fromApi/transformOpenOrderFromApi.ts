import { assertNever, Maybe } from "../../../lib/maybe";
import { BinanceOpenOrder } from "../../api/open-orders";
import { getOrderEffect } from "../../domain/utils";
import { OpenOrder, Order } from "../../domain/orders";
import { OrderStatus, OrderType } from "../../constants";

export const transformOpenOrderFromApi = (
  order: BinanceOpenOrder
): Maybe<Order & OpenOrder> => {
  const baseOrder = {
    symbol: order.symbol,
    side: order.positionSide,
    effect: getOrderEffect(order.positionSide, order.side),
    quantity: parseFloat(order.origQty),
  };
  switch (order.type) {
    case OrderType.Limit:
      return {
        ...baseOrder,
        type: OrderType.Limit,
        status: OrderStatus.New,
        orderId: order.orderId,
        price: parseFloat(order.price),
      };
    case OrderType.StopMarket:
      return {
        ...baseOrder,
        type: OrderType.StopMarket,
        status: OrderStatus.New,
        orderId: order.orderId,
        stopPrice: parseFloat(order.stopPrice),
      };
    case OrderType.TakeProfitMarket:
      return {
        ...baseOrder,
        type: OrderType.TakeProfitMarket,
        status: OrderStatus.New,
        orderId: order.orderId,
        stopPrice: parseFloat(order.stopPrice),
      };
    case OrderType.TrailingStopMarket:
      return {
        ...baseOrder,
        type: OrderType.TrailingStopMarket,
        status: OrderStatus.New,
        orderId: order.orderId,
        activationPrice: parseFloat(order.activatePrice),
        callbackRate: parseFloat(order.priceRate),
      };
    default:
      assertNever(order);
  }
};
