//
//  Used to generate the rows used for adding states to the structure on the edit page
//

import React, { ReactNode } from 'react';

import Structure, { copyStructure } from '../types/Structure';
import {
  Circle,
  Defs,
  Line,
  Marker,
  Path,
  Svg,
  Text as TextSvg,
} from 'react-native-svg';
import { Text, View } from 'react-native';
import { stateRadius } from './NFADrawing';
import { editIconStyles } from '../styles';
import BasicButton from './BasicButton';
import NFA from '../types/NFA';

const symbolWidth = 130;
const symbolHeight = 80;

const rejectingState = (
  <Svg
    viewBox={`
      ${-symbolWidth / 2}
      ${-symbolHeight / 2}
      ${symbolWidth}
      ${symbolHeight}
    `}
    width={symbolWidth}
    height={symbolHeight}
  >
    <Circle r={stateRadius} fill={'white'} stroke={'black'} strokeWidth={1} />
    <TextSvg textAnchor={'middle'} alignmentBaseline={'middle'}>
      q
    </TextSvg>
  </Svg>
);

const acceptingState = (
  <Svg
    viewBox={`
      ${-symbolWidth / 2}
      ${-symbolHeight / 2}
      ${symbolWidth}
      ${symbolHeight}
    `}
    width={symbolWidth}
    height={symbolHeight}
  >
    <Circle r={stateRadius} fill={'white'} stroke={'black'} strokeWidth={1} />
    <Circle
      r={0.85 * stateRadius}
      fill={'white'}
      stroke={'black'}
      strokeWidth={1}
    />
    <TextSvg textAnchor={'middle'} alignmentBaseline={'middle'}>
      q
    </TextSvg>
  </Svg>
);

const startState = (
  <Svg
    viewBox={`
      ${-symbolWidth / 2}
      ${-symbolHeight / 2}
      ${symbolWidth}
      ${symbolHeight}
    `}
    width={symbolWidth}
    height={symbolHeight}
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
    <Circle r={stateRadius} fill={'white'} stroke={'black'} strokeWidth={1} />
    <Line
      key={'entry'}
      x1={-stateRadius * 2}
      y1={0}
      x2={-stateRadius}
      y2={0}
      stroke={'black'}
      strokeWidth={1}
      markerEnd={'url(#arrow)'}
    />
    <TextSvg textAnchor={'middle'} alignmentBaseline={'middle'}>
      q
    </TextSvg>
  </Svg>
);

type EditIconProps = {
  svg: ReactNode;
  title: string;
  onPress: () => void;
};

// Singluar row for adding something
const EditIcon = (props: EditIconProps) => {
  return (
    <View style={editIconStyles.editIcon}>
      {props.svg}
      <Text>{props.title}</Text>
      <BasicButton small onPress={props.onPress}>
        Add
      </BasicButton>
    </View>
  );
};

// Generates array of different EditIcons depending on the structure type.
const EditIcons = (
  structure: Structure,
  setCurrentStructure: (newStructure: Structure) => void
) => {
  const newStructure = copyStructure(structure);

  // Function used to add a state to the current structure
  const stateAdd = (isStart: boolean, isFinal: boolean) => {
    const newNfa = newStructure.structure as NFA;
    let newId = 0;
    while (newNfa.states.find(state => state.id === newId)) { // Get smallest new id
      newId++;
    }
    newNfa.states.push({
      id: newId,
      name: 'q' + newId,
      isStart: isStart,
      isFinal: isFinal,
    });
    setCurrentStructure(newStructure);
  };

  switch (structure.type) {
    case 'nfa':
      return [
        <EditIcon
          key={1}
          svg={rejectingState}
          title={'Rejecting State'}
          onPress={() => stateAdd(false, false)}
        />,
        <EditIcon
          key={2}
          svg={acceptingState}
          title={'Accepting State'}
          onPress={() => stateAdd(false, true)}
        />,
        <EditIcon
          key={3}
          svg={startState}
          title={'Start State'}
          onPress={() => stateAdd(true, false)}
        />,
      ];
    default:
      return [];
  }
};

export default EditIcons;
