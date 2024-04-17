/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';

import { SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { appStyles } from './src/styles.js';

import MainPage from './src/pages/MainPage';
import CameraPage from './src/pages/CameraPage';
import Structure from './src/types/Structure';
// import { getDefaultStructureLocation } from './src/components/StructureDrawing';
import CameraRollPage from './src/pages/CameraRollPage';
import Loading from './src/components/Loading';
import EditPage from './src/pages/EditPage';
import PreviousStructuresPage from './src/pages/PreviousStructuresPage';

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
          // locX: 0,
          // locY: 0,
        },
        {
          id: 1,
          name: 'b',
          isStart: false,
          isFinal: false,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 2,
          name: 'c',
          isStart: false,
          isFinal: false,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 3,
          name: 'd',
          isStart: false,
          isFinal: true,
          // locX: 0,
          // locY: 0,
        },
      ],
      transitions: [
        { id: 0, start: 0, end: 1, token: '1' },
        { id: 1, start: 0, end: 2, token: 'ε' },
        { id: 2, start: 0, end: 3, token: '1' },
        { id: 3, start: 1, end: 3, token: '0' },
        { id: 4, start: 1, end: 3, token: '1' },
        { id: 5, start: 2, end: 3, token: 'ε' },
        { id: 6, start: 3, end: 3, token: '0' },
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
          // locX: 0,
          // locY: 0,
        },
        {
          id: 1,
          name: 'q1',
          isStart: false,
          isFinal: true,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 2,
          name: 'q2',
          isStart: false,
          isFinal: true,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 3,
          name: 'q3',
          isStart: false,
          isFinal: false,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 4,
          name: 'q4',
          isStart: false,
          isFinal: true,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 5,
          name: 'q5',
          isStart: false,
          isFinal: false,
          // locX: 0,
          // locY: 0,
        },
        {
          id: 6,
          name: 'q6',
          isStart: false,
          isFinal: false,
          // locX: 0,
          // locY: 0,
        },
      ],
      transitions: [
        { id: 0, start: 0, end: 3, token: '0' },
        { id: 1, start: 0, end: 1, token: '1' },
        { id: 2, start: 1, end: 2, token: '0' },
        { id: 3, start: 1, end: 5, token: '1' },
        { id: 4, start: 2, end: 2, token: '0' },
        { id: 5, start: 2, end: 5, token: '1' },
        { id: 6, start: 3, end: 0, token: '0' },
        { id: 7, start: 3, end: 4, token: '1' },
        { id: 8, start: 4, end: 2, token: '0' },
        { id: 9, start: 4, end: 5, token: '1' },
        { id: 10, start: 5, end: 5, token: '0' },
        { id: 11, start: 5, end: 5, token: '1' },
        { id: 12, start: 6, end: 6, token: '0' },
        { id: 13, start: 6, end: 6, token: '1' },
      ],
    },
    type: 'nfa',
  },
];

type PageProps = {
  pageNumber: number;
  setPageNumber: (newPageNumber: number) => void;
  structure: Structure;
  setStructure: (newStructure: Structure) => void;
  setIsLoading: (newIsLoading: boolean) => void;
  originalStructure: Structure;
  setOriginalStructure: (newStructure: Structure) => void;
};

const Page = (props: PageProps) => {
  switch (props.pageNumber) {
    case 0:
      return (
        <MainPage
          setPageNumber={props.setPageNumber}
          structure={props.structure}
          setStructure={props.setStructure}
          originalStructure={props.originalStructure}
          setOriginalStructure={props.setOriginalStructure}
        />
      );
    case 1:
      return (
        <CameraPage
          setPageNumber={props.setPageNumber}
          setStructure={props.setStructure}
          setIsLoading={props.setIsLoading}
        />
      );
    case 2:
      return (
        <CameraRollPage
          setPageNumber={props.setPageNumber}
          setIsLoading={props.setIsLoading}
          setStructure={props.setStructure}
        />
      );
    case 3:
      return (
        <EditPage
          setPageNumber={props.setPageNumber}
          structure={props.structure}
          setStructure={props.setStructure}
        />
      );
    case 4:
      return (
        <PreviousStructuresPage
          setPageNumber={props.setPageNumber}
          setStructure={props.setStructure}
        />
      );
    default:
      return <></>;
  }
};

function App(): JSX.Element {
  const [pageNumber, setPageNumber] = useState(0);
  const [structure, setStructure] = useState<Structure>(defaultStructures[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalStructure, setOriginalStructure] = useState<Structure>(
    defaultStructures[0]
  );

  console.log('rerendering');

  useEffect(() => {
    const setDefaultPreviousStructures = async () => {
      try {
        const previousStructures = await AsyncStorage.getItem(
          'previous-structures'
        );
        if (previousStructures === null) {
          await AsyncStorage.setItem(
            'previous-structures',
            JSON.stringify(defaultStructures)
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    // setStructure(getDefaultStructureLocation(structure));
    setStructure(structure);
    setDefaultPreviousStructures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SafeAreaView style={appStyles.container}>
        <StatusBar barStyle={'dark-content'} />
        <Page
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          structure={structure}
          setStructure={setStructure}
          setIsLoading={setIsLoading}
          originalStructure={originalStructure}
          setOriginalStructure={setOriginalStructure}
        />
      </SafeAreaView>
      {isLoading ? <Loading /> : <></>}
    </>
  );
}

export default App;
