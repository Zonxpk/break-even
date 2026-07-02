import { useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';
import { roughRect } from './roughRect';

type Props = {
  children?: ReactNode;
  /** wrapper layout: margins, padding, rotation, alignment, etc. */
  style?: StyleProp<ViewStyle>;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  /** stable wobble per element — pass nth index so each card differs */
  seed?: number;
  dashed?: boolean;
  /** hard offset shadow (doodle cards have a 4–5px offset block shadow) */
  shadow?: boolean;
};

/**
 * A doodle card: a hand-drawn wobbly rounded-rect (fill + ink stroke) drawn in
 * SVG behind its children. Replaces the prototype's `.sketch { filter:wobble }`
 * CSS trick, which can't apply to native RN Views.
 *
 * The border is sized to the View via onLayout, so the SVG appears one frame
 * after mount — acceptable for static cards.
 */
export function Sketch({
  children,
  style,
  fill = theme.doodle.card,
  stroke = theme.doodle.ink,
  strokeWidth = 2.5,
  radius = 16,
  seed = 1,
  dashed = false,
  shadow = false,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  // Reserve a uniform margin so jittered points (±WOBBLE) plus half the stroke
  // never overflow the SVG and get clipped — clipping is what makes the wobble
  // look flat/inconsistent on some edges. Shadow eats extra room bottom-right.
  const WOBBLE = 2.4;
  const pad = WOBBLE + strokeWidth / 2;
  const sx = shadow ? 4 : 0;
  const sy = shadow ? 5 : 0;
  const w = size.w - pad * 2 - sx;
  const h = size.h - pad * 2 - sy;
  const ready = w > 0 && h > 0;
  const d = ready ? roughRect(w, h, { radius, seed, wobble: WOBBLE }) : '';
  const dShadow = ready ? roughRect(w, h, { radius, seed: seed + 101, wobble: WOBBLE }) : '';

  return (
    <View style={style} onLayout={onLayout}>
      {ready && (
        <Svg
          width={size.w}
          height={size.h}
          style={{ position: 'absolute', top: 0, left: 0 }}
          pointerEvents="none"
        >
          {shadow && (
            <Path
              d={dShadow}
              fill="rgba(58,53,48,0.22)"
              stroke="none"
              translateX={pad + sx}
              translateY={pad + sy}
            />
          )}
          <Path
            d={d}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={dashed ? '7 5' : undefined}
            translateX={pad}
            translateY={pad}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
