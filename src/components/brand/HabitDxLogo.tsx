import React from 'react';
import { Image, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';

/**
 * Brand lockups live in `assets/`. Use variants intentionally:
 * - **full** — Default full wordmark + symbol (transparent), primary brand moments.
 * - **header** — Wide horizontal lockup for main tab surfaces (home, insights).
 * - **wordmark** — Text only; quieter presence (e.g. settings).
 * - **mark** — Symbol only; loading gates and small centered states (clear at small sizes).
 * - **fullOpaque** — Legacy opaque PNG if a solid backdrop is required.
 */
export type HabitDxLogoVariant = 'full' | 'header' | 'wordmark' | 'mark' | 'fullOpaque';

// eslint-disable-next-line @typescript-eslint/no-var-requires -- Metro static image bundle
const SOURCES: Record<HabitDxLogoVariant, ImageSourcePropType> = {
  full: require('../../../assets/habitdx-logo-transparent.png'),
  header: require('../../../assets/habitdx-header-logo-transparent.png'),
  wordmark: require('../../../assets/habitdx-wordmark-only.png'),
  mark: require('../../../assets/habitdx-mark-only.png'),
  fullOpaque: require('../../../assets/habitdx-logo.png'),
};

/** height / width for each raster (from source PNG dimensions). */
const ASPECT_HEIGHT_OVER_WIDTH: Record<HabitDxLogoVariant, number> = {
  full: 296 / 1155,
  header: 600 / 2000,
  wordmark: 217 / 791,
  mark: 296 / 378,
  fullOpaque: 410 / 1212,
};

export interface HabitDxLogoProps {
  /** Which lockup to show. */
  variant?: HabitDxLogoVariant;
  /** Display width in dp; height follows the variant’s aspect ratio. */
  width?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function HabitDxLogo({
  variant = 'full',
  width = 232,
  style,
  accessibilityLabel = 'HabitDx',
}: HabitDxLogoProps) {
  const aspect = ASPECT_HEIGHT_OVER_WIDTH[variant];
  const height = Math.round(width * aspect);
  return (
    <View style={[{ alignSelf: 'flex-start' }, style]}>
      <Image
        source={SOURCES[variant]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}
