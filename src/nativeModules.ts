import { NativeModules } from 'react-native';

// Get native module
const { CPPCode } = NativeModules;
if (!CPPCode) {
  throw new Error('CPPCode is null');
}

export default CPPCode;
