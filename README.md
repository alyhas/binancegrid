# Binance Futures Grid Bot
A Node.js based websocket client to the Binance Futures api
that listens to fulfilled orders and manages an ad-hoc grid
(orders above/below the last filled order price).

## Install
`yarn install`

## Development
First you have to copy the `.env.example` to an `.env` file and
fill out the required environment variables to run the bot.

To run the dev server: `yarn dev`

To see debug output: `DEBUG=bot* yarn dev`

## Deployment
First you need to build with `yarn build` and then 
you can `yarn start`. Make sure that you provide the environment
variables in your production setup.