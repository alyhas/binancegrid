import { PositionSide } from "../constants";
import { calcPercentageOffset } from "../utils/calculations";

export interface Position {
  symbol: string;
  amount: number;
  entryPrice: number;
  side: PositionSide;
}

// utils

export function getHedgeSide(position: Position) {
  return position.side === PositionSide.Long
    ? PositionSide.Short
    : PositionSide.Long;
}

export function getSplitAmount(position: Position, splitBy: number) {
  return position.amount / splitBy;
}

export function getOffsetPrice(
  price: number,
  offset: number,
  side: PositionSide
) {
  return calcPercentageOffset(
    price,
    side === PositionSide.Long ? offset : -offset
  );
}

export function getHedgeOffsetPrice(position: Position, offset: number) {
  return getOffsetPrice(position.entryPrice, offset, getHedgeSide(position));
}