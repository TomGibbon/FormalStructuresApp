/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';

import { SafeAreaView, StatusBar } from 'react-native';

import { appStyles } from './src/styles.js';

import MainPage from './src/pages/MainPage';
import CameraPage from './src/pages/CameraPage';
import Structure from './src/types/Structure';
import { getDefaultStructureLocation } from './src/components/StructureDrawing';

const defaultStructures = [
  {
    structure: {
      isDfa: false,
      states: [
        {
          id: 0,
          name: 'a',
          isStart: true,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
        {
          id: 1,
          name: 'b',
          isStart: false,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
        {
          id: 2,
          name: 'c',
          isStart: false,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
        {
          id: 3,
          name: 'd',
          isStart: false,
          isFinal: true,
          locX: -1,
          locY: -1,
        },
      ],
      transitions: [
        { from: 0, to: 1, token: '1' },
        { from: 0, to: 2, token: 'ε' },
        { from: 0, to: 3, token: '1' },
        { from: 1, to: 3, token: '0' },
        { from: 1, to: 3, token: '1' },
        { from: 2, to: 3, token: 'ε' },
        { from: 3, to: 3, token: '0' },
      ],
    },
    type: 'nfa',
  },
  {
    structure: {
      isDfa: true,
      states: [
        {
          id: 0,
          name: 'q0',
          isStart: true,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
        {
          id: 1,
          name: 'q1',
          isStart: false,
          isFinal: true,
          locX: -1,
          locY: -1,
        },
        {
          id: 2,
          name: 'q2',
          isStart: false,
          isFinal: true,
          locX: -1,
          locY: -1,
        },
        {
          id: 3,
          name: 'q3',
          isStart: false,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
        {
          id: 4,
          name: 'q4',
          isStart: false,
          isFinal: true,
          locX: -1,
          locY: -1,
        },
        {
          id: 5,
          name: 'q5',
          isStart: false,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
        {
          id: 6,
          name: 'q6',
          isStart: false,
          isFinal: false,
          locX: -1,
          locY: -1,
        },
      ],
      transitions: [
        { from: 0, to: 3, token: '0' },
        { from: 0, to: 1, token: '1' },
        { from: 1, to: 2, token: '0' },
        { from: 1, to: 5, token: '1' },
        { from: 2, to: 2, token: '0' },
        { from: 2, to: 5, token: '1' },
        { from: 3, to: 0, token: '0' },
        { from: 3, to: 4, token: '1' },
        { from: 4, to: 2, token: '0' },
        { from: 4, to: 5, token: '1' },
        { from: 5, to: 5, token: '0' },
        { from: 5, to: 5, token: '1' },
        { from: 6, to: 6, token: '0' },
        { from: 6, to: 6, token: '1' },
      ],
    },
    type: 'nfa',
  },
];

function App(): JSX.Element {
  const [pageNumber, setPageNumber] = useState<Number>(0);
  const [structure, setStructure] = useState<Structure>(defaultStructures[0]);

  console.log('rerendering');

  useEffect(() => {
    setStructure(getDefaultStructureLocation(structure));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle={'dark-content'} />
      {pageNumber === 0 ? (
        <MainPage
          setPageNumber={setPageNumber}
          structure={structure}
          setStructure={setStructure}
        />
      ) : (
        <CameraPage setPageNumber={setPageNumber} setStructure={setStructure} />
      )}
    </SafeAreaView>
  );
}

export default App;
