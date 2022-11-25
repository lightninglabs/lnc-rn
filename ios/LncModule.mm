#import "LncModule.h"
#import "Callback.h"
#import "StreamingCallback.h"
#import "Lncmobile.xcframework/ios-arm64/Lncmobile.framework/Headers/Lncmobile.h"


#ifdef RCT_NEW_ARCH_ENABLED
#import "RNLncRnSpec.h"
#endif

@implementation LncModule
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initLNC:(NSString *)nameSpace)
{
    NSError *error;
    MobileInitLNC(nameSpace, @"info", &error);
    if (error) {
        NSLog(@"Init error   %@",   error);
    }
}

RCT_EXPORT_METHOD(registerLocalPrivCreateCallback:(NSString *)nameSpace
                 resolver:(RCTResponseSenderBlock)onLocalPrivCreate)
{
    Callback *lpccb = [[Callback alloc] init];
    [lpccb setCallback:onLocalPrivCreate];
    NSError *error;
    MobileRegisterLocalPrivCreateCallback(nameSpace, lpccb, &error);
    if (error) {
        NSLog(@"registerLocalPrivCreateCallback error   %@",   error);
    }
}

RCT_EXPORT_METHOD(registerRemoteKeyReceiveCallback:(NSString *)nameSpace
                 resolver:(RCTResponseSenderBlock)onRemoteKeyReceive)
{
    Callback * rkrcb = [[Callback alloc] init];
    [rkrcb setCallback:onRemoteKeyReceive];
    NSError *error;
    MobileRegisterRemoteKeyReceiveCallback(nameSpace, rkrcb, &error);
    if (error) {
        NSLog(@"registerRemoteKeyReceiveCallback error   %@",   error);
    }
}

RCT_EXPORT_METHOD(registerAuthDataCallback:(NSString *)nameSpace
                 resolver:(RCTResponseSenderBlock)onAuthData)
{
    Callback * oacb = [[Callback alloc] init];
    [oacb setCallback:onAuthData];
    NSError *error;
    MobileRegisterAuthDataCallback(nameSpace, oacb, &error);
    if (error) {
        NSLog(@"registerAuthDataCallback error   %@",   error);
    }
}

RCT_EXPORT_METHOD(isConnected:(NSString *)nameSpace
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    BOOL isConnected;
    NSError *error;
    MobileIsConnected(nameSpace, &isConnected, &error);
    if (error) {
        reject(@"isConnected_failure", @"error thrown", error);
    } else {
        resolve(@(isConnected));
    }
}

RCT_EXPORT_METHOD(status:(NSString *)nameSpace
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    NSString *status = MobileStatus(nameSpace, &error);
    if (status) {
        resolve(status);
    } else if (error) {
        reject(@"status_failure", @"error thrown", error);
    }
}

RCT_EXPORT_METHOD(expiry:(NSString *)nameSpace
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    NSString *expiry = MobileGetExpiry(nameSpace, &error);
    if (expiry) {
        resolve(expiry);
    } else if (error) {
        reject(@"expiry_error", @"error thrown", error);
    }
}

RCT_EXPORT_METHOD(isReadOnly:(NSString *)nameSpace
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    BOOL readOnly;
    NSError *error;
    MobileIsReadOnly(nameSpace, &readOnly, &error);
    if (error) {
        reject(@"isReadOnly_error", @"error thrown", error);
    } else {
        resolve(@(readOnly));
    }
}

RCT_EXPORT_METHOD(hasPerms:(NSString *)nameSpace
                  permission:(NSString *)permission
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    BOOL hasPermissions;
    NSError *error;
    MobileHasPermissions(nameSpace, permission, &hasPermissions, &error);
    if (error) {
        reject(@"hasPermissions_error", @"error thrown", error);
    } else {
        resolve(@(hasPermissions));
    }
}

RCT_EXPORT_METHOD(connectServer:(NSString *)nameSpace
                 mailboxServerAddr:(NSString *)mailboxServerAddr
                 isDevServer:(BOOL)isDevServer
                 connectPhrase:(NSString *)connectPhrase
                 localStatic:(NSString *)localStatic
                 remoteStatic:(NSString *)remoteStatic
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError *error;
    MobileConnectServer(nameSpace, mailboxServerAddr, isDevServer, connectPhrase, localStatic, remoteStatic, &error);
    if (error) {
        resolve(error.localizedDescription);
    } else {
        resolve(@"");
    }
}

RCT_EXPORT_METHOD(disconnect:(NSString *)nameSpace)
{
    NSError *error;
    MobileDisconnect(nameSpace, &error);
    if (error) {
        NSLog(@"disconnect error   %@",   error);
    }
}

RCT_EXPORT_METHOD(invokeRPC:(NSString *)nameSpace
                 route:(NSString *)route
                 requestData:(NSString *)requestData
                 resolver:(RCTResponseSenderBlock)resolve)
{
    Callback * gocb = [[Callback alloc] init];
    [gocb setCallback:resolve];
    NSError *error;
    MobileInvokeRPC(nameSpace, route, requestData, gocb, &error);
    if (error) {
        NSLog(@"connectServer error   %@",   error);
    }
}

// placeholders to prevent NativeEventEmitter from erroring
// on initialization
-(void)startObserving {}
-(void)stopObserving {}

RCT_EXPORT_METHOD(initListener:(NSString *)nameSpace
                  eventName:(NSString *)eventName
                  request:(NSString *)request)
{
    StreamingCallback * gocb = [[StreamingCallback alloc] init];
    gocb.delegate = self;
    [gocb setEventName:eventName];
    NSError *error;
    MobileInvokeRPC(nameSpace, eventName, request, gocb, &error);
    if (error) {
        NSLog(@"%@ error   %@", eventName, error);
    }
}

- (NSArray<NSString *> *)supportedEvents {
    // TODO add all streaming events names to list
    return @[
        @"lnrpc.Lightning.SubscribePeerEvents",
        @"lnrpc.Lightning.SubscribePeerEvents",
        @"chainrpc.ChainNotifier.RegisterConfirmationsNtfn",
        @"chainrpc.ChainNotifier.RegisterSpendNtfn",
        @"chainrpc.ChainNotifier.RegisterBlockEpochNtfn",
        @"invoicesrpc.Invoices.SubscribeSingleInvoice",
        @"lnrpc.Lightning.SubscribeTransactions",
        @"lnrpc.Lightning.SubscribePeerEvents",
        @"lnrpc.Lightning.SubscribeChannelEvents",
        @"lnrpc.Lightning.OpenChannel",
        @"lnrpc.Lightning.ChannelAcceptor",
        @"lnrpc.Lightning.CloseChannel",
        @"lnrpc.Lightning.SendPayment",
        @"lnrpc.Lightning.SendToRoute",
        @"lnrpc.Lightning.SubscribeInvoices",
        @"lnrpc.Lightning.SubscribeChannelGraph",
        @"lnrpc.Lightning.SubscribeChannelBackups",
        @"lnrpc.Lightning.RegisterRPCMiddleware",
        @"lnrpc.Lightning.SubscribeCustomMessages",
        @"routerrpc.Router.SendPaymentV2",
        @"routerrpc.Router.TrackPaymentV2",
        @"routerrpc.Router.SubscribeHtlcEvents",
        @"routerrpc.Router.SendPayment",
        @"routerrpc.Router.TrackPayment",
        @"routerrpc.Router.HtlcInterceptor",
        @"looprpc.SwapClient.Monitor",
        @"poolrpc.ChannelAuctioneer.SubscribeBatchAuction",
        @"poolrpc.ChannelAuctioneer.SubscribeSidecar",
        @"poolrpc.HashMail.RecvStream"
    ];
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeLncRnSpecJSI>(params);
}
#endif

@end
