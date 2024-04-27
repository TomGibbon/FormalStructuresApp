//
//  Used to generate all the svg components needed when displaying an NFA
//

import React from 'react';
import { ActionSheetIOS, Alert } from 'react-native';
import { Circle, Line, Path, Text } from 'react-native-svg';

import NFA, { Transition } from '../types/NFA';
import Structure, { copyStructure } from '../types/Structure';

export const stateRadius = 30;
const mainRadiusMultiplier = 2.6;
const duplicateTransitionSplit = Math.PI / 16;
const selfTransitionAngle = Math.PI / 8;
const curveRadius1 = stateRadius / 1.2;
const curveRadius2 = stateRadius / 2;

// Object that represents one arrow on the diagram, instead of a singluar transition
type TransitionArrow = {
  transitionIds: number[];
  start: number;
  end: number;
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

// Calculates a state location given its id
const calculateStateLocation = (nfa: NFA, id: number) => {
  const structureRadius = nfa.states.length === 1 ? 0 : (stateRadius * nfa.states.length * mainRadiusMultiplier) / Math.PI; // If only 1 state, it should be centered
  let index = -1;
  for (let i = 0; i < nfa.states.length; i++) {
    if (nfa.states[i].id === id) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    return {
      x: -structureRadius * Math.cos((index * 2 * Math.PI) / nfa.states.length),
      y: -structureRadius * Math.sin((index * 2 * Math.PI) / nfa.states.length),
    };
  } else {
    return { x: 0, y: 0 };
  }
};

// Used to get position of text on a straight line transition
const getTokenLine = (x: number, y: number, angle: number) => {
  const xAlongArrow = x - 30 * Math.cos(angle);
  const yAlongArrow = y - 30 * Math.sin(angle);

  const leftAngle = angle - Math.PI / 2;
  const finalX = xAlongArrow + 10 * Math.cos(leftAngle);
  const finalY = yAlongArrow + 10 * Math.sin(leftAngle);

  return ({
    x: finalX,
    y: finalY
  });
};

// Used to get position of text on a self transition
const getTokenCurve = (x: number, y: number, angle: number) => {
  const ellipseCenterX = x + (stateRadius + curveRadius1 - 9) * Math.cos(angle); // -9 is an estimate instead of a hard calculation
  const ellipseCenterY = y + (stateRadius + curveRadius1 - 9) * Math.sin(angle);

  const rightAngle = angle + Math.PI / 2;

  const finalX = ellipseCenterX + (curveRadius2 + 10) * Math.cos(rightAngle);
  const finalY = ellipseCenterY + (curveRadius2 + 10) * Math.sin(rightAngle);

  return ({
    x: finalX,
    y: finalY
  });
};

// Same functionality as NFADrawing but instead returns information needed for normal SVG (used when sharing)
export const exportNFA = (nfa: NFA) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  let transitionArrows: TransitionArrow[] = [];
  let svgElements = '';

  // Draw states
  for (let i = 0; i < nfa.states.length; i++) {
    const state = nfa.states[i];
    const location = calculateStateLocation(nfa, state.id);

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
      svgElements += `<circle cx="${location.x}" cy="${location.y}" r="${0.85 * stateRadius}" fill="transparent" stroke="black" stroke-width="1" />`;
    }

    // Optional arrow for start states
    if (state.isStart) {
      let angle = Math.atan2(location.y, location.x);
      if (nfa.transitions.filter(transition => transition.start === transition.end && transition.start === state.id).length > 0) {
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
      if (transitionArrow.start === transition.start &&
          transitionArrow.end === transition.end) {
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
    const startLocation = calculateStateLocation(nfa, transition.start);

    if (transition.start === transition.end) {
      // Self transition
      const angle = Math.atan2(startLocation.y, startLocation.x);

      const startAngle = angle - selfTransitionAngle;
      const endAngle = angle + selfTransitionAngle;

      const x1 = startLocation.x + stateRadius * Math.cos(startAngle);
      const y1 = startLocation.y + stateRadius * Math.sin(startAngle);
      const x2 = startLocation.x + stateRadius * Math.cos(endAngle);
      const y2 = startLocation.y + stateRadius * Math.sin(endAngle);

      const angleDeg = (angle * 180) / Math.PI;

      svgElements += `<path d="M ${x1} ${y1} A ${curveRadius1} ${curveRadius2} ${angleDeg} 1 1 ${x2} ${y2}" stroke="black" stroke-width="1" marker-end="url(#arrow)" fill="transparent" />`;

      // Don't draw text now as a transition with same arrow may update the text
      transitionArrows.push({
        transitionIds: [transition.id],
        start: transition.start,
        end: transition.end,
        tokenObj: {
          isCurve: true,
          x: startLocation.x,
          y: startLocation.y,
          angle: angle,
          token: transition.token,
          key: i + 'token',
        },
      });
    } else {
      // Non-self transition
      const endLocation = calculateStateLocation(nfa, transition.end);

      const angle = Math.atan2(endLocation.y - startLocation.y, endLocation.x - startLocation.x);

      let x1;
      let y1;
      let x2;
      let y2;

      if (nfa.transitions.filter(differentTransition =>
                                  differentTransition.start === transition.end &&
                                  differentTransition.end === transition.start
                                ).length > 0) 
      {
        // Two way transition
        x1 = startLocation.x + stateRadius * Math.cos(angle - duplicateTransitionSplit);
        y1 = startLocation.y + stateRadius * Math.sin(angle - duplicateTransitionSplit);
        x2 = endLocation.x - stateRadius * Math.cos(angle + duplicateTransitionSplit);
        y2 = endLocation.y - stateRadius * Math.sin(angle + duplicateTransitionSplit);
      } else {
        // One way transition
        x1 = startLocation.x + stateRadius * Math.cos(angle);
        y1 = startLocation.y + stateRadius * Math.sin(angle);
        x2 = endLocation.x - stateRadius * Math.cos(angle);
        y2 = endLocation.y - stateRadius * Math.sin(angle);
      }

      svgElements += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="1" marker-end="url(#arrow)" />`;

      // Don't draw text now as a transition with same arrow may update the text
      transitionArrows.push({
        transitionIds: [transition.id],
        start: transition.start,
        end: transition.end,
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
    const position = transitionArrow.tokenObj.isCurve
      ? getTokenCurve(
        transitionArrow.tokenObj.x,
        transitionArrow.tokenObj.y,
        transitionArrow.tokenObj.angle
      ) : getTokenLine(
        transitionArrow.tokenObj.x,
        transitionArrow.tokenObj.y,
        transitionArrow.tokenObj.angle,
      );
    svgElements += `<text x="${position.x}" y="${position.y}" text-anchor="middle" alignment-baseline="middle" font-family="-apple-system, BlinkMacSystemFont">${transitionArrow.tokenObj.token}</text>`;
  });

  // Update to account for self transitions
  minX -= 2 * curveRadius1;
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

// Used to generate a new id from a list of transitions
const getNewId = (transitions: Transition[]) => {
  let newId = 0;
  while (transitions.find(transition => transition.id === newId)) {
    newId++;
  }
  return newId;
};

// Returns array of SVG elements to be displayed on the app
const NFADrawing = (
  nfa: NFA,
  editable: boolean,
  setCurrentStructure: (newStructure: Structure) => void,
  activeIds: number[] | undefined,
  selectedState: number | undefined,
  setSelectedState: (newValue: number | undefined) => void,
  selectedTransitionArrow: number[] | undefined,
  setSelectedTransitionArrow: (newValue: number[] | undefined) => void,
  selectingNewTransitionEndState: boolean,
  setSelectingNewTransitionEndState: (newValue: boolean) => void,
  selectingTransitionNewEndState: boolean,
  setSelectingTransitionNewEndState: (newValue: boolean) => void,
  selectingTransitionNewStartState: boolean,
  setSelectingTransitionNewStartState: (newValue: boolean) => void
) => {
  let elements = [];
  let transitionArrows: TransitionArrow[] = [];

  // Function that is run when a state is pressed, with id being the id of the state pressed
  const statePress = (id: number) => {
    // Check if user is selecting a state for a new transition
    if (selectingNewTransitionEndState) {
      const newStructure = copyStructure({
        structure: nfa,
        type: 'nfa',
      });
      const newNfa = newStructure.structure as NFA;
      Alert.prompt(
        'Enter Text',
        "Enter the token(s) for the new transition to '" + nfa.states.find(state => state.id === id)?.name + "': ",
        [
          {
            text: 'Cancel',
            onPress: () => {
              setSelectedState(undefined); // Reset
              setSelectingNewTransitionEndState(false);
            },
            style: 'cancel',
          },
          {
            text: 'Add',
            onPress: text => {
              if (text) {
                const tokens = text.split(','); // Split at comma
                let validInput = true;
                // Remove spacing around each character
                for (let i = 0; i < tokens.length; i++) {
                  let token = tokens[i];
                  // Remove front spacing
                  while (token[0] === ' ') {
                    token = token.substring(1);
                  }
                  // Remove back spacing
                  while (token[token.length - 1] === ' ') {
                    token = token.substring(0, token.length - 1);
                  }
                  // Make sure remaining token is of length 1
                  if (token.length !== 1) {
                    validInput = false;
                    break;
                  }
                  tokens[i] = token;
                }

                if (validInput) {
                  let duplicateTransition = false;
                  tokens.forEach(token => {
                    const newId = getNewId(newNfa.transitions);
                    const start = selectedState!; // statePress is only called in edit mode, so this will not be undefined
                    // Check if transition already exists
                    if (newNfa.transitions.find(
                      transition =>
                        transition.start === start &&
                        transition.end === id &&
                        transition.token === token))
                    {
                      if (!duplicateTransition) { // Only show alert once so check to see if it has already been called
                        Alert.alert('Info', 'Transition(s) already exist', [{ text: 'OK' }]);
                        duplicateTransition = true;
                      }
                    } else {
                      newNfa.transitions.push({
                        id: newId,
                        start: start,
                        end: id,
                        token: token,
                      });
                      setCurrentStructure({ structure: newNfa, type: 'nfa' });
                    }
                  });
                } else {
                  Alert.alert('Error', 'The inputted text was not in the correct format. Tokens should be single characters seperated by commas.', [{ text: 'OK' }]);
                }
              }
              // Should reset regardless
              setSelectedState(undefined);
              setSelectingNewTransitionEndState(false);
            },
          },
          {
            text: 'ε', // Add epsilon transition
            onPress: () => {
              const newId = getNewId(newNfa.transitions);
              const start = selectedState!;
              // Check if transition already exists
              if (newNfa.transitions.find(
                transition =>
                  transition.start === start &&
                  transition.end === id &&
                  transition.token === 'ε'))
              {
                Alert.alert('Info', 'Transition already exists', [{ text: 'OK' }]);
              } else {
                newNfa.transitions.push({
                  id: newId,
                  start: start,
                  end: id,
                  token: 'ε',
                });
                setCurrentStructure({ structure: newNfa, type: 'nfa' });
              }
              // Reset regardless
              setSelectedState(undefined);
              setSelectingNewTransitionEndState(false);
            },
          },
        ],
        'plain-text'
      );

    // Check if selecting new end state for selected transitions
    } else if (selectingTransitionNewEndState) {
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;

      // Get all selected transitions
      const transitions = newNfa.transitions.filter(
        transition => selectedTransitionArrow?.find(tId => tId === transition.id) !== undefined
      );
      transitions.forEach(transition => {
        // If transition with updated end state already exists, just delete it, else update the transition
        if (newNfa.transitions.find(
          existingTransition =>
            existingTransition.start === transition.start &&
            existingTransition.end === id &&
            existingTransition.token === transition.token))
        {
          newNfa.transitions = newNfa.transitions.filter(existingTransition => existingTransition.id !== transition.id);
        } else {
          transition.end = id;
        }
      });
      setCurrentStructure(newStructure);
      // Reset
      setSelectedTransitionArrow(undefined);
      setSelectingTransitionNewEndState(false);

    // Check if selecting new start state for selected transitions
    } else if (selectingTransitionNewStartState) {
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;

      // Get all selected transitions
      const transitions = newNfa.transitions.filter(
        transition => selectedTransitionArrow?.find(tId => tId === transition.id) !== undefined
      );
      transitions.forEach(transition => {
        // If transition with updated start state already exists, just delete it, else update the transition
        if (newNfa.transitions.find(
          existingTransition =>
            existingTransition.start === id &&
            existingTransition.end === transition.end &&
            existingTransition.token === transition.token))
        {
          newNfa.transitions = newNfa.transitions.filter(existingTransition => existingTransition.id !== transition.id);
        } else {
          transition.start = id;
        }
      });
      setSelectedTransitionArrow(undefined);
      // Reset
      setSelectingTransitionNewStartState(false);
      setCurrentStructure(newStructure);

    // Nothing special is happening, just display options
    } else {
      setSelectedState(id);
      const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
      const newNfa = newStructure.structure as NFA;

      // Get state
      const state = newNfa.states.filter(s => s.id === id)[0];

      // Generate options
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
              setSelectingNewTransitionEndState(true);
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
                "Are you sure you want to delete state '" + state.name + "'? This will also delete any connected transitions.",
                [
                  {
                    text: 'Delete State',
                    onPress: () => {
                      newNfa.states = newNfa.states.filter(s => s.id !== id); // Remove state
                      newNfa.transitions = newNfa.transitions.filter(t => t.start !== id && t.end !== id); // Remove all transitions connected to state
                      setCurrentStructure(newStructure);
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

  // Function performs everytime a transition (arrow) is pressed
  const transitionPress = (ids: number[]) => {
    // Do nothing if user is selecting a state for transition purposes
    if (selectingNewTransitionEndState ||
        selectingTransitionNewEndState ||
        selectingTransitionNewStartState)
    {
      return;
    }
    setSelectedState(undefined); // If user selected to move a state but has not yet move it, it will still be highlighted
    setSelectedTransitionArrow(ids);
    const newStructure = copyStructure({ structure: nfa, type: 'nfa' });
    const newNfa = newStructure.structure as NFA;

    // Get all transitions related to arrow
    const transitions = newNfa.transitions.filter(
      transition => ids.find(id => id === transition.id) !== undefined
    );
    const start = transitions[0].start;
    const end = transitions[0].end;

    // Generate options
    const options = ['Cancel', 'Change Start', 'Change End', 'Change Tokens'];
    let containsEpsilon;
    if (transitions.find(transition => transition.token === 'ε')) {
      options.push('Remove ε transition');
      containsEpsilon = true;
    } else {
      options.push('Add ε Transition');
      containsEpsilon = false;
    }
    options.push('Delete Transition(s)');

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
            setSelectedTransitionArrow(undefined);
            break;
          case 1:
            // Change Start
            setSelectingTransitionNewStartState(true);
            break;
          case 2:
            // Change End
            setSelectingTransitionNewEndState(true);
            break;
          case 3:
            // Change token
            let placeHolderText = '';
            transitions.forEach(transition => (placeHolderText = placeHolderText.concat(transition.token + ','))); // Get all current tokens seperated by comma
            if (placeHolderText.length > 0) { // Remove last comma
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
                    let newTokens: string[] = [];
                    if (text) {
                      valid = true;
                      newTokens = text.split(','); // Split at comma
                      // Remove all spacing around tokens
                      for (let i = 0; i < newTokens.length; i++) {
                        let token = newTokens[i];
                        // Remove spacing before
                        while (token[0] === ' ') {
                          token = token.substring(1);
                        }
                        // Remove spacing after
                        while (token[token.length - 1] === ' ') {
                          token = token.substring(0, token.length - 1);
                        }
                        // Remaining token should be of length 1
                        if (token.length !== 1) {
                          valid = false;
                          break;
                        }
                        newTokens[i] = token;
                      }
                    }
                    if (valid) {
                      const newTransitions: Transition[] = [];
                      newTokens.forEach(token => {
                        let newId;
                        // If current transition already exists with this id, set new id to be the same one, as it will be re-added after being initially deleted
                        const currentTransition = transitions.find(transition => transition.token === token);
                        if (currentTransition) {
                          newId = currentTransition.id;
                        } else {
                          newId = getNewId(newNfa.transitions);
                        }
                        // Add new transition to be added
                        newTransitions.push({
                          id: newId,
                          start: start,
                          end: end,
                          token: token,
                        });
                      });
                      // Delete existing transitions
                      newNfa.transitions = newNfa.transitions.filter(
                        newNfaTransition =>
                          transitions.find(transition => transition.id === newNfaTransition.id) === undefined
                      );
                      // Add new transitions
                      newTransitions.forEach(transition =>
                        newNfa.transitions.push(transition)
                      );
                      setCurrentStructure(newStructure);
                    } else {
                      Alert.alert('Error', 'The inputted text was not in the correct format. Tokens should be single characters seperated by commas.', [{ text: 'OK' }]);
                    }
                    // Reset
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
              // Filter out all epsilon transitions from the selected transitions
              newNfa.transitions = newNfa.transitions.filter(
                newNfaTransition =>
                  newNfaTransition.token === 'ε' && transitions.find(transition => transition.id === newNfaTransition.id) !== undefined
              );
            } else {
              // Create a new epsilon transition
              const newId = getNewId(newNfa.transitions);
              newNfa.transitions.push({
                id: newId,
                start: start,
                end: end,
                token: 'ε',
              });
            }
            setCurrentStructure(newStructure);
            setSelectedTransitionArrow(undefined); // Reset
            break;
          case 5:
            // Delete transition(s)
            Alert.alert(
              'Warning',
              'Are you sure you want to delete these transition(s)?',
              [
                {
                  text: 'Delete Transition(s)',
                  onPress: () => {
                    // Filter out transition
                    newNfa.transitions = newNfa.transitions.filter(
                      t => transitions.find(selectedTransition => selectedTransition.id === t.id) === undefined
                    );
                    setCurrentStructure(newStructure);
                    setSelectedState(undefined); // Reset
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
  };

  // Draw states
  for (let i = 0; i < nfa.states.length; i++) {
    const state = nfa.states[i];
    const location = calculateStateLocation(nfa, state.id);
    // State circle
    elements.push(
      <Circle
        key={i + 'state'}
        cx={location.x}
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
        onPress={editable ? () => statePress(state.id) : undefined} // Only do something if in edit mode
      />
    );

    // State name
    elements.push(
      <Text
        key={i + 'id'}
        x={location.x}
        y={location.y}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        onPress={editable ? () => statePress(state.id) : undefined} // Only do something if in edit mode
      >
        {state.name}
      </Text>
    );

    // Optional inner state circle for final states
    if (state.isFinal) {
      elements.push(
        <Circle
          key={i + 'stateinner'}
          cx={location.x}
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
          onPress={editable ? () => statePress(state.id) : undefined} // Only do something if in edit mode
        />
      );
    }

    // Optional arrow for start states
    if (state.isStart) {
      let angle = Math.atan2(location.y, location.x);
      if (nfa.transitions.filter(transition =>
        transition.start === transition.end &&
        transition.start === state.id
      ).length > 0) {
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
      if (transitionArrow.start === transition.start &&
          transitionArrow.end === transition.end
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
    const startLocation = calculateStateLocation(nfa, transition.start);

    if (transition.start === transition.end) {
      // Self transition
      const angle = Math.atan2(startLocation.y, startLocation.x);

      const startAngle = angle - selfTransitionAngle;
      const endAngle = angle + selfTransitionAngle;

      const x1 = startLocation.x + stateRadius * Math.cos(startAngle);
      const y1 = startLocation.y + stateRadius * Math.sin(startAngle);
      const x2 = startLocation.x + stateRadius * Math.cos(endAngle);
      const y2 = startLocation.y + stateRadius * Math.sin(endAngle);

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
                    .find(ids => ids.find(id => id === transition.id) !== undefined);
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

      // Don't draw text now as a transition with same arrow may update the text
      transitionArrows.push({
        transitionIds: [transition.id],
        start: transition.start,
        end: transition.end,
        tokenObj: {
          isCurve: true,
          x: startLocation.x,
          y: startLocation.y,
          angle: angle,
          token: transition.token,
          key: i + 'token',
        },
      });
    } else {
      // Non-self transition
      const endLocation = calculateStateLocation(nfa, transition.end);

      const angle = Math.atan2(endLocation.y - startLocation.y, endLocation.x - startLocation.x);

      let x1;
      let y1;
      let x2;
      let y2;

      // Check if two-way transition
      if (nfa.transitions.filter(
        differentTransition =>
          differentTransition.start === transition.end &&
          differentTransition.end === transition.start
      ).length > 0) {
        // Two way transition
        x1 = startLocation.x + stateRadius * Math.cos(angle - duplicateTransitionSplit);
        y1 = startLocation.y + stateRadius * Math.sin(angle - duplicateTransitionSplit);
        x2 = endLocation.x - stateRadius * Math.cos(angle + duplicateTransitionSplit);
        y2 = endLocation.y - stateRadius * Math.sin(angle + duplicateTransitionSplit);
      } else {
        // One way transition
        x1 = startLocation.x + stateRadius * Math.cos(angle);
        y1 = startLocation.y + stateRadius * Math.sin(angle);
        x2 = endLocation.x - stateRadius * Math.cos(angle);
        y2 = endLocation.y - stateRadius * Math.sin(angle);
      }

      elements.push(
        <Line
          key={i + 'transition'}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={
            selectedTransitionArrow?.find(tArr => tArr === transition.id) !== undefined
              ? 'blue'
              : 'black'
          }
          strokeWidth={1}
          markerEnd={
            selectedTransitionArrow?.find(tArr => tArr === transition.id) !== undefined
              ? 'url(#blueArrow)'
              : 'url(#blackArrow)'
          }
          onPress={
            editable
              ? () => {
                  const transitionIds = transitionArrows
                    .map(tArr => tArr.transitionIds)
                    .find(ids => ids.find(id => id === transition.id) !== undefined);
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

      // Don't draw text now as a transition with same arrow may update the text
      transitionArrows.push({
        transitionIds: [transition.id],
        start: transition.start,
        end: transition.end,
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
    const position = transitionArrow.tokenObj.isCurve
      ? getTokenCurve(
        transitionArrow.tokenObj.x,
        transitionArrow.tokenObj.y,
        transitionArrow.tokenObj.angle
      ) : getTokenLine(
        transitionArrow.tokenObj.x,
        transitionArrow.tokenObj.y,
        transitionArrow.tokenObj.angle
      );
    elements.push(
      <Text
        key={transitionArrow.tokenObj.key}
        x={position.x}
        y={position.y}
        textAnchor={'middle'}
        alignmentBaseline={'middle'}
        onPress={editable ? () => transitionPress(transitionArrow.transitionIds) : undefined}
      >
        {transitionArrow.tokenObj.token}
      </Text>
    );
  });

  return elements;
};

export default NFADrawing;
