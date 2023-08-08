import { OrderSide, PositionSide } from "../constants";
import { OrderEffect, StopMarketOrder } from "./orders";

export function getOrderEffect(ps: PositionSide, os: OrderSide): OrderEffect {
  if (ps === PositionSide.Long) {
    return os === OrderSide.Buy
      ? OrderEffect.IncreasePosition
      : OrderEffect.DecreasePosition;
  }
  return os === OrderSide.Buy
    ? OrderEffect.DecreasePosition
    : OrderEffect.IncreasePosition;
}

export function getOrderSide(positionSide: PositionSide, effect: OrderEffect) {
  if (positionSide === PositionSide.Long) {
    return effect === OrderEffect.IncreasePosition
      ? OrderSide.Buy
      : OrderSide.Sell;
  } else {
    return effect === OrderEffect.IncreasePosition
      ? OrderSide.Sell
      : OrderSide.Buy;
  }
}

export function isTakeProfitMarketOrder(
  order: StopMarketOrder,
  markPrice: number
): boolean {
  const isClosingLongWithProfit =
    order.side === PositionSide.Long &&
    order.effect === OrderEffect.DecreasePosition &&
    order.stopPrice > markPrice;
  const isClosingShortWithProfit =
    order.side === PositionSide.Short &&
    order.effect === OrderEffect.DecreasePosition &&
    order.stopPrice < markPrice;
  return isClosingLongWithProfit || isClosingShortWithProfit;
}
