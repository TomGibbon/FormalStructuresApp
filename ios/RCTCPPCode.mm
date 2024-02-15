//
//  RCTCPPCode.mm
//  FormalStructuresApp
//
//  Created by Tom Gibbon on 20/11/2023.
//

#import <Foundation/Foundation.h>

#import "RCTCPPCode.h"

@implementation RCTCPPCode

RCT_EXPORT_MODULE();

- (mainCode::NFA)createNFAFromJSON:(NSDictionary *)nfaDict {
  bool isDfa = [nfaDict[@"isDfa"] boolValue];
  NSArray *stateDicts = nfaDict[@"states"];
  NSArray *transitionDicts = nfaDict[@"transitions"];

  std::vector<mainCode::State> states;
  for (NSDictionary *stateDict in stateDicts) {
    int _id = [stateDict[@"id"] intValue];
    std::string name = [stateDict[@"name"] UTF8String];
    bool isStart = [stateDict[@"isStart"] boolValue];
    bool isFinal = [stateDict[@"isFinal"] boolValue];
    int locX = [stateDict[@"locX"] intValue];
    int locY = [stateDict[@"locY"] intValue];

    mainCode::State state(_id, name, isStart, isFinal, locX, locY);
    states.push_back(state);
  }

  std::vector<mainCode::Transition> transitions;
  for (NSDictionary *transitionDict in transitionDicts) {
    int from = [transitionDict[@"from"] intValue];
    int to = [transitionDict[@"to"] intValue];
    std::string token = [transitionDict[@"token"] UTF8String];

    mainCode::Transition transition(from, to, token);
    transitions.push_back(transition);
  }

  return mainCode::NFA(isDfa, states, transitions);
}

// RCT_EXPORT_METHOD(multiply:(nonnull NSNumber*)a
//                   withB:(nonnull NSNumber*)b
//                   resolver:(RCTPromiseResolveBlock)resolve
//                   rejecter:(RCTPromiseRejectBlock)reject)
// {
//   int result = mainCode::multiply([a intValue], [b intValue]);
//   resolve(@{
//     @"result": @(result)
//   });
// }

// RCT_EXPORT_METHOD(photoToDfa:(NSString *)path
//                   resolver:(RCTPromiseResolveBlock)resolve
//                   rejecter:(RCTPromiseRejectBlock)reject)
// {
//   std::string cppPath = [path UTF8String];
//   std::string result = mainCode::photoToDfa(cppPath, false);
//   resolve(@(result.c_str()));
// }

RCT_EXPORT_METHOD(simplifyDFA:(NSDictionary *)dfaDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    mainCode::NFA dfa = [self createNFAFromJSON:dfaDict];
    mainCode::NFA resultingDfa = mainCode::simplifyDFA(dfa);
    std::string result = resultingDfa.convertToJSON(false);
    resolve(@(result.c_str()));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(convertNFAtoDFA:(NSDictionary *)nfaDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    mainCode::NFA nfa = [self createNFAFromJSON:nfaDict];
    mainCode::NFA resultingDfa = mainCode::convertNFAtoDFA(nfa);
    std::string result = resultingDfa.convertToJSON(false);
    resolve(@(result.c_str()));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(runNFAorDFA:(NSDictionary *)nfaDict
                  withWord:(NSString *)word
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    mainCode::NFA nfa = [self createNFAFromJSON:nfaDict];
    bool result;
    if (nfa.IsDfa) {
      result = mainCode::runDFA(nfa, [word UTF8String]);
    } else {
      result = mainCode::runNFA(nfa, [word UTF8String]);
    }
    resolve(@(result));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(photoToDFA:(NSString *)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    std::string result = mainCode::photoToDFA([path UTF8String]);
    resolve(@(result.c_str()));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

@end
