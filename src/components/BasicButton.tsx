import React, { PropsWithChildren } from 'react';
import { StyleProp, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { basicButtonStyles } from '../styles.js';

type BasicButtonProps = PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}>;

const BasicButton = (props: BasicButtonProps) => {
  const buttonStyles = props.small
    ? basicButtonStyles.smallBasicButton
    : basicButtonStyles.basicButton;

  const combinedStyles = props.style
    ? {
        ...buttonStyles,
        ...(props.style as object),
      }
    : buttonStyles;

  return (
    <TouchableOpacity onPress={props.onPress} style={combinedStyles}>
      <Text style={basicButtonStyles.text}>{props.children}</Text>
    </TouchableOpacity>
  );
};

export default BasicButton;
