import React from 'react';

import { ImageSourcePropType, View, Image } from 'react-native';

import BasicButton from './BasicButton';
import { iconStyles } from '../styles.js';

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
        props.small ? iconStyles.smallImageContainer : iconStyles.imageContainer
      }
    >
      <View
        style={
          props.small
            ? iconStyles.smallImageContainer
            : iconStyles.imageContainer
        }
      >
        <Image
          source={props.icon}
          style={props.small ? iconStyles.smallImage : iconStyles.image}
        />
      </View>
    </BasicButton>
  );
};

export default IconButton;
