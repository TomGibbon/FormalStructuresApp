import React, { useEffect, useState } from 'react';
import { Circle, Line, Path, Text } from 'react-native-svg';
import NFA from '../types/NFA';
import { ActionSheetIOS, Alert } from 'react-native';
import Structure, { copyStructure } from '../types/Structure';

export const stateRadius = 30;
const mainRadiusMultiplier = 2.6;
const duplicateTransitionSplit = Math.PI / 16;
const selfTransitionAngle = Math.PI / 8;
const curveRadius1 = stateRadius / 1.2;
const curveRadius2 = stateRadius / 2;

type TransitionArrow = {
  transitionIds: number[];
  from: number;
  to: number;
  tokenObj: TokenObj;
};

type TokenObj = {
  isCurve: boolean;
  x: number;
  y: number;
  angle: number;
  token: string;
  key: string;
};

export const getDefaultNFALocation = (nfa: NFA) => {
  const newNfa = {
    structure: nfa,
    type: 'nfa',
  };
  const radius =
    (stateRadius * nfa.states.length * mainRadiusMultiplier) / Math.PI;
  for (let i = 0; i < nfa.states.length; i++) {
    newNfa.structure.states[i].locX =
      radius * Math.sin((i * 2 * Math.PI) / nfa.states.length);
    newNfa.structure.states[i].locY =
      -radius * Math.cos((i * 2 * Math.PI) / nfa.states.length);
  }
  return newNfa;
};

const NFADrawing = (
  nfa: NFA,
  editable: boolean,
  setCurrentStructure: (newStructure: Structure) => void,
  activeIds: number[] | undefined
) => {
  let elements = [];
  let transitionArrows: TransitionArrow[] = [];
  const [selectedState, setSelectedState] = useState<number | undefined>(
    undefined
  );
  const [selectedTransitionArrow, setSelectedTransitionArrow] = useState<
    number[] | undefined
  >(undefined);
  const [movingState, setMovingState] = useState<number | undefined>(undefined);
  const [selectingNewTransitionToState, setSelectingNewTransitionToState] =
    useState(false);
  const [selectingTransitionNewToState, setSelectingTransitionNewToState] =
    useState(false);
  const [selectingTransitionNewFromState, setSelectingTransitionNewFromState] =
    useState(false);

  // Reset if editing is turned off
  useEffect(() => {
    if (!editable) {
      setSelectedState(undefined);
      setSelectedTransitionArrow(undefined);
      setMovingState(undefined);
      setSelectingNewTransitionToState(false);
      setSelectingTransitionNewToState(false);
      setSelectingTransitionNewFromState(false);
    }
  }, [editable]);

  const statePress = (id: number) => {
    // Check if user is selecting a state for a new transition
    if (selectingNewTransitionToState) {
      const newStructure = copyStructure({
        structure: nfa,
        type: 'nfa',
      });
      const newNfa = newStructure.structure as NFA;
      Alert.prompt(
        'Enter Text',
        "Enter the token for the new transition to '" +
          nfa.states.find(state => state.id === id)?.name +
          "': ",
        [
          {
            text: 'Cancel',
            onPress: () => {
              setSelectedState(undefined);
              setSelectingNewTransitionToState(false);
            },
            style: 'cancel',
          },
          {
            text: 'Add',
            onPress: text => {
              if (text && text.length === 1) {
                let newId = 0;
                while (
                  newNfa.transitions.find(transition => transition.id === newId)
                ) {
                  newId++;
                }
                const from = selectedState!;
                newNfa.transitions.push({
                  id: newId,
                  from: from,
                  to: id,
                  token: text,
                });
                setCurrentStructure({ structure: newNfa, type: 'nfa' });
              }
              setSelectedState(undefined);
              setSelectingNewTransitionToState(false);
            },
          },
          {
            text: 'ε',
            onPress: () => {
              let newId = 0;
              while (
                newNfa.transitions.find(transition => transition.id === newId)
              ) {
                newId++;
              }
              const from = selectedState!;
              newNfa.transitions.push({
                id: newId,
                from: from,
                to: id,
                token: 'ε',
              });
              setCurrentStructure({ structure: newNfa, type: 'nfa' });
              setSelectedState(undefined);
              setSelectingNewTransitionToState(false);
            },
          },
        ],
        'plain-text'
      );

      // Selecting new To state for selected transitions
    } else if (selectingTransitionNewToState) {
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;
      const transitions = newNfa.transitions.filter(
        transition =>
          selectedTransitionArrow?.find(tId => tId === transition.id) !==
          undefined
      );
      transitions.forEach(transition => (transition.to = id));
      setSelectedTransitionArrow(undefined);
      setSelectingTransitionNewToState(false);
      setCurrentStructure(newStructure);
    } else if (selectingTransitionNewFromState) {
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;
      const transitions = newNfa.transitions.filter(
        transition =>
          selectedTransitionArrow?.find(tId => tId === transition.id) !==
          undefined
      );
      transitions.forEach(transition => (transition.from = id));
      setSelectedTransitionArrow(undefined);
      setSelectingTransitionNewFromState(false);
      setCurrentStructure(newStructure);
    } else if (movingState !== id) {
      setMovingState(undefined); // Stop any other moving state (needed in scenario hasn't yet moved state)
      setSelectedState(id);
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;
      const state = newNfa.states.filter(s => s.id === id)[0];
      const options = [
        'Cancel',
        'Move',
        'Rename',
        "Add Transition From '" + state.name + "'",
      ];
      if (state.isStart) {
        options.push('Remove Start');
      } else {
        options.push('Make Start');
      }
      if (state.isFinal) {
        options.push('Remove Final');
      } else {
        options.push('Make Final');
      }
      options.push('Delete State');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: 6,
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              // Cancel
              setSelectedState(undefined);
              break;
            case 1:
              // Move
              setMovingState(id);
              break;
            case 2:
              // Rename
              Alert.prompt(
                'Enter Text',
                'Enter the new name for the state:',
                [
                  {
                    text: 'Cancel',
                    onPress: () => setSelectedState(undefined),
                    style: 'cancel',
                  },
                  {
                    text: 'Update',
                    onPress: text => {
                      if (text) {
                        state.name = text;
                        setCurrentStructure(newStructure);
                      }
                      setSelectedState(undefined);
                    },
                  },
                ],
                'plain-text',
                state.name
              );
              break;
            case 3:
              // Add transition from
              setSelectingNewTransitionToState(true);
              break;
            case 4:
              // Make start
              state.isStart = !state.isStart;
              setCurrentStructure(newStructure);
              setSelectedState(undefined);
              break;
            case 5:
              // Make final
              state.isFinal = !state.isFinal;
              setCurrentStructure(newStructure);
              setSelectedState(undefined);
              break;
            case 6:
              // Delete
              newNfa.states = newNfa.states.filter(s => s.id !== state.id);
              newNfa.transitions = newNfa.transitions.filter(
                t => t.from !== state.id && t.to !== state.id
              );
              setCurrentStructure(newStructure);
              setSelectedState(undefined);
              break;
          }
        }
      );
    }
  };

  const transitionPress = (ids: number[]) => {
    // Do nothing if user is selecting a state for transition purposes
    if (
      selectingNewTransitionToState ||
      selectingTransitionNewToState ||
      selectingTransitionNewFromState
    ) {
      return;
    }
    setSelectedState(undefined); // If user selected to move a state but has not yet move it, it will still be highlighted
    setSelectedTransitionArrow(ids);
    const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
    const newNfa = newStructure.structure as NFA;
    const transitions = newNfa.transitions.filter(
      transition => ids.find(id => id === transition.id) !== undefined
    );
    const from = transitions[0].from;
    const to = transitions[0].to;
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          'Cancel',
          'Change From',
          'Chage To',
          'Add Token',
          'Remove Token',
        ],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 4,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            // Cancel
            setSelectedTransitionArrow(undefined);
            break;
          case 1:
            // Change From
            setSelectingTransitionNewFromState(true);
            break;
          case 2:
            // Change to
            setSelectingTransitionNewToState(true);
            break;
          case 3:
            // Add token
            Alert.prompt(
              'Enter Text',
              'Enter the new token:',
              [
                {
                  text: 'Cancel',
                  onPress: () => setSelectedTransitionArrow(undefined),
                  style: 'cancel',
                },
                {
                  text: 'Add',
                  onPress: text => {
                    if (text && text.length === 1) {
                      let newId = 0;
                      while (
                        newNfa.transitions.find(
                          transition => transition.id === newId
                        )
                      ) {
                        newId++;
                      }
                      newNfa.transitions.push({
                        id: newId,
                        from: from,
                        to: to,
                        token: text,
                      });
                      setCurrentStructure(newStructure);
                    }
                    setSelectedTransitionArrow(undefined);
                  },
                },
                {
                  text: 'ε',
                  onPress: () => {
                    let newId = 0;
                    while (
                      newNfa.transitions.find(
                        transition => transition.id === newId
                      )
                    ) {
                      newId++;
                    }
                    newNfa.transitions.push({
                      id: newId,
                      from: from,
                      to: to,
                      token: 'ε',
                    });
                    setCurrentStructure(newStructure);
                    setSelectedTransitionArrow(undefined);
                  },
                },
              ],
              'plain-text'
            );
            break;
          case 4:
            // Delete token
            if (transitions.length > 1) {
              Alert.prompt(
                'Enter Text',
                'Enter the token of the transition of which you would like to delete:',
                [
                  {
                    text: 'Cancel',
                    onPress: () => setSelectedTransitionArrow(undefined),
                    style: 'cancel',
                  },
                  {
                    text: 'Delete',
                    onPress: text => {
                      if (text) {
                        const transitionDetected = transitions.find(
                          transition => transition.token === text
                        );
                        if (transitionDetected) {
                          newNfa.transitions = newNfa.transitions.filter(
                            transition =>
                              transition.id !== transitionDetected.id
                          );
                          setCurrentStructure(newStructure);
                        }
                      }
                      setSelectedTransitionArrow(undefined);
                    },
                    style: 'destructive',
                  },
                  {
                    text: 'ε',
                    onPress: () => {
                      const transitionDetected = transitions.find(
                        transition => transition.token === 'ε'
                      );
                      if (transitionDetected) {
                        newNfa.transitions = newNfa.transitions.filter(
                          transition => transition.id !== transitionDetected.id
                        );
                        setCurrentStructure(newStructure);
                      }
                      setSelectedTransitionArrow(undefined);
                    },
                  },
                ],
                'plain-text'
              );
            } else {
              newNfa.transitions = newNfa.transitions.filter(
                transition => transition.id !== transitions[0].id
              );
              setCurrentStructure(newStructure);
              setSelectedTransitionArrow(undefined);
            }
            break;
        }
      }
    );
  };

  const getTokenLine = (
    transitionIds: number[],
    x: number,
    y: number,
    angle: number,
    token: string,
    key: string
  ) => {
    const xAlongArrow = x - 30 * Math.cos(angle);
    const yAlongArrow = y - 30 * Math.sin(angle);

    const leftAngle = angle - Math.PI / 2;
    const finalX = xAlongArrow + 10 * Math.cos(leftAngle);
    const finalY = yAlongArrow + 10 * Math.sin(leftAngle);

    // If text angle is wanted limits are -90 and 90

    return (
      <Text
        key={key}
        x={finalX}
        y={finalY}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        onPress={editable ? () => transitionPress(transitionIds) : undefined}
      >
        {token}
      </Text>
    );
  };

  const getTokenCurve = (
    transitionIds: number[],
    stateX: number,
    stateY: number,
    angle: number,
    token: string,
    key: string
  ) => {
    const ellipseCenterX =
      stateX + (stateRadius + curveRadius1 - 9) * Math.cos(angle); // -9 is not exact
    const ellipseCenterY =
      stateY + (stateRadius + curveRadius1 - 9) * Math.sin(angle);

    const rightAngle = angle + Math.PI / 2;

    const finalX = ellipseCenterX + (curveRadius2 + 10) * Math.cos(rightAngle);
    const finalY = ellipseCenterY + (curveRadius2 + 10) * Math.sin(rightAngle);

    return (
      <Text
        key={key}
        x={finalX}
        y={finalY}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        onPress={editable ? () => transitionPress(transitionIds) : undefined}
      >
        {token}
      </Text>
    );
  };

  // Draw states
  for (let i = 0; i < nfa.states.length; i++) {
    // State circle
    elements.push(
      <Circle
        key={i + 'state'}
        cx={nfa.states[i].locX}
        cy={nfa.states[i].locY}
        r={stateRadius}
        fill={'white'}
        stroke={
          selectedState === nfa.states[i].id
            ? 'blue'
            : activeIds?.find(id => id === nfa.states[i].id) !== undefined
            ? 'red'
            : 'black'
        }
        strokeWidth={1}
        onPress={editable ? () => statePress(nfa.states[i].id) : undefined}
      />
    );

    // State name
    elements.push(
      <Text
        key={i + 'id'}
        x={nfa.states[i].locX}
        y={nfa.states[i].locY}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        onPress={editable ? () => statePress(nfa.states[i].id) : undefined}
      >
        {nfa.states[i].name}
      </Text>
    );

    // Optional inner state circle for final states
    if (nfa.states[i].isFinal) {
      elements.push(
        <Circle
          key={i + 'stateinner'}
          cx={nfa.states[i].locX}
          cy={nfa.states[i].locY}
          r={0.85 * stateRadius}
          fill={'transparent'}
          stroke={
            selectedState === nfa.states[i].id
              ? 'blue'
              : activeIds?.find(id => id === nfa.states[i].id) !== undefined
              ? 'red'
              : 'black'
          }
          strokeWidth={1}
          onPress={editable ? () => statePress(nfa.states[i].id) : undefined}
        />
      );
    }

    // Optional arrow for start states
    if (nfa.states[i].isStart) {
      let angle = Math.atan2(nfa.states[i].locY, nfa.states[i].locX);
      if (
        nfa.transitions.filter(
          transition =>
            transition.from === transition.to &&
            transition.from === nfa.states[i].id
        ).length > 0
      ) {
        angle += Math.PI / 2;
      }
      const x1 = nfa.states[i].locX + 2 * stateRadius * Math.cos(angle);
      const y1 = nfa.states[i].locY + 2 * stateRadius * Math.sin(angle);
      const x2 = nfa.states[i].locX + stateRadius * Math.cos(angle);
      const y2 = nfa.states[i].locY + stateRadius * Math.sin(angle);
      elements.push(
        <Line
          key={i + 'entry'}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={'black'}
          strokeWidth={1}
          markerEnd={'url(#blackArrow)'}
        />
      );
    }
  }

  // Draw transitions
  for (let i = 0; i < nfa.transitions.length; i++) {
    // Check if token needs to be added onto existing transition arrow
    let duplicateTransition = false;
    transitionArrows.forEach(transitionArrow => {
      if (
        transitionArrow.from === nfa.transitions[i].from &&
        transitionArrow.to === nfa.transitions[i].to
      ) {
        duplicateTransition = true;
        let tokenObj = transitionArrow.tokenObj;
        tokenObj.token += ',' + nfa.transitions[i].token;
        transitionArrow.tokenObj = tokenObj;
        transitionArrow.transitionIds.push(nfa.transitions[i].id);
      }
    });
    if (duplicateTransition) {
      continue;
    }

    // Add non-duplicate transitions
    const from = nfa.states.filter(
      state => state.id === nfa.transitions[i].from
    )[0];

    if (nfa.transitions[i].from === nfa.transitions[i].to) {
      // Self transition
      const angle = Math.atan2(from.locY, from.locX);

      const startAngle = angle - selfTransitionAngle;
      const endAngle = angle + selfTransitionAngle;

      const x1 = from.locX + stateRadius * Math.cos(startAngle);
      const y1 = from.locY + stateRadius * Math.sin(startAngle);
      const x2 = from.locX + stateRadius * Math.cos(endAngle);
      const y2 = from.locY + stateRadius * Math.sin(endAngle);

      const angleDeg = (angle * 180) / Math.PI;

      elements.push(
        <Path
          key={i + 'transition'}
          d={`M ${x1} ${y1} A ${curveRadius1} ${curveRadius2} ${angleDeg} 1 1 ${x2} ${y2}`}
          stroke={
            selectedTransitionArrow?.find(
              tArr => tArr === nfa.transitions[i].id
            ) !== undefined
              ? 'blue'
              : 'black'
          }
          strokeWidth={1}
          markerEnd={
            selectedTransitionArrow?.find(
              tArr => tArr === nfa.transitions[i].id
            ) !== undefined
              ? 'url(#blueArrow)'
              : 'url(#blackArrow)'
          }
          fill={'transparent'}
          onPress={
            editable
              ? () => {
                  const transitionIds = transitionArrows
                    .map(tArr => tArr.transitionIds)
                    .find(
                      ids =>
                        ids.find(id => id === nfa.transitions[i].id) !==
                        undefined
                    );
                  if (transitionIds) {
                    transitionPress(transitionIds);
                  } else {
                    console.error('No transition was detected');
                  }
                }
              : undefined
          }
        />
      );

      transitionArrows.push({
        transitionIds: [nfa.transitions[i].id],
        from: nfa.transitions[i].from,
        to: nfa.transitions[i].to,
        tokenObj: {
          isCurve: true,
          x: from.locX,
          y: from.locY,
          angle: angle,
          token: nfa.transitions[i].token,
          key: i + 'token',
        },
      });
    } else {
      // Non-self transition
      const to = nfa.states.filter(
        state => state.id === nfa.transitions[i].to
      )[0];

      const angle = Math.atan2(to.locY - from.locY, to.locX - from.locX);

      let x1;
      let y1;
      let x2;
      let y2;

      if (
        nfa.transitions.filter(
          transition =>
            transition.from === nfa.transitions[i].to &&
            transition.to === nfa.transitions[i].from
        ).length > 0
      ) {
        // Two way transition
        x1 =
          from.locX + stateRadius * Math.cos(angle - duplicateTransitionSplit);
        y1 =
          from.locY + stateRadius * Math.sin(angle - duplicateTransitionSplit);
        x2 = to.locX - stateRadius * Math.cos(angle + duplicateTransitionSplit);
        y2 = to.locY - stateRadius * Math.sin(angle + duplicateTransitionSplit);
      } else {
        // One way transition
        x1 = from.locX + stateRadius * Math.cos(angle);
        y1 = from.locY + stateRadius * Math.sin(angle);
        x2 = to.locX - stateRadius * Math.cos(angle);
        y2 = to.locY - stateRadius * Math.sin(angle);
      }

      elements.push(
        <Line
          key={i + 'transition'}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={
            selectedTransitionArrow?.find(
              tArr => tArr === nfa.transitions[i].id
            ) !== undefined
              ? 'blue'
              : 'black'
          }
          strokeWidth={1}
          markerEnd={
            selectedTransitionArrow?.find(
              tArr => tArr === nfa.transitions[i].id
            ) !== undefined
              ? 'url(#blueArrow)'
              : 'url(#blackArrow)'
          }
          onPress={
            editable
              ? () => {
                  const transitionIds = transitionArrows
                    .map(tArr => tArr.transitionIds)
                    .find(
                      ids =>
                        ids.find(id => id === nfa.transitions[i].id) !==
                        undefined
                    );
                  if (transitionIds) {
                    transitionPress(transitionIds);
                  } else {
                    console.error('No transition was detected');
                  }
                }
              : undefined
          }
        />
      );

      transitionArrows.push({
        transitionIds: [nfa.transitions[i].id],
        from: nfa.transitions[i].from,
        to: nfa.transitions[i].to,
        tokenObj: {
          isCurve: false,
          x: x2,
          y: y2,
          angle: angle,
          token: nfa.transitions[i].token,
          key: i + 'token',
        },
      });
    }
  }

  // Add text from transitionArrows
  transitionArrows.forEach(transitionArrow => {
    if (transitionArrow.tokenObj.isCurve) {
      elements.push(
        getTokenCurve(
          transitionArrow.transitionIds,
          transitionArrow.tokenObj.x,
          transitionArrow.tokenObj.y,
          transitionArrow.tokenObj.angle,
          transitionArrow.tokenObj.token,
          transitionArrow.tokenObj.key
        )
      );
    } else {
      elements.push(
        getTokenLine(
          transitionArrow.transitionIds,
          transitionArrow.tokenObj.x,
          transitionArrow.tokenObj.y,
          transitionArrow.tokenObj.angle,
          transitionArrow.tokenObj.token,
          transitionArrow.tokenObj.key
        )
      );
    }
  });

  return elements;
};

export default NFADrawing;
