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
import CameraRollPage from './src/pages/CameraRollPage';
import Loading from './src/components/Loading';
import EditPage from './src/pages/EditPage';

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
          locX: 0,
          locY: 0,
        },
        {
          id: 1,
          name: 'b',
          isStart: false,
          isFinal: false,
          locX: 0,
          locY: 0,
        },
        {
          id: 2,
          name: 'c',
          isStart: false,
          isFinal: false,
          locX: 0,
          locY: 0,
        },
        {
          id: 3,
          name: 'd',
          isStart: false,
          isFinal: true,
          locX: 0,
          locY: 0,
        },
      ],
      transitions: [
        { id: 0, from: 0, to: 1, token: '1' },
        { id: 1, from: 0, to: 2, token: 'ε' },
        { id: 2, from: 0, to: 3, token: '1' },
        { id: 3, from: 1, to: 3, token: '0' },
        { id: 4, from: 1, to: 3, token: '1' },
        { id: 5, from: 2, to: 3, token: 'ε' },
        { id: 6, from: 3, to: 3, token: '0' },
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
          locX: 0,
          locY: 0,
        },
        {
          id: 1,
          name: 'q1',
          isStart: false,
          isFinal: true,
          locX: 0,
          locY: 0,
        },
        {
          id: 2,
          name: 'q2',
          isStart: false,
          isFinal: true,
          locX: 0,
          locY: 0,
        },
        {
          id: 3,
          name: 'q3',
          isStart: false,
          isFinal: false,
          locX: 0,
          locY: 0,
        },
        {
          id: 4,
          name: 'q4',
          isStart: false,
          isFinal: true,
          locX: 0,
          locY: 0,
        },
        {
          id: 5,
          name: 'q5',
          isStart: false,
          isFinal: false,
          locX: 0,
          locY: 0,
        },
        {
          id: 6,
          name: 'q6',
          isStart: false,
          isFinal: false,
          locX: 0,
          locY: 0,
        },
      ],
      transitions: [
        { id: 0, from: 0, to: 3, token: '0' },
        { id: 1, from: 0, to: 1, token: '1' },
        { id: 2, from: 1, to: 2, token: '0' },
        { id: 3, from: 1, to: 5, token: '1' },
        { id: 4, from: 2, to: 2, token: '0' },
        { id: 5, from: 2, to: 5, token: '1' },
        { id: 6, from: 3, to: 0, token: '0' },
        { id: 7, from: 3, to: 4, token: '1' },
        { id: 8, from: 4, to: 2, token: '0' },
        { id: 9, from: 4, to: 5, token: '1' },
        { id: 10, from: 5, to: 5, token: '0' },
        { id: 11, from: 5, to: 5, token: '1' },
        { id: 12, from: 6, to: 6, token: '0' },
        { id: 13, from: 6, to: 6, token: '1' },
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
    setStructure(getDefaultStructureLocation(structure));
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
