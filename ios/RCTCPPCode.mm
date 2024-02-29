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
    int _id = [transitionDict[@"id"] intValue];
    int from = [transitionDict[@"from"] intValue];
    int to = [transitionDict[@"to"] intValue];
    std::string token = [transitionDict[@"token"] UTF8String];

    mainCode::Transition transition(_id, from, to, token);
    transitions.push_back(transition);
  }

  return mainCode::NFA(isDfa, states, transitions);
}

// - (cv::Mat)decodeBase64ToMat:(NSString *)strEncodeData {
//   NSData *data = [[NSData alloc]initWithBase64EncodedString:strEncodeData options:NSDataBase64DecodingIgnoreUnknownCharacters];
//   UIImage* image = [UIImage imageWithData:data];
//   CGColorSpaceRef colorSpace = CGImageGetColorSpace(image.CGImage);
//   CGFloat cols = image.size.width;
//   CGFloat rows = image.size.height;
  
//   cv::Mat cvMat(rows, cols, CV_8UC4); // 8 bits per component, 4 channels (color channels + alpha)

//   CGContextRef contextRef = CGBitmapContextCreate(cvMat.data,                 // Pointer to  data
//                                                   cols,                       // Width of bitmap
//                                                   rows,                       // Height of bitmap
//                                                   8,                          // Bits per component
//                                                   cvMat.step[0],              // Bytes per row
//                                                   colorSpace,                 // Colorspace
//                                                   kCGImageAlphaNoneSkipLast |
//                                                   kCGBitmapByteOrderDefault); // Bitmap info flags
  
//   CGContextDrawImage(contextRef, CGRectMake(0, 0, cols, rows), image.CGImage);
//   CGContextRelease(contextRef);
  
//   return cvMat;
// }

// RCT_EXPORT_METHOD(photoToNFABase64:(NSString *)input
//                   resolver:(RCTPromiseResolveBlock)resolve
//                   rejecter:(RCTPromiseRejectBlock)reject)
// {
//   @try {
//     cv::Mat img = [self decodeBase64ToMat:input];
//     std::string result = mainCode::photoToNFA(img, "", true, false);
//     resolve(@(result.c_str()));
//   } @catch (NSException *exception) {
//     reject(exception.name, [NSString stringWithFormat:@"Error: %@", exception.reason], nil);
//   }
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

RCT_EXPORT_METHOD(photoToNFA:(NSString *)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    std::string result = mainCode::photoToNFA(cv::Mat(), [path UTF8String], false, false);
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

@end
