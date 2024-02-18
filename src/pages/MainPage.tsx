import React, { useEffect, useRef, useState } from 'react';

import {
  NativeModules,
  PanResponder,
  Text,
  TextInput,
  View,
} from 'react-native';

import BasicButton from '../components/BasicButton';
import IconButton from '../components/IconButton';
import StructureDrawing, {
  getDefaultStructureLocation,
} from '../components/StructureDrawing';
import Structure from '../types/Structure';
import { mainPageStyles } from '../styles.js';

import SaveIcon from '../../res/save_icon.png';
import PhotosIcon from '../../res/photos_icon.png';
import CameraIcon from '../../res/camera_icon.png';
import EditIcon from '../../res/edit_icon.png';
import NFA from '../types/NFA';

const { CPPCode } = NativeModules;
if (!CPPCode) {
  throw new Error('CPPCode is null');
}

const initialPosition = {
  zoom: 1.3,
  x: 0,
  y: 0,
};

type MainPageProps = {
  setPageNumber: (newPage: number) => void;
  structure: Structure;
  setStructure: (newStructure: Structure) => void;
};

const MainPage = (props: MainPageProps) => {
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);
  const [textToRun, setTextToRun] = useState('');
  const [runResult, setRunResult] = useState<boolean | undefined>(undefined);

  const [scale, setScale] = useState(initialPosition.zoom);
  const [translateX, setTranslateX] = useState(initialPosition.x);
  const [translateY, setTranslateY] = useState(initialPosition.x);

  const scaleRef = useRef(initialPosition.zoom);
  const previousScaleRef = useRef(initialPosition.zoom);
  const translateXRef = useRef(initialPosition.x);
  const previousTranslateXRef = useRef(initialPosition.x);
  const translateYRef = useRef(initialPosition.x);
  const previousTranslateYRef = useRef(initialPosition.x);
  const initialPinchSize = useRef<number | undefined>(undefined);

  useEffect(() => {
    scaleRef.current = scale;
    translateXRef.current = translateX;
    translateYRef.current = translateY;
  }, [scale, translateX, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.numberActiveTouches === 1) {
          setTranslateX(previousTranslateXRef.current - gestureState.dx);
          setTranslateY(previousTranslateYRef.current - gestureState.dy);
          initialPinchSize.current = undefined;
          previousScaleRef.current = scaleRef.current;
        } else if (gestureState.numberActiveTouches === 2) {
          const touches = event.nativeEvent.touches.map(touch => ({
            x: touch.pageX,
            y: touch.pageY,
          }));
          if (!initialPinchSize.current) {
            initialPinchSize.current = Math.sqrt(
              (touches[0].x - touches[1].x) ** 2 +
                (touches[0].y - touches[1].y) ** 2
            );
          }
          const newPinchSize = Math.sqrt(
            (touches[0].x - touches[1].x) ** 2 +
              (touches[0].y - touches[1].y) ** 2
          );
          setScale(
            1.6 ** ((initialPinchSize.current - newPinchSize) / 100) *
              previousScaleRef.current
          );
          setTranslateX(previousTranslateXRef.current - gestureState.dx);
          setTranslateY(previousTranslateYRef.current - gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        previousScaleRef.current = scaleRef.current;
        previousTranslateXRef.current = translateXRef.current;
        previousTranslateYRef.current = translateYRef.current;
        initialPinchSize.current = undefined;
      },
    })
  ).current;

  const structureType = () => {
    switch (props.structure.type) {
      case 'nfa':
        return (props.structure.structure as NFA).isDfa ? 'DFA' : 'NFA';
      default:
        return '';
    }
  };

  const runResultText = () => {
    switch (runResult) {
      case undefined:
        return <></>;
      case true:
        // eslint-disable-next-line react-native/no-inline-styles
        return <Text style={{ color: 'green' }}>Allowed!</Text>;
      case false:
        // eslint-disable-next-line react-native/no-inline-styles
        return <Text style={{ color: 'red' }}>Rejected!</Text>;
    }
  };

  const simplifyStructure = async () => {
    switch (props.structure.type) {
      case 'nfa':
        const nfa = props.structure.structure as NFA;
        if (nfa.isDfa) {
          try {
            const result = getDefaultStructureLocation(
              JSON.parse(await CPPCode.simplifyDFA(nfa))
            );
            props.setStructure(result);
          } catch (error) {
            console.error(
              'Error occured while simplifying structure: ' + error
            );
          }
        }
        break;
    }
  };

  const runStructure = async () => {
    switch (props.structure.type) {
      case 'nfa':
        const nfa = props.structure.structure as NFA;
        try {
          const result = await CPPCode.runNFAorDFA(nfa, textToRun);
          setRunResult(result);
        } catch (error) {
          console.error('Error occured while simplifying structure: ' + error);
        }
        break;
    }
  };

  const convertNFAtoDFA = async () => {
    try {
      const result = getDefaultStructureLocation(
        JSON.parse(
          await CPPCode.convertNFAtoDFA(props.structure.structure as NFA)
        )
      );
      props.setStructure(result);
    } catch (error) {
      console.error('Error occured while converting NFA to DFA: ' + error);
    }
  };

  const convertButtons = () => {
    switch (props.structure.type) {
      case 'nfa':
        return (props.structure.structure as NFA).isDfa ? (
          <></>
        ) : (
          <BasicButton
            onPress={convertNFAtoDFA}
            style={mainPageStyles.convertButtonRight}
            small
          >
            DFA
          </BasicButton>
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      <View style={mainPageStyles.mainButtonList}>
        <BasicButton>View Previous Structures</BasicButton>
        <IconButton icon={SaveIcon} />
        <IconButton icon={PhotosIcon} onPress={() => props.setPageNumber(2)} />
        <IconButton icon={CameraIcon} onPress={() => props.setPageNumber(1)} />
      </View>
      <View
        style={mainPageStyles.svgContainer}
        onLayout={event => {
          setSvgWidth(event.nativeEvent.layout.width - 2);
          setSvgHeight(event.nativeEvent.layout.height - 2); // The - 2 keeps the structure in the borders of the outer container
        }}
      >
        <View style={mainPageStyles.editingButtonList}>
          <IconButton icon={EditIcon} small />
          <BasicButton small>Revert To Original Structure</BasicButton>
          <BasicButton onPress={simplifyStructure} small>
            Simplify
          </BasicButton>
        </View>
        {svgWidth > 0 && svgHeight > 0 ? (
          <View
            {...panResponder.panHandlers}
            style={{ height: svgHeight, width: svgWidth }}
          >
            <StructureDrawing
              structure={props.structure}
              svgWidth={svgWidth}
              svgHeight={svgHeight}
              scale={scale}
              translateX={translateX}
              translateY={translateY}
            />
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={mainPageStyles.runList}>
        <View style={mainPageStyles.runText}>
          <Text>Run the {structureType()}:</Text>
          {runResultText()}
        </View>
        <TextInput
          style={mainPageStyles.textInput}
          onChangeText={event => {
            setTextToRun(event);
            setRunResult(undefined);
          }}
          value={textToRun}
        />
        <BasicButton small onPress={runStructure}>
          Run!
        </BasicButton>
      </View>
      <View style={mainPageStyles.convertBox}>
        <Text>Convert to:</Text>
        <View style={mainPageStyles.convertButtonsList}>
          {convertButtons()}
        </View>
      </View>
    </>
  );
};

export default MainPage;
