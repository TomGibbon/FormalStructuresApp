import React from 'react';
import { Text, View } from 'react-native';

import { loadingStyles } from '../styles';

const Loading = () => {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.box}>
        <Text style={loadingStyles.largeText}>Loading...</Text>
      </View>
    </View>
  );
};

export default Loading;
