import { PositionRiskResult } from "binance-api-node";
import { Position } from "../../domain/positions";
import { PositionSide } from "../../constants";

export const transformPositionsRiskToPositions = (
  symbol: string,
  positionRisks: PositionRiskResult[]
): Position[] =>
  positionRisks.filter(
    (p) =>
      p.symbol === symbol &&
      p.positionSide !== PositionSide.Both &&
      Math.abs(parseFloat(p.positionAmt)) > 0
  ).map((p) => ({
    symbol,
    entryPrice: parseFloat(p.entryPrice),
    side: p.positionSide as PositionSide,
    amount: Math.abs(parseFloat(p.positionAmt)),
  }));
