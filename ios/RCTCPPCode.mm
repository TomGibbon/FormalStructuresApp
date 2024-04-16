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
    // int locX = [stateDict[@"locX"] intValue];
    // int locY = [stateDict[@"locY"] intValue];

    mainCode::State state(_id, name, isStart, isFinal);
    states.push_back(state);
  }

  std::vector<mainCode::Transition> transitions;
  for (NSDictionary *transitionDict in transitionDicts) {
    int _id = [transitionDict[@"id"] intValue];
    int from = [transitionDict[@"from"] intValue];
    int to = [transitionDict[@"to"] intValue];
    std::string token = [transitionDict[@"token"] UTF8String];

    mainCode::Transition transition(_id, from, to, token);
    transitions.push_back(transition);
  }

  return mainCode::NFA(isDfa, states, transitions);
}

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
    std::set<int> resultingStates;
    if (nfa.IsDfa) {
      resultingStates = mainCode::runDFA(nfa, [word UTF8String]);
    } else {
      resultingStates = mainCode::runNFA(nfa, [word UTF8String]);
    }
    bool result = false;
    for (int resultingState : resultingStates) {
      for (mainCode::State state : nfa.States) {
        if (state.Id == resultingState && state.IsFinal) {
          result = true;
        }
      }
    }
    resolve(@(result));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(photoToNFA:(NSString *)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    std::string result = mainCode::photoToNFA([path UTF8String], false);
    resolve(@(result.c_str()));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(validateNFA:(NSDictionary *)nfaDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    mainCode::NFA nfa = [self createNFAFromJSON:nfaDict];
    int result = mainCode::validateNFA(nfa);
    resolve(@(result));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(checkIfDFA:(NSDictionary *)nfaDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    mainCode::NFA nfa = [self createNFAFromJSON:nfaDict];
    bool result = mainCode::checkIfDFA(nfa);
    resolve(@(result));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

RCT_EXPORT_METHOD(runStepNFA:(NSDictionary *)nfaDict
                  withWord:(NSString *)word
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    mainCode::NFA nfa = [self createNFAFromJSON:nfaDict];
    std::set<int> result;
    if (nfa.IsDfa) {
      result = mainCode::runDFA(nfa, [word UTF8String]);
    } else {
      result = mainCode::runNFA(nfa, [word UTF8String]);
    }

    NSMutableArray *resultArray = [NSMutableArray arrayWithCapacity:result.size()];
    for (int i : result) {
      [resultArray addObject:@(i)];
    }
    resolve(resultArray);
    // std::string resultingString = "[";
    // for (int i : result) {
    //   resultingString += std::to_string(i) + ",";
    // }
    // if (result.size() > 0) {
    //   resultingString.back() = ']';
    // } else {
    //   resultingString = "[]";
    // }
    // resolve(@(resultingString.c_str()));
  } @catch (NSException *exception) {
    reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
  }
}

@end
