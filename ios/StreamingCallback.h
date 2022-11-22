//
//  StreamingCallback.h
//  LncRn
//

@interface StreamingCallback : NSObject
@property (assign) id delegate;
@property NSString *eventId;
-(void)setEventName:(NSString *)name;
-(void)sendResult:(NSString *)data;
@end
