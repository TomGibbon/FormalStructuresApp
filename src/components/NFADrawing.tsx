import React from 'react';
import { Circle, Line, Path, Text } from 'react-native-svg';
import NFA, { Transition } from '../types/NFA';
import { ActionSheetIOS, Alert } from 'react-native';
import Structure, { copyStructure } from '../types/Structure';
// import { getDefaultStructureLocation } from './StructureDrawing';

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

// export const getDefaultNFALocation = (nfa: NFA) => {
//   const newNfa = {
//     structure: nfa,
//     type: 'nfa',
//   };
//   const radius =
//     (stateRadius * nfa.states.length * mainRadiusMultiplier) / Math.PI;
//   for (let i = 0; i < nfa.states.length; i++) {
//     newNfa.structure.states[i].locX =
//       radius * Math.sin((i * 2 * Math.PI) / nfa.states.length);
//     newNfa.structure.states[i].locY =
//       -radius * Math.cos((i * 2 * Math.PI) / nfa.states.length);
//   }
//   return newNfa;
// };

export const exportNFA = (nfa: NFA) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  let transitionArrows: TransitionArrow[] = [];
  let svgElements = '';

  const getTokenLine = (x: number, y: number, angle: number, token: string) => {
    const xAlongArrow = x - 30 * Math.cos(angle);
    const yAlongArrow = y - 30 * Math.sin(angle);

    const leftAngle = angle - Math.PI / 2;
    const finalX = xAlongArrow + 10 * Math.cos(leftAngle);
    const finalY = yAlongArrow + 10 * Math.sin(leftAngle);

    // If text angle is wanted limits are -90 and 90

    return `<text x="${finalX}" y="${finalY}" text-anchor="middle" alignment-baseline="middle" font-family="-apple-system, BlinkMacSystemFont">${token}</text>`;
  };

  const getTokenCurve = (
    stateX: number,
    stateY: number,
    angle: number,
    token: string
  ) => {
    const ellipseCenterX =
      stateX + (stateRadius + curveRadius1 - 9) * Math.cos(angle); // -9 is not exact
    const ellipseCenterY =
      stateY + (stateRadius + curveRadius1 - 9) * Math.sin(angle);

    const rightAngle = angle + Math.PI / 2;

    const finalX = ellipseCenterX + (curveRadius2 + 10) * Math.cos(rightAngle);
    const finalY = ellipseCenterY + (curveRadius2 + 10) * Math.sin(rightAngle);

    return `<text x="${finalX}" y="${finalY}" text-anchor="middle" alignment-baseline="middle" font-family="-apple-system, BlinkMacSystemFont">${token}</text>`;
  };

  const calculateStateLocation = (id: number) => {
    const structureRadius =
      nfa.states.length === 1
        ? 0
        : (stateRadius * nfa.states.length * mainRadiusMultiplier) / Math.PI;
    let index = -1;
    for (let i = 0; i < nfa.states.length; i++) {
      if (nfa.states[i].id === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      return {
        x:
          -structureRadius *
          Math.cos((index * 2 * Math.PI) / nfa.states.length),
        y:
          -structureRadius *
          Math.sin((index * 2 * Math.PI) / nfa.states.length),
      };
    } else {
      return { x: 0, y: 0 };
    }
  };

  // Draw states
  for (let i = 0; i < nfa.states.length; i++) {
    const state = nfa.states[i];
    const location = calculateStateLocation(state.id);

    // State circle
    svgElements += `<circle cx="${location.x}" cy="${location.y}" r="${stateRadius}" fill="white" stroke="black" stroke-width="1" />`;

    minX = Math.min(minX, location.x - stateRadius);
    maxX = Math.max(maxX, location.x + stateRadius);
    minY = Math.min(minY, location.y - stateRadius);
    maxY = Math.max(maxY, location.y + stateRadius);

    // State name
    svgElements += `<text x="${location.x}" y="${location.y}" text-anchor="middle" alignment-baseline="middle" font-family="-apple-system, BlinkMacSystemFont">${nfa.states[i].name}</text>`;

    // Optional inner state circle for final states
    if (state.isFinal) {
      svgElements += `<circle cx="${location.x}" cy="${location.y}" r="${
        0.85 * stateRadius
      }" fill="transparent" stroke="black" stroke-width="1" />`;
    }

    // Optional arrow for start states
    if (state.isStart) {
      let angle = Math.atan2(location.y, location.x);
      if (
        nfa.transitions.filter(
          transition =>
            transition.from === transition.to && transition.from === state.id
        ).length > 0
      ) {
        angle += Math.PI / 2;
      }
      const x1 = location.x + 2 * stateRadius * Math.cos(angle);
      const y1 = location.y + 2 * stateRadius * Math.sin(angle);
      const x2 = location.x + stateRadius * Math.cos(angle);
      const y2 = location.y + stateRadius * Math.sin(angle);
      svgElements += `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke="black" stoke-width="1" marker-end="url(#arrow)" />`;
      // No need to update min and max width, this will be counted for when doing self-transition border.
    }
  }

  // Draw transitions
  for (let i = 0; i < nfa.transitions.length; i++) {
    const transition = nfa.transitions[i];

    // Check if token needs to be added onto existing transition arrow
    let duplicateTransition = false;
    transitionArrows.forEach(transitionArrow => {
      if (
        transitionArrow.from === transition.from &&
        transitionArrow.to === transition.to
      ) {
        duplicateTransition = true;
        let tokenObj = transitionArrow.tokenObj;
        tokenObj.token += ',' + transition.token;
        transitionArrow.tokenObj = tokenObj;
        transitionArrow.transitionIds.push(transition.id);
      }
    });
    if (duplicateTransition) {
      continue;
    }

    // Add non-duplicate transitions
    // const from = nfa.states.filter(
    //   state => state.id === nfa.transitions[i].from
    // )[0];
    const fromLocation = calculateStateLocation(transition.from);

    if (transition.from === transition.to) {
      // Self transition
      const angle = Math.atan2(fromLocation.y, fromLocation.x);

      const startAngle = angle - selfTransitionAngle;
      const endAngle = angle + selfTransitionAngle;

      const x1 = fromLocation.x + stateRadius * Math.cos(startAngle);
      const y1 = fromLocation.y + stateRadius * Math.sin(startAngle);
      const x2 = fromLocation.x + stateRadius * Math.cos(endAngle);
      const y2 = fromLocation.y + stateRadius * Math.sin(endAngle);

      const angleDeg = (angle * 180) / Math.PI;

      svgElements += `<path d="M ${x1} ${y1} A ${curveRadius1} ${curveRadius2} ${angleDeg} 1 1 ${x2} ${y2}" stroke="black" stroke-width="1" marker-end="url(#arrow)" fill="transparent" />`;

      transitionArrows.push({
        transitionIds: [transition.id],
        from: transition.from,
        to: transition.to,
        tokenObj: {
          isCurve: true,
          x: fromLocation.x,
          y: fromLocation.y,
          angle: angle,
          token: transition.token,
          key: i + 'token',
        },
      });
    } else {
      // Non-self transition
      // const to = nfa.states.filter(state => state.id === transition.to)[0];
      const toLocation = calculateStateLocation(transition.to);

      const angle = Math.atan2(
        toLocation.y - fromLocation.y,
        toLocation.x - fromLocation.x
      );

      let x1;
      let y1;
      let x2;
      let y2;

      if (
        nfa.transitions.filter(
          differentTransition =>
            differentTransition.from === transition.to &&
            differentTransition.to === transition.from
        ).length > 0
      ) {
        // Two way transition
        x1 =
          fromLocation.x +
          stateRadius * Math.cos(angle - duplicateTransitionSplit);
        y1 =
          fromLocation.y +
          stateRadius * Math.sin(angle - duplicateTransitionSplit);
        x2 =
          toLocation.x -
          stateRadius * Math.cos(angle + duplicateTransitionSplit);
        y2 =
          toLocation.y -
          stateRadius * Math.sin(angle + duplicateTransitionSplit);
      } else {
        // One way transition
        x1 = fromLocation.x + stateRadius * Math.cos(angle);
        y1 = fromLocation.y + stateRadius * Math.sin(angle);
        x2 = toLocation.x - stateRadius * Math.cos(angle);
        y2 = toLocation.y - stateRadius * Math.sin(angle);
      }

      svgElements += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="1" marker-end="url(#arrow)" />`;

      transitionArrows.push({
        transitionIds: [transition.id],
        from: transition.from,
        to: transition.to,
        tokenObj: {
          isCurve: false,
          x: x2,
          y: y2,
          angle: angle,
          token: transition.token,
          key: i + 'token',
        },
      });
    }
  }

  // Add text from transitionArrows
  transitionArrows.forEach(transitionArrow => {
    if (transitionArrow.tokenObj.isCurve) {
      svgElements += getTokenCurve(
        transitionArrow.tokenObj.x,
        transitionArrow.tokenObj.y,
        transitionArrow.tokenObj.angle,
        transitionArrow.tokenObj.token
      );
    } else {
      svgElements += getTokenLine(
        transitionArrow.tokenObj.x,
        transitionArrow.tokenObj.y,
        transitionArrow.tokenObj.angle,
        transitionArrow.tokenObj.token
      );
    }
  });

  minX -= 2 * curveRadius1; // Add for self transitions
  maxX += 2 * curveRadius1;
  minY -= 2 * curveRadius1;
  maxY += 2 * curveRadius1;

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX: minX,
    minY: minY,
    width: width,
    height: height,
    text: svgElements,
  };
};

const getNewId = (transitions: Transition[]) => {
  let newId = 0;
  while (transitions.find(transition => transition.id === newId)) {
    newId++;
  }
  return newId;
};

const NFADrawing = (
  nfa: NFA,
  editable: boolean,
  setCurrentStructure: (newStructure: Structure) => void,
  activeIds: number[] | undefined,
  selectedState: number | undefined,
  setSelectedState: (newValue: number | undefined) => void,
  selectedTransitionArrow: number[] | undefined,
  setSelectedTransitionArrow: (newValue: number[] | undefined) => void,
  selectingNewTransitionToState: boolean,
  setSelectingNewTransitionToState: (newValue: boolean) => void,
  selectingTransitionNewToState: boolean,
  setSelectingTransitionNewToState: (newValue: boolean) => void,
  selectingTransitionNewFromState: boolean,
  setSelectingTransitionNewFromState: (newValue: boolean) => void
) => {
  let elements = [];
  let transitionArrows: TransitionArrow[] = [];

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
        "Enter the token(s) for the new transition to '" +
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
              if (text) {
                const tokens = text.split(',');
                let validInput = true;
                for (let i = 0; i < tokens.length; i++) {
                  let token = tokens[i];
                  while (token[0] === ' ') {
                    token = token.substring(1);
                  }
                  while (token[token.length - 1] === ' ') {
                    token = token.substring(0, token.length - 1);
                  }
                  if (token.length !== 1) {
                    validInput = false;
                    break;
                  }
                  tokens[i] = token;
                }
                tokens.forEach(token => {
                  if (validInput) {
                    while (token[0] === ' ') {
                      token = token.substring(1);
                    }
                    while (token[token.length - 1] === ' ') {
                      token = token.substring(0, token.length - 1);
                    }
                    if (token.length !== 1) {
                      validInput = false;
                    }
                  }
                });
                if (validInput) {
                  let duplicateTransition = false;
                  tokens.forEach(token => {
                    const newId = getNewId(newNfa.transitions);
                    const from = selectedState!;
                    if (
                      newNfa.transitions.find(
                        transition =>
                          transition.from === from &&
                          transition.to === id &&
                          transition.token === token
                      )
                    ) {
                      if (!duplicateTransition) {
                        Alert.alert('Info', 'Transition(s) already exist', [
                          { text: 'OK' },
                        ]);
                        duplicateTransition = true;
                      }
                    } else {
                      newNfa.transitions.push({
                        id: newId,
                        from: from,
                        to: id,
                        token: token,
                      });
                      setCurrentStructure({ structure: newNfa, type: 'nfa' });
                    }
                  });
                } else {
                  Alert.alert(
                    'Error',
                    'The inputted text was not in the correct format. Tokens should be single characters seperated by commas.',
                    [{ text: 'OK' }]
                  );
                }
              }
              setSelectedState(undefined);
              setSelectingNewTransitionToState(false);
            },
          },
          {
            text: 'ε',
            onPress: () => {
              const newId = getNewId(newNfa.transitions);
              const from = selectedState!;
              if (
                newNfa.transitions.find(
                  transition =>
                    transition.from === from &&
                    transition.to === id &&
                    transition.token === 'ε'
                )
              ) {
                Alert.alert('Info', 'Transition already exists', [
                  { text: 'OK' },
                ]);
              } else {
                newNfa.transitions.push({
                  id: newId,
                  from: from,
                  to: id,
                  token: 'ε',
                });
                setCurrentStructure({ structure: newNfa, type: 'nfa' });
              }
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
      transitions.forEach(transition => {
        if (
          newNfa.transitions.find(
            existingTransition =>
              existingTransition.from === transition.from &&
              existingTransition.to === id &&
              existingTransition.token === transition.token
          )
        ) {
          newNfa.transitions = newNfa.transitions.filter(
            existingTransition => existingTransition.id !== transition.id
          );
        } else {
          transition.to = id;
        }
      });
      setCurrentStructure(newStructure);
      setSelectedTransitionArrow(undefined);
      setSelectingTransitionNewToState(false);
    } else if (selectingTransitionNewFromState) {
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;
      const transitions = newNfa.transitions.filter(
        transition =>
          selectedTransitionArrow?.find(tId => tId === transition.id) !==
          undefined
      );
      transitions.forEach(transition => {
        if (
          newNfa.transitions.find(
            existingTransition =>
              existingTransition.from === id &&
              existingTransition.to === transition.to &&
              existingTransition.token === transition.token
          )
        ) {
          newNfa.transitions = newNfa.transitions.filter(
            existingTransition => existingTransition.id !== transition.id
          );
        } else {
          transition.from = id;
        }
      });
      setSelectedTransitionArrow(undefined);
      setSelectingTransitionNewFromState(false);
      setCurrentStructure(newStructure);
    } else {
      setSelectedState(id);
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;
      const state = newNfa.states.filter(s => s.id === id)[0];
      const options = [
        'Cancel',
        'Rename',
        "Add Transition(s) From '" + state.name + "'",
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
          destructiveButtonIndex: 5,
        },
        buttonIndex => {
          switch (buttonIndex) {
            case 0:
              // Cancel
              setSelectedState(undefined);
              break;
            case 1:
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
            case 2:
              // Add transition from
              setSelectingNewTransitionToState(true);
              break;
            case 3:
              // Make start
              state.isStart = !state.isStart;
              setCurrentStructure(newStructure);
              setSelectedState(undefined);
              break;
            case 4:
              // Make final
              state.isFinal = !state.isFinal;
              setCurrentStructure(newStructure);
              setSelectedState(undefined);
              break;
            case 5:
              // Delete
              Alert.alert(
                'Warning',
                "Are you sure you want to delete state '" +
                  state.name +
                  "'? This will also delete any connected transitions.",
                [
                  {
                    text: 'Delete State',
                    onPress: () => {
                      newNfa.states = newNfa.states.filter(
                        s => s.id !== state.id
                      );
                      newNfa.transitions = newNfa.transitions.filter(
                        t => t.from !== state.id && t.to !== state.id
                      );
                      setCurrentStructure(
                        // getDefaultStructureLocation(newStructure)
                        newStructure
                      );
                      setSelectedState(undefined);
                    },
                    style: 'destructive',
                  },
                  {
                    text: 'Cancel',
                    onPress: () => setSelectedState(undefined),
                    style: 'cancel',
                  },
                ]
              );
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
    const options = ['Cancel', 'Change From', 'Change To', 'Change Tokens'];
    let containsEpsilon: boolean;
    if (transitions.find(transition => transition.token === 'ε')) {
      options.push('Remove ε transition');
      containsEpsilon = true;
    } else {
      options.push('Add ε transition');
      containsEpsilon = false;
    }
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: options,
        cancelButtonIndex: 0,
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
            // Change token
            let placeHolderText = '';
            transitions.forEach(
              transition =>
                (placeHolderText = placeHolderText.concat(
                  transition.token + ','
                ))
            );
            if (placeHolderText.length > 0) {
              placeHolderText = placeHolderText.slice(0, -1);
            }
            Alert.prompt(
              'Enter Text',
              'Enter the new tokens:',
              [
                {
                  text: 'Cancel',
                  onPress: () => setSelectedTransitionArrow(undefined),
                  style: 'cancel',
                },
                {
                  text: 'Update',
                  onPress: text => {
                    let valid = false;
                    const newTransitions: Transition[] = [];
                    let newTokens: string[] = [];
                    if (text) {
                      valid = true;
                      newTokens = text.split(',');
                      for (let i = 0; i < newTokens.length; i++) {
                        let token = newTokens[i];
                        while (token[0] === ' ') {
                          token = token.substring(1);
                        }
                        while (token[token.length - 1] === ' ') {
                          token = token.substring(0, token.length - 1);
                        }
                        if (token.length !== 1) {
                          valid = false;
                          break;
                        }
                        newTokens[i] = token;
                      }
                    }
                    if (valid) {
                      newTokens.forEach(token => {
                        let newId;
                        const currentTransition = transitions.find(
                          transition => transition.token === token
                        );
                        if (currentTransition) {
                          newId = currentTransition.id;
                        } else {
                          newId = getNewId(newNfa.transitions);
                        }
                        newTransitions.push({
                          id: newId,
                          from: from,
                          to: to,
                          token: token,
                        });
                      });
                      newNfa.transitions = newNfa.transitions.filter(
                        newNfaTransition =>
                          transitions.find(
                            transition => transition.id === newNfaTransition.id
                          ) === undefined
                      );
                      newTransitions.forEach(transition =>
                        newNfa.transitions.push(transition)
                      );
                      setCurrentStructure(newStructure);
                    } else {
                      Alert.alert(
                        'Error',
                        'The inputted text was not in the correct format. Tokens should be single characters seperated by commas.',
                        [{ text: 'OK' }]
                      );
                    }
                    setSelectedTransitionArrow(undefined);
                  },
                },
              ],
              'plain-text',
              placeHolderText
            );
            break;
          case 4:
            // Add or remove epsilon transition
            if (containsEpsilon) {
              newNfa.transitions = newNfa.transitions.filter(
                newNfaTransition =>
                  newNfaTransition.token !== 'ε' ||
                  transitions.find(
                    transition => transition.id === newNfaTransition.id
                  ) === undefined
              );
            } else {
              const newId = getNewId(newNfa.transitions);
              newNfa.transitions.push({
                id: newId,
                from: from,
                to: to,
                token: 'ε',
              });
            }
            setCurrentStructure(newStructure);
            setSelectedTransitionArrow(undefined);
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

  const calculateStateLocation = (id: number) => {
    const structureRadius =
      (stateRadius * nfa.states.length * mainRadiusMultiplier) / Math.PI;
    let index = -1;
    for (let i = 0; i < nfa.states.length; i++) {
      if (nfa.states[i].id === id) {
        index = i;
        break;
      }
    }
    if (index !== -1) {
      return {
        x:
          -structureRadius *
          Math.cos((index * 2 * Math.PI) / nfa.states.length),
        y:
          -structureRadius *
          Math.sin((index * 2 * Math.PI) / nfa.states.length),
      };
    } else {
      return { x: 0, y: 0 };
    }
  };

  // Draw states
  for (let i = 0; i < nfa.states.length; i++) {
    const state = nfa.states[i];
    const location = calculateStateLocation(state.id);
    // State circle
    elements.push(
      <Circle
        key={i + 'state'}
        // cx={nfa.states[i].locX}
        cx={location.x}
        // cy={nfa.states[i].locY}
        cy={location.y}
        r={stateRadius}
        fill={'white'}
        stroke={
          selectedState === state.id
            ? 'blue'
            : activeIds?.find(id => id === state.id) !== undefined
            ? 'red'
            : 'black'
        }
        strokeWidth={1}
        onPress={editable ? () => statePress(state.id) : undefined}
      />
    );

    // State name
    elements.push(
      <Text
        key={i + 'id'}
        // x={nfa.states[i].locX}
        x={location.x}
        // y={nfa.states[i].locY}
        y={location.y}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        onPress={editable ? () => statePress(state.id) : undefined}
      >
        {state.name}
      </Text>
    );

    // Optional inner state circle for final states
    if (state.isFinal) {
      elements.push(
        <Circle
          key={i + 'stateinner'}
          // cx={nfa.states[i].locX}
          cx={location.x}
          // cy={nfa.states[i].locY}
          cy={location.y}
          r={0.85 * stateRadius}
          fill={'transparent'}
          stroke={
            selectedState === state.id
              ? 'blue'
              : activeIds?.find(id => id === state.id) !== undefined
              ? 'red'
              : 'black'
          }
          strokeWidth={1}
          onPress={editable ? () => statePress(state.id) : undefined}
        />
      );
    }

    // Optional arrow for start states
    if (state.isStart) {
      let angle = Math.atan2(location.y, location.x);
      if (
        nfa.transitions.filter(
          transition =>
            transition.from === transition.to && transition.from === state.id
        ).length > 0
      ) {
        angle += Math.PI / 2;
      }
      const x1 = location.x + 2 * stateRadius * Math.cos(angle);
      const y1 = location.y + 2 * stateRadius * Math.sin(angle);
      const x2 = location.x + stateRadius * Math.cos(angle);
      const y2 = location.y + stateRadius * Math.sin(angle);
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
    const transition = nfa.transitions[i];

    // Check if token needs to be added onto existing transition arrow
    let duplicateTransition = false;
    transitionArrows.forEach(transitionArrow => {
      if (
        transitionArrow.from === transition.from &&
        transitionArrow.to === transition.to
      ) {
        duplicateTransition = true;
        let tokenObj = transitionArrow.tokenObj;
        tokenObj.token += ',' + transition.token;
        transitionArrow.tokenObj = tokenObj;
        transitionArrow.transitionIds.push(transition.id);
      }
    });
    if (duplicateTransition) {
      continue;
    }

    // Add non-duplicate transitions
    // const from = nfa.states.filter(state => state.id === transition.from)[0];
    const fromLocation = calculateStateLocation(transition.from);

    if (transition.from === transition.to) {
      // Self transition
      const angle = Math.atan2(fromLocation.y, fromLocation.x);

      const startAngle = angle - selfTransitionAngle;
      const endAngle = angle + selfTransitionAngle;

      const x1 = fromLocation.x + stateRadius * Math.cos(startAngle);
      const y1 = fromLocation.y + stateRadius * Math.sin(startAngle);
      const x2 = fromLocation.x + stateRadius * Math.cos(endAngle);
      const y2 = fromLocation.y + stateRadius * Math.sin(endAngle);

      const angleDeg = (angle * 180) / Math.PI;

      elements.push(
        <Path
          key={i + 'transition'}
          d={`M ${x1} ${y1} A ${curveRadius1} ${curveRadius2} ${angleDeg} 1 1 ${x2} ${y2}`}
          stroke={
            selectedTransitionArrow?.find(tArr => tArr === transition.id) !==
            undefined
              ? 'blue'
              : 'black'
          }
          strokeWidth={1}
          markerEnd={
            selectedTransitionArrow?.find(tArr => tArr === transition.id) !==
            undefined
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
                      ids => ids.find(id => id === transition.id) !== undefined
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
        transitionIds: [transition.id],
        from: transition.from,
        to: transition.to,
        tokenObj: {
          isCurve: true,
          x: fromLocation.x,
          y: fromLocation.y,
          angle: angle,
          token: transition.token,
          key: i + 'token',
        },
      });
    } else {
      // Non-self transition
      // const to = nfa.states.filter(
      //   state => state.id === nfa.transitions[i].to
      // )[0];
      const toLocation = calculateStateLocation(transition.to);

      const angle = Math.atan2(
        toLocation.y - fromLocation.y,
        toLocation.x - fromLocation.x
      );

      let x1;
      let y1;
      let x2;
      let y2;

      if (
        nfa.transitions.filter(
          differentTransition =>
            differentTransition.from === transition.to &&
            differentTransition.to === transition.from
        ).length > 0
      ) {
        // Two way transition
        x1 =
          fromLocation.x +
          stateRadius * Math.cos(angle - duplicateTransitionSplit);
        y1 =
          fromLocation.y +
          stateRadius * Math.sin(angle - duplicateTransitionSplit);
        x2 =
          toLocation.x -
          stateRadius * Math.cos(angle + duplicateTransitionSplit);
        y2 =
          toLocation.y -
          stateRadius * Math.sin(angle + duplicateTransitionSplit);
      } else {
        // One way transition
        x1 = fromLocation.x + stateRadius * Math.cos(angle);
        y1 = fromLocation.y + stateRadius * Math.sin(angle);
        x2 = toLocation.x - stateRadius * Math.cos(angle);
        y2 = toLocation.y - stateRadius * Math.sin(angle);
      }

      elements.push(
        <Line
          key={i + 'transition'}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={
            selectedTransitionArrow?.find(tArr => tArr === transition.id) !==
            undefined
              ? 'blue'
              : 'black'
          }
          strokeWidth={1}
          markerEnd={
            selectedTransitionArrow?.find(tArr => tArr === transition.id) !==
            undefined
              ? 'url(#blueArrow)'
              : 'url(#blackArrow)'
          }
          onPress={
            editable
              ? () => {
                  const transitionIds = transitionArrows
                    .map(tArr => tArr.transitionIds)
                    .find(
                      ids => ids.find(id => id === transition.id) !== undefined
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
        transitionIds: [transition.id],
        from: transition.from,
        to: transition.to,
        tokenObj: {
          isCurve: false,
          x: x2,
          y: y2,
          angle: angle,
          token: transition.token,
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
