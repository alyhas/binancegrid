import Binance from "binance-api-node";
import createDebug from "debug";
import express from "express";
import { OrderType, PositionSide } from "./binance/constants";
import { getMarkPrice } from "./binance/domain/currency";
import { cancelOrders, getOpenOrders, OrderEffect, placeOrder } from "./binance/domain/orders";
import { getSymbolInfo } from "./binance/domain/symbol-info";
import { calcPercentageOffset } from "./binance/utils/calculations";
import { notifyAboutFilledOrders } from "./binance/watchers/notifyAboutFilledOrders";
import { environment } from "./environment";
import { isResult } from "./lib/results";

const debug = createDebug("bot:index");

const client = Binance({
  apiKey: environment.BINANCE_API_KEY,
  apiSecret: environment.BINANCE_API_SECRET,
});

type GridMode = "short" | "long" | "hedge" | "closed";

notifyAboutFilledOrders(client, async (order, positions) => {
  debug("--- ACTION START ---");
  const symbolConfigEnvVar = process.env[order.symbol];
  if (!symbolConfigEnvVar) {
    return debug( `ignoring order because no config found for ${order.symbol}: ${symbolConfigEnvVar}`, order);
  }
  debug(`handling order for ${order.symbol}`, order);

  const [gridStepPercentage, orderAmount, maxPositionSize] = symbolConfigEnvVar.split(",").map(parseFloat);
  debug(`CONFIG: gridStepPercentage: ${gridStepPercentage}, orderAmount: ${orderAmount}, maxPositionSize: ${maxPositionSize}`);

  const symbolInfo = await getSymbolInfo(order.symbol)(client);
  const minOrderQuantity = isResult(symbolInfo) ? symbolInfo.minOrderQuantity : 0;

  const markPrice = await getMarkPrice(order.symbol)(client);
  if(!isResult(markPrice)) throw new Error("expected markPrice to be defined");

  const priceAbove = calcPercentageOffset(order.filledAtPrice, gridStepPercentage);
  const priceBelow = calcPercentageOffset(order.filledAtPrice, -gridStepPercentage);

  const quantityAbove = orderAmount / priceAbove;
  const quantityBelow = orderAmount / priceBelow;

  const longPosition = positions.find((p) => p.side === PositionSide.Long);
  const shortPosition = positions.find((p) => p.side === PositionSide.Short);

  const isShortGridMode = shortPosition && longPosition === undefined;
  const isLongGridMode = longPosition && shortPosition === undefined;
  const isHedgeMode = longPosition && shortPosition;

  const gridMode: GridMode = isHedgeMode ? "hedge" : (isShortGridMode ? "short" : (isLongGridMode ? "long" : "closed"));
  debug(`grid mode: ${gridMode}`);

  // cancel all open limit orders first
  const openLimitOrders = (await getOpenOrders(order.symbol)(client)).filter(o => o.type === OrderType.Limit);
  await cancelOrders(openLimitOrders)(client);

  const isShortPositionTooBig = shortPosition && (shortPosition.amount * markPrice) >= maxPositionSize;
  const isLongPositionTooBig = longPosition && (longPosition.amount * markPrice) >= maxPositionSize;
  debug(`isShortPositionTooBig: ${isShortPositionTooBig}, isLongPositionTooBig: ${isLongPositionTooBig}`);

  // order ABOVE mark price
  if (longPosition && shortPosition) {
    const isLongPositionInProfit = longPosition.entryPrice < order.filledAtPrice;
    const isLongPositionBigEnough = longPosition.amount > quantityAbove * 2;
    debug(`isLongPositionInProfit: ${isLongPositionInProfit}, isLongPositionBigEnough: ${isLongPositionBigEnough}`);

    if (isLongPositionInProfit || isShortPositionTooBig) {
      debug(`Placing ${order.symbol} limit decrease long order at ${priceAbove.toFixed(4)}$, ${gridStepPercentage}% above market price`);
      await placeOrder({
        symbol: order.symbol,
        quantity: isLongPositionBigEnough && isLongPositionInProfit ? quantityAbove : minOrderQuantity,
        price: priceAbove,
        type: OrderType.Limit,
        side: PositionSide.Long,
        status: undefined,
        effect: OrderEffect.DecreasePosition,
      })(client);
    } else if (!isShortPositionTooBig) {
      debug(`Placing ${order.symbol} limit increase short order at ${priceAbove.toFixed(4)}$, ${gridStepPercentage}% above market price`);
      await placeOrder({
        symbol: order.symbol,
        quantity: quantityAbove,
        price: priceAbove,
        type: OrderType.Limit,
        side: PositionSide.Short,
        status: undefined,
        effect: OrderEffect.IncreasePosition,
      })(client);
    }
  } else if (isShortGridMode && !isShortPositionTooBig) {
    // SHORT grid
    debug(`Placing ${order.symbol} limit increase short order at ${priceAbove.toFixed(4)}$, ${gridStepPercentage}% above market price`);
    await placeOrder({
      symbol: order.symbol,
      quantity: quantityAbove,
      price: priceAbove,
      type: OrderType.Limit,
      side: PositionSide.Short,
      status: undefined,
      effect: OrderEffect.IncreasePosition,
    })(client);
  } else if (isLongGridMode) {
    debug(`Placing ${order.symbol} limit decrease long order at ${priceAbove.toFixed(4)}$, ${gridStepPercentage}% above market price`);
    // LONG grid
    await placeOrder({
      symbol: order.symbol,
      quantity: quantityAbove,
      price: priceAbove,
      type: OrderType.Limit,
      side: PositionSide.Long,
      status: undefined,
      effect: OrderEffect.DecreasePosition,
    })(client);
  }

  // order BELOW mark price
  if (longPosition && shortPosition) {
    const isShortPositionInProfit = shortPosition.entryPrice > order.filledAtPrice;
    const isShortPositionBigEnough = shortPosition.amount > quantityBelow * 2;
    debug(`isShortPositionInProfit: ${isShortPositionInProfit}, isShortPositionBigEnough: ${isShortPositionBigEnough}`);

    if (isShortPositionInProfit || isLongPositionTooBig) {
      debug(`Placing ${order.symbol} limit decrease short order at ${priceBelow.toFixed(4)}$, ${gridStepPercentage}% below market price`);
      await placeOrder({
        symbol: order.symbol,
        quantity: isShortPositionBigEnough && isShortPositionInProfit ? quantityBelow : minOrderQuantity,
        price: priceBelow,
        type: OrderType.Limit,
        side: PositionSide.Short,
        status: undefined,
        effect: OrderEffect.DecreasePosition,
      })(client);
    } else if (!isLongPositionTooBig) {
      debug(`Placing ${order.symbol} limit increase long order at ${priceBelow.toFixed(4)}$, ${gridStepPercentage}% below market price`);
      await placeOrder({
        symbol: order.symbol,
        quantity: quantityBelow,
        price: priceBelow,
        type: OrderType.Limit,
        side: PositionSide.Long,
        status: undefined,
        effect: OrderEffect.IncreasePosition,
      })(client);
    }
  } else if (isLongGridMode && !isLongPositionTooBig) {
    debug(`Placing ${order.symbol} limit increase long order at ${priceBelow.toFixed(4)}$, ${gridStepPercentage}% below market price`);
    await placeOrder({
      symbol: order.symbol,
      quantity: quantityBelow,
      price: priceBelow,
      type: OrderType.Limit,
      side: PositionSide.Long,
      status: undefined,
      effect: OrderEffect.IncreasePosition,
    })(client);
  } else if (isShortGridMode) {
    debug(`Placing ${order.symbol} limit decrease short order at ${priceBelow.toFixed(4)}$, ${gridStepPercentage}% below market price`);
    await placeOrder({
      symbol: order.symbol,
      quantity: quantityBelow,
      price: priceBelow,
      type: OrderType.Limit,
      side: PositionSide.Short,
      status: undefined,
      effect: OrderEffect.DecreasePosition,
    })(client);
  }
  debug("--- ACTION END ---");
});

// Heroku requires a server process:
express()
  .use((req, res) => res.send("running"))
  .listen(environment.PORT, () => {
    debug(`Express server started on port ${environment.PORT}...`);
  });
