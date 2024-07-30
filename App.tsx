//
//  Top-level component accessed in the project (equivalent to a main function)
//

import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { appStyles } from './src/styles.js';
import MainPage from './src/pages/MainPage';
import CameraPage from './src/pages/CameraPage';
import Structure from './src/types/Structure';
import CameraRollPage from './src/pages/CameraRollPage';
import Loading from './src/components/Loading';
import EditPage from './src/pages/EditPage';
import PreviousStructuresPage from './src/pages/PreviousStructuresPage';

// 2 default structures added to previously saved structures to begin with
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
        },
        {
          id: 1,
          name: 'b',
          isStart: false,
          isFinal: false,
        },
        {
          id: 2,
          name: 'c',
          isStart: false,
          isFinal: false,
        },
        {
          id: 3,
          name: 'd',
          isStart: false,
          isFinal: true,
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
        },
        {
          id: 1,
          name: 'q1',
          isStart: false,
          isFinal: true,
        },
        {
          id: 2,
          name: 'q2',
          isStart: false,
          isFinal: true,
        },
        {
          id: 3,
          name: 'q3',
          isStart: false,
          isFinal: false,
        },
        {
          id: 4,
          name: 'q4',
          isStart: false,
          isFinal: true,
        },
        {
          id: 5,
          name: 'q5',
          isStart: false,
          isFinal: false,
        },
        {
          id: 6,
          name: 'q6',
          isStart: false,
          isFinal: false,
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
  savedStructure: Structure;
  setSavedStructure: (newStructure: Structure) => void;
};

// Handles which page to display
const Page = (props: PageProps) => {
  switch (props.pageNumber) {
    case 0:
      return (
        <MainPage
          setPageNumber={props.setPageNumber}
          structure={props.structure}
          setStructure={props.setStructure}
          savedStructure={props.savedStructure}
          setSavedStructure={props.setSavedStructure}
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
          setSavedStructure={props.setSavedStructure}
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
  const [savedStructure, setSavedStructure] = useState<Structure>(defaultStructures[0]);

  useEffect(() => {
    const setDefaultPreviousStructures = async () => { // Async function used in useEffect, so must pre-define, then call
      try {
        const previousStructures = await AsyncStorage.getItem('previous-structures'); // Get previous structures

        if (previousStructures === null) { // If no exist, first time opening the app, so set them to be the default structures.
                                           // This will only happen the very first time the app is opened, as AsyncStorage persits over hard app resets.
          await AsyncStorage.setItem('previous-structures', JSON.stringify(defaultStructures));
        }
      } catch (error) {
        console.error(error);
      }
    };
    setDefaultPreviousStructures();
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
          savedStructure={savedStructure}
          setSavedStructure={setSavedStructure}
        />
      </SafeAreaView>
      {isLoading ? <Loading /> : <></>}
    </>
  );
}

export default App;
