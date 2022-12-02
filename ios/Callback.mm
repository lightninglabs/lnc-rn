// Callback.m
#import "Callback.h"
#import <React/RCTEventEmitter.h>

@implementation Callback

-(void)setCallback:(RCTResponseSenderBlock)callback {
    self.rnCallback = callback;
}

-(void)sendResult:(NSString *)data {
    self.rnCallback(@[data]);
}

@end
