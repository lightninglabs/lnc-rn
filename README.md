# @lightninglabs/lnc-rn

## Lightning Node Connect npm module for React Native

## Install

`npm i @lightninglabs/lnc-rn`

## API Design

#### Set-up and connection

The constructor for the LNC object takes a parameters object with the three following fields:

-   `pairingPhrase` (string): Your LNC pairing phrase
-   `serverHost` (string): Specify a custom Lightning Node Connect proxy server. If not specified we'll default to `mailbox.terminal.lightning.today:443`.

```
import LNC from ‘@lightninglabs/lnc-rn’;

const pairingPhrase = ‘artefact morning piano photo consider light’;

// default connection using WASM from CDN
// WASM loaded on object creation
// default host: mailbox.terminal.lightning.today:443
const lnc = new LNC({
   pairingPhrase
});

// using custom Lightning Node Connect proxy server
const lnc = new LNC({
   pairingPhrase,
   serverHost: ‘custom.lnd-server.host:443’
});

// connect
lnc.connect();

// check connection status
lnc.isConnected();

// disconnect
lnc.disconnect();
```

#### Base functions

All of the services (lnd, loop, pool, faraday) will be objects under the main lnc object. Each services’ sub-services will be underneath each service object, and each sub-service function below that (except in the case of faraday which only has one service - its functions will live directly under it). All service, function, and param names will be camel-cased.

```
const { lnd, loop, pool, faraday } = lnc;

// all functions on the base object should have proper types
// sub-servers exist as objects on each main service
lnd.lightning.listInvoices();
lnd.lightning.connectPeer({ addr: ‘03aa49c1e98ff4f216d886c09da9961c516aca22812c108af1b187896ded89807e@m3keajflswtfq3bw4kzvxtbru7r4z4cp5stlreppdllhp5a7vuvjzqyd.onion:9735’ });

const signature = lnd.signer.signMessage({...params});

const swaps = await loop.swapClient.listSwaps();
const poolAccount = await pool.trader.initAccount({
   accountValue: 100000000,
   relativeHeight: 1000
 });

const insights = await faraday.channelInsights();
```

#### Subscriptions

```
import { NativeEventEmitter } from 'react-native';
const { LncModule } = NativeModules;

const request = {};
const eventName = lnc.lnd.lightning.subscribePeerEvents(request);
const eventEmitter = new NativeEventEmitter(LncModule);
listener = eventEmitter.addListener(eventName, (event: any) => {
    console.log('Got response', event.result);
});

// when ready to stop listener
listener.stop();
```

## Further documentation

- https://docs.lightning.engineering/lightning-network-tools/lightning-terminal/lnc-npm
