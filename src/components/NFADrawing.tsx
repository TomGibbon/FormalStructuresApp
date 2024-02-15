import React from 'react';
import { Circle, Line, Path, Text } from 'react-native-svg';
import NFA from '../types/NFA';

const stateRadius = 30;
const mainRadiusMultiplier = 2.6;
const duplicateTransitionSplit = Math.PI / 16;
const selfTransitionAngle = Math.PI / 8;
const curveRadius1 = stateRadius / 1.2;
const curveRadius2 = stateRadius / 2;

type TransitionObj = {
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

const getTokenLine = (
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
    >
      {token}
    </Text>
  );
};

const getTokenCurve = (
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
    >
      {token}
    </Text>
  );
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

const NFADrawing = (nfa: NFA) => {
  let elements = [];
  let transitions: TransitionObj[] = [];

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
        stroke={'black'}
        strokeWidth={1}
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
          stroke={'black'}
          strokeWidth={1}
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
          key={'entry'}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={'black'}
          strokeWidth={1}
          markerEnd={'url(#arrow)'}
        />
      );
    }
  }

  // Draw transitions
  for (let i = 0; i < nfa.transitions.length; i++) {
    let duplicateTransition = false;
    transitions.forEach(transition => {
      if (
        transition.from === nfa.transitions[i].from &&
        transition.to === nfa.transitions[i].to
      ) {
        duplicateTransition = true;
        let tokenObj = transition.tokenObj;
        tokenObj.token += ',' + nfa.transitions[i].token;
        transition.tokenObj = tokenObj;
      }
    });

    if (duplicateTransition) {
      continue;
    }

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
          stroke={'black'}
          strokeWidth={1}
          markerEnd={'url(#arrow)'}
          fill={'transparent'}
        />
      );

      transitions.push({
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
          stroke={'black'}
          strokeWidth={1}
          markerEnd={'url(#arrow)'}
        />
      );

      transitions.push({
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

  transitions.forEach(transition => {
    if (transition.tokenObj.isCurve) {
      elements.push(
        getTokenCurve(
          transition.tokenObj.x,
          transition.tokenObj.y,
          transition.tokenObj.angle,
          transition.tokenObj.token,
          transition.tokenObj.key
        )
      );
    } else {
      elements.push(
        getTokenLine(
          transition.tokenObj.x,
          transition.tokenObj.y,
          transition.tokenObj.angle,
          transition.tokenObj.token,
          transition.tokenObj.key
        )
      );
    }
  });

  return elements;
};

export default NFADrawing;
