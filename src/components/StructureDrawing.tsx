import React from 'react';

import { Defs, Marker, Path, Svg } from 'react-native-svg';

import Structure from '../types/Structure';
import NFADrawing, { getDefaultNFALocation } from './NFADrawing';
import NFA from '../types/NFA';

type StructureDrawingProps = {
  structure: Structure;
  svgWidth: number;
  svgHeight: number;
  scale: number;
  translateX: number;
  translateY: number;
};

export const getDefaultStructureLocation = (structure: Structure) => {
  if (structure.type === 'nfa') {
    return getDefaultNFALocation(structure.structure as NFA);
  } else {
    return structure;
  }
};

const StructureDrawing = (props: StructureDrawingProps) => {
  let elements: JSX.Element[] = [];

  if (props.structure.type === 'nfa') {
    elements = NFADrawing(props.structure.structure as NFA);
  }

  return (
    <Svg
      viewBox={`
        ${-(props.scale * props.svgWidth) / 2 + props.translateX * props.scale}
        ${-(props.scale * props.svgHeight) / 2 + props.translateY * props.scale}
        ${props.scale * props.svgWidth}
        ${props.scale * props.svgHeight}
      `}
    >
      <Defs>
        <Marker
          id="arrow"
          markerWidth={10}
          markerHeight={10}
          orient={'auto'}
          refX={10}
          refY={5}
        >
          <Path d="M0,0 L10,5 L0,10" fill="black" />
        </Marker>
      </Defs>
      {elements}
    </Svg>
  );
};

export default StructureDrawing;
