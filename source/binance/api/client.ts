import {
  CancelOrderResult,
  ExchangeInfo,
  MarkPriceResult,
  NewOrder,
  Order, PositionRiskResult,
  QueryOrderResult
} from "binance-api-node";
import { BinanceOpenOrder } from "./open-orders";

export interface BinanceClient {
  futuresMarkPrice(): Promise<MarkPriceResult | MarkPriceResult[]>;

  futuresExchangeInfo(): Promise<ExchangeInfo>;

  futuresPositionRisk(): Promise<PositionRiskResult[]>;

  futuresOpenOrders(options: {
    symbol: string;
  }): Promise<BinanceOpenOrder[] | QueryOrderResult>;

  futuresOrder(options: NewOrder): Promise<Order>;

  futuresCancelOrder(options: {
    symbol: string;
    orderId: number;
  }): Promise<CancelOrderResult>;

  ws: {
    futuresUser(handler: (message: unknown) => Promise<void>): void;
  };
}
