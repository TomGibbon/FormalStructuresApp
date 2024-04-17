import React from 'react';

import { Defs, Marker, Path, Svg } from 'react-native-svg';

import Structure from '../types/Structure';
import NFADrawing, { exportNFA } from './NFADrawing';
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
  selectedState?: number | undefined;
  setSelectedState?: (newValue: number | undefined) => void;
  selectedTransitionArrow?: number[] | undefined;
  setSelectedTransitionArrow?: (newValue: number[] | undefined) => void;
  selectingNewTransitionEndState?: boolean;
  setSelectingNewTransitionEndState?: (newValue: boolean) => void;
  selectingTransitionNewEndState?: boolean;
  setSelectingTransitionNewEndState?: (newValue: boolean) => void;
  selectingTransitionNewStartState?: boolean;
  setSelectingTransitionNewStartState?: (newValue: boolean) => void;
};

// export const getDefaultStructureLocation = (structure: Structure) => {
//   switch (structure.type) {
//     case 'nfa':
//       return getDefaultNFALocation(structure.structure as NFA);
//     default:
//       return structure;
//   }
// };

export const exportSVG = (structure: Structure) => {
  let content = '';
  switch (structure.type) {
    case 'nfa':
      const result = exportNFA(structure.structure as NFA);
      content += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${result.minX} ${result.minY} ${result.width} ${result.height}"><defs><marker id="arrow" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto" ><path d="M0,0 L10,5 L0,10" fill="black" /></marker></defs>`;
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
  const editable = props.editable ?? false;
  const defaultSetFunction = () => {};
  const setCurrentStructure = props.setCurrentStructure ?? defaultSetFunction;
  const setSelectedState = props.setSelectedState ?? defaultSetFunction;
  const setSelectedTransitionArrow =
    props.setSelectedTransitionArrow ?? defaultSetFunction;
  const selectingNewTransitionEndState =
    props.selectingNewTransitionEndState ?? false;
  const selectingTransitionNewStartState =
    props.selectingTransitionNewStartState ?? false;
  const selectingTransitionNewEndState =
    props.selectingTransitionNewEndState ?? false;
  const setSelectingNewTransitionEndState =
    props.setSelectingNewTransitionEndState ?? defaultSetFunction;
  const setSelectingTransitionNewStartState =
    props.setSelectingTransitionNewStartState ?? defaultSetFunction;
  const setSelectingTransitionNewEndState =
    props.setSelectingTransitionNewEndState ?? defaultSetFunction;

  let elements: JSX.Element[] = [];

  switch (props.structure.type) {
    case 'nfa':
      elements = NFADrawing(
        props.structure.structure as NFA,
        editable,
        setCurrentStructure,
        props.activeIds,
        props.selectedState,
        setSelectedState,
        props.selectedTransitionArrow,
        setSelectedTransitionArrow,
        selectingNewTransitionEndState,
        setSelectingNewTransitionEndState,
        selectingTransitionNewEndState,
        setSelectingTransitionNewEndState,
        selectingTransitionNewStartState,
        setSelectingTransitionNewStartState
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
