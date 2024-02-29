import { NativeModules } from 'react-native';

const { CPPCode } = NativeModules;
if (!CPPCode) {
  throw new Error('CPPCode is null');
}

export default CPPCode;
