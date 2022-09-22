// This file is auto-generated by the 'process_types.ts' script

// Collection of service names to avoid having to use magic strings for
// the RPC services. If anything gets renamed in the protos, it'll
// produce a compiler error
export const serviceNames = {
    frdrpc: { FaradayServer: 'frdrpc.FaradayServer' },
    autopilotrpc: { Autopilot: 'autopilotrpc.Autopilot' },
    chainrpc: { ChainNotifier: 'chainrpc.ChainNotifier' },
    invoicesrpc: { Invoices: 'invoicesrpc.Invoices' },
    lnrpc: {
        Lightning: 'lnrpc.Lightning',
        WalletUnlocker: 'lnrpc.WalletUnlocker'
    },
    routerrpc: { Router: 'routerrpc.Router' },
    signrpc: { Signer: 'signrpc.Signer' },
    walletrpc: { WalletKit: 'walletrpc.WalletKit' },
    watchtowerrpc: { Watchtower: 'watchtowerrpc.Watchtower' },
    wtclientrpc: { WatchtowerClient: 'wtclientrpc.WatchtowerClient' },
    looprpc: { SwapClient: 'looprpc.SwapClient', Debug: 'looprpc.Debug' },
    poolrpc: {
        ChannelAuctioneer: 'poolrpc.ChannelAuctioneer',
        HashMail: 'poolrpc.HashMail',
        Trader: 'poolrpc.Trader'
    }
};

// This array contains the list of methods that are server streaming. It is
// used to determine if the Proxy should call 'request' or 'subscribe'. The
// only other solution would be to either hard-code the subscription methods,
// which increases the maintenance burden on updates, or to have protoc generate JS code
// which increases the bundle size. This build-time approach which only
// includes a small additional file appears to be worthy trade-off
export const subscriptionMethods = [
    'chainrpc.ChainNotifier.RegisterConfirmationsNtfn',
    'chainrpc.ChainNotifier.RegisterSpendNtfn',
    'chainrpc.ChainNotifier.RegisterBlockEpochNtfn',
    'invoicesrpc.Invoices.SubscribeSingleInvoice',
    'lnrpc.Lightning.SubscribeTransactions',
    'lnrpc.Lightning.SubscribePeerEvents',
    'lnrpc.Lightning.SubscribeChannelEvents',
    'lnrpc.Lightning.OpenChannel',
    'lnrpc.Lightning.ChannelAcceptor',
    'lnrpc.Lightning.CloseChannel',
    'lnrpc.Lightning.SendPayment',
    'lnrpc.Lightning.SendToRoute',
    'lnrpc.Lightning.SubscribeInvoices',
    'lnrpc.Lightning.SubscribeChannelGraph',
    'lnrpc.Lightning.SubscribeChannelBackups',
    'lnrpc.Lightning.RegisterRPCMiddleware',
    'lnrpc.Lightning.SubscribeCustomMessages',
    'routerrpc.Router.SendPaymentV2',
    'routerrpc.Router.TrackPaymentV2',
    'routerrpc.Router.SubscribeHtlcEvents',
    'routerrpc.Router.SendPayment',
    'routerrpc.Router.TrackPayment',
    'routerrpc.Router.HtlcInterceptor',
    'looprpc.SwapClient.Monitor',
    'poolrpc.ChannelAuctioneer.SubscribeBatchAuction',
    'poolrpc.ChannelAuctioneer.SubscribeSidecar',
    'poolrpc.HashMail.RecvStream'
];
