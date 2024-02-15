//
//  RCTCPPCode.h
//  FormalStructuresApp
//
//  Created by Tom Gibbon on 20/11/2023.
//

#ifndef RCTCPPCode_h
#define RCTCPPCode_h

#import <React/RCTBridgeModule.h>
#import "mainCode.hpp"

@interface RCTCPPCode : NSObject <RCTBridgeModule>

- (mainCode::NFA)createNFAFromJSON:(NSDictionary *)nfaDict;

@end

#endif /* RCTCPPCode_h */
