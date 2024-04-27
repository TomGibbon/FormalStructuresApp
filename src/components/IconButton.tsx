//
//  Displays a basic button with an icon instead of text
//

import React from 'react';
import {
  ImageSourcePropType,
  View,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';

import BasicButton from './BasicButton';
import { iconStyles } from '../styles.js';

type IconProps = {
  onPress?: () => void;
  icon: ImageSourcePropType;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

const IconButton = (props: IconProps) => {
  const specificIconStyles = props.small
    ? iconStyles.smallImageContainer
    : iconStyles.imageContainer;

  const combinedStyles = props.style // Combine any styles passed through props with default button styles
    ? {
        ...specificIconStyles,
        ...(props.style as object),
      }
    : specificIconStyles;

  return (
    <BasicButton onPress={props.onPress} style={combinedStyles}>
      <View style={specificIconStyles}>
        <Image
          source={props.icon}
          style={props.small ? iconStyles.smallImage : iconStyles.image}
        />
      </View>
    </BasicButton>
  );
};

export default IconButton;
