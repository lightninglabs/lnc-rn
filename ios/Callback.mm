// Callback.m
#import "Callback.h"
#import <React/RCTEventEmitter.h>

@implementation Callback

-(void)setCallback:(RCTResponseSenderBlock)callback {
    NSLog(@"setCallback");
    self.rnCallback = callback;
}

-(void)sendResult:(NSString *)data {
    NSLog(@"sendResult");
    NSLog(data);
    self.rnCallback(@[data]);
}

@end
