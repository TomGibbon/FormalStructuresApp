import React from 'react';

import { ImageSourcePropType, View, Image } from 'react-native';

import BasicButton from './BasicButton';
import { componentStyles } from '../styles.js';

type IconProps = {
  onPress?: () => void;
  icon: ImageSourcePropType;
  small?: boolean;
};

const IconButton = (props: IconProps) => {
  return (
    <BasicButton
      onPress={props.onPress}
      style={
        props.small
          ? componentStyles.smallIconImageContainer
          : componentStyles.iconImageContainer
      }
    >
      <View
        style={
          props.small
            ? componentStyles.smallIconImageContainer
            : componentStyles.iconImageContainer
        }
      >
        <Image source={props.icon} style={componentStyles.iconImage} />
      </View>
    </BasicButton>
  );
};

export default IconButton;
