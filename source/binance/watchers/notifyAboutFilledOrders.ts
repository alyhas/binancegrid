import { isResult } from "../../lib/results";
import { BinanceClient } from "../api/client";
import {
  ApiAccountUpdate,
  BinanceUserDataUpdate,
} from "../api/user-data-updates";
import { OrderStatus } from "../constants";
import { FilledOrder, Order } from "../domain/orders";
import { Position } from "../domain/positions";
import { transformPositionsRiskToPositions } from "../transformers/fromApi/transformPositionsRiskToPositions";
import { transformOrderUpdateFromApi } from "../transformers/fromApi/transformOrderUpdateFromApi";

type FilledOrderHandler = (
  filledOrder: Order & FilledOrder,
  positions: Position[]
) => Promise<void>;

export function notifyAboutFilledOrders(
  client: BinanceClient,
  handler: FilledOrderHandler
) {
  let lastAccountUpdate: ApiAccountUpdate | null = null;
  client.ws.futuresUser(async (message) => {
    const update = message as BinanceUserDataUpdate;
    if (update.type === "ACCOUNT_UPDATE") {
      // Save last account updates because we need to wait until
      // order is filled, to avoid updates on partial fills
      lastAccountUpdate = update;
    } else if (lastAccountUpdate && update.type === "ORDER_TRADE_UPDATE") {
      const order = update.o;

      // Manage positions when an order is filled
      const status = order.X;
      if (status === "FILLED") {
        const filledOrder = transformOrderUpdateFromApi(order);
        if (
          isResult(filledOrder) &&
          filledOrder.status === OrderStatus.Filled
        ) {
          const positionRisks = await client.futuresPositionRisk();
          handler(
            filledOrder,
            transformPositionsRiskToPositions(
              filledOrder.symbol,
              positionRisks
            )
          );
        }
      }
    }
  });
}
