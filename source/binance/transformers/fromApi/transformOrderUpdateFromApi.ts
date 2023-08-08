import { assertNever } from "../../../lib/maybe";
import { ApiOrderUpdate } from "../../api/user-data-updates";
import { getOrderEffect } from "../../domain/utils";
import { Order } from "../../domain/orders";
import { OrderStatus, OrderType } from "../../constants";

export const transformOrderUpdateFromApi = (order: ApiOrderUpdate): Order => {
  const baseOrder = {
    symbol: order.s,
    effect: getOrderEffect(order.ps, order.S),
    quantity: parseFloat(order.q),
    side: order.ps,
    profit: order.rp ? parseFloat(order.rp) : 0,
  };
  switch (order.ot) {
    case OrderType.Market:
      return {
        ...baseOrder,
        type: OrderType.Market,
        status: OrderStatus.Filled,
        filledAtPrice: parseFloat(order.ap),
      };
    case OrderType.Limit:
      return {
        ...baseOrder,
        type: OrderType.Limit,
        status: OrderStatus.Filled,
        price: parseFloat(order.p),
        filledAtPrice: parseFloat(order.ap),
      };
    case OrderType.StopMarket:
    case OrderType.TakeProfitMarket:
      return {
        ...baseOrder,
        type: OrderType.StopMarket,
        status: OrderStatus.Filled,
        filledAtPrice: parseFloat(order.ap),
        stopPrice: parseFloat(order.sp),
      };
    case OrderType.TrailingStopMarket:
      return {
        ...baseOrder,
        type: OrderType.TrailingStopMarket,
        status: OrderStatus.Filled,
        filledAtPrice: parseFloat(order.ap),
        activationPrice: parseFloat(order.AP),
        callbackRate: parseFloat(order.cr),
      };
    default:
      assertNever(order);
  }
};
