import React from 'react';

import { Defs, Marker, Path, Svg } from 'react-native-svg';

import Structure from '../types/Structure';
import NFADrawing, { exportNFA, getDefaultNFALocation } from './NFADrawing';
import NFA from '../types/NFA';
import RNFS from 'react-native-fs';
import { Share } from 'react-native';

type StructureDrawingProps = {
  structure: Structure;
  svgWidth: number;
  svgHeight: number;
  scale: number;
  translateX: number;
  translateY: number;
  editable?: boolean;
  setCurrentStructure?: (newStructure: Structure) => void;
  activeIds?: number[];
};

export const getDefaultStructureLocation = (structure: Structure) => {
  switch (structure.type) {
    case 'nfa':
      return getDefaultNFALocation(structure.structure as NFA);
    default:
      return structure;
  }
};

export const exportSVG = (structure: Structure) => {
  let content = '';
  switch (structure.type) {
    case 'nfa':
      const result = exportNFA(structure.structure as NFA);
      content += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-result.width} ${-result.height} ${
        result.width * 2
      } ${
        result.height * 2
      }"><defs><marker id="arrow" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto" ><path d="M0,0 L10,5 L0,10" fill="black" /></marker></defs>`;
      content += result.text;
      break;
    default:
      console.error('Could not export');
      return;
  }
  content += '</svg>';
  const path = RNFS.DocumentDirectoryPath + '/Structure_SVG.svg';
  RNFS.writeFile(
    RNFS.DocumentDirectoryPath + '/Structure_SVG.svg',
    content,
    'utf8'
  )
    .then(() => {
      Share.share({
        url: path,
        title: 'Share structure svg',
      });
    })
    .catch(err => {
      console.log(err.message);
    });
};

const StructureDrawing = (props: StructureDrawingProps) => {
  props.editable = props.editable ?? false;
  const defaultSetCurrentStructure = () => {};
  props.setCurrentStructure =
    props.setCurrentStructure ?? defaultSetCurrentStructure;

  let elements: JSX.Element[] = [];

  switch (props.structure.type) {
    case 'nfa':
      elements = NFADrawing(
        props.structure.structure as NFA,
        props.editable,
        props.setCurrentStructure,
        props.activeIds
      );
      break;
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
          id="blackArrow"
          markerWidth={10}
          markerHeight={10}
          orient={'auto'}
          refX={10}
          refY={5}
        >
          <Path d="M0,0 L10,5 L0,10" fill="black" />
        </Marker>
        <Marker
          id="blueArrow"
          markerWidth={10}
          markerHeight={10}
          orient={'auto'}
          refX={10}
          refY={5}
        >
          <Path d="M0,0 L10,5 L0,10" fill="blue" />
        </Marker>
      </Defs>
      {elements}
    </Svg>
  );
};

export default StructureDrawing;
