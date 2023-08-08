import { isDefined } from "../../lib/maybe";
import { Order } from "../domain/orders";

export function isOrderForSymbol(order: Order, symbol?: string): boolean {
  return isDefined(symbol) && order.symbol === symbol;
}
