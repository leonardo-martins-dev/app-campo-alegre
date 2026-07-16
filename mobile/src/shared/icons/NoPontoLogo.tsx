import React from 'react';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

export const NOPONTO = {
  navy: '#0B4467',
  navyDeep: '#062F4A',
  cyan: '#00AEEF',
  white: '#FFFFFF',
} as const;

type Props = {
  width?: number;
  /** Show wordmark + "food service". Icon-only when false. */
  showWordmark?: boolean;
};

function BrandMark({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Cyan arc (open at bottom) */}
      <Path
        d="M12 40c0-15.464 12.536-28 28-28s28 12.536 28 28"
        stroke={NOPONTO.cyan}
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Bulb / pin body */}
      <Path
        d="M40 18c-8.284 0-15 6.716-15 15 0 6.2 3.75 11.5 9.1 13.85L40 62l5.9-15.15C51.25 44.5 55 39.2 55 33c0-8.284-6.716-15-15-15z"
        fill={NOPONTO.white}
      />
      {/* Fork tines */}
      <Path
        d="M33 24v13M40 22.5v14.5M47 24v13"
        stroke={NOPONTO.navy}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Circle cx={40} cy={38} r={3.2} fill={NOPONTO.navy} />
    </G>
  );
}

/**
 * Logo No Ponto Food Service — SVG vetorial da marca.
 */
export default function NoPontoLogo({ width = 220, showWordmark = true }: Props) {
  if (!showWordmark) {
    const size = width;
    return (
      <Svg width={size} height={size} viewBox="0 0 80 72" fill="none">
        <BrandMark x={0} y={0} scale={1} />
      </Svg>
    );
  }

  const height = width * 0.48;
  return (
    <Svg width={width} height={height} viewBox="0 0 300 144" fill="none">
      <BrandMark x={168} y={0} scale={0.95} />

      <SvgText
        x={4}
        y={96}
        fill={NOPONTO.cyan}
        fontSize={44}
        fontWeight="700"
        fontFamily="System"
        letterSpacing={-1}
      >
        no
      </SvgText>
      <SvgText
        x={62}
        y={96}
        fill={NOPONTO.white}
        fontSize={44}
        fontWeight="700"
        fontFamily="System"
        letterSpacing={-1}
      >
        ponto
      </SvgText>
      <SvgText
        x={100}
        y={124}
        fill={NOPONTO.white}
        fontSize={10}
        fontWeight="500"
        fontFamily="System"
        letterSpacing={3.6}
      >
        FOOD SERVICE
      </SvgText>
    </Svg>
  );
}
