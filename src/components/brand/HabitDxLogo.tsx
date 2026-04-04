import React from 'react';
import { Image, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';

/** Full wordmark; source is 1212×410 PNG in `assets/`. */
// eslint-disable-next-line @typescript-eslint/no-var-requires -- Metro static image bundle
const LOGO = require('../../../assets/habitdx-logo.png');

const ASPECT = 410 / 1212;

export interface HabitDxLogoProps {
  /** Display width in dp; height follows aspect ratio. */
  width?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function HabitDxLogo({
  width = 232,
  style,
  accessibilityLabel = 'HabitDx',
}: HabitDxLogoProps) {
  const height = Math.round(width * ASPECT);
  return (
    <View style={[{ alignSelf: 'flex-start' }, style]}>
      <Image
        source={LOGO as ImageSourcePropType}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}
