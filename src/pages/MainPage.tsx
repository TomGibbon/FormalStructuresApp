import React, { useEffect, useRef, useState } from 'react';
import { Alert, PanResponder, Text, TextInput, View } from 'react-native';

import BasicButton from '../components/BasicButton';
import IconButton from '../components/IconButton';
import StructureDrawing, {
  exportSVG,
  // getDefaultStructureLocation,
} from '../components/StructureDrawing';
import Structure from '../types/Structure';
import { mainPageStyles } from '../styles.js';

import SaveIcon from '../../res/save_icon.png';
import PhotosIcon from '../../res/photos_icon.png';
import CameraIcon from '../../res/camera_icon.png';
import ShareIcon from '../../res/share_icon.png';
import EditIcon from '../../res/edit_icon.png';
import NFA from '../types/NFA';
import CPPCode from '../nativeModules';
import { addToPreviousStructures } from '../helperFunctions';

const initialPosition = {
  zoom: 1.3,
  x: 0,
  y: 0,
};

type MainPageProps = {
  setPageNumber: (newPage: number) => void;
  structure: Structure;
  setStructure: (newStructure: Structure) => void;
  savedStructure: Structure;
  setSavedStructure: (newStructure: Structure) => void;
};

const MainPage = (props: MainPageProps) => {
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);
  const [textToRun, setTextToRun] = useState('');
  const [runResult, setRunResult] = useState<boolean | undefined>(undefined);
  const [runStepText, setRunStepText] = useState('');
  const [activeIds, setActiveIds] = useState([]);

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

  const resetRunResult = () => {
    setRunResult(undefined);
    setRunStepText('');
    setActiveIds([]);
  };

  const save = async () => {
    props.setSavedStructure(props.structure);
    await addToPreviousStructures(props.structure);
    Alert.alert('Structure saved!', undefined, [{ text: 'OK' }]);
  };

  const simplifyStructure = async () => {
    switch (props.structure.type) {
      case 'nfa':
        const nfa = props.structure.structure as NFA;
        if (nfa.isDfa) {
          try {
            // const result = getDefaultStructureLocation(
            //   JSON.parse(await CPPCode.simplifyDFA(nfa))
            // );
            const result = JSON.parse(await CPPCode.simplifyDFA(nfa));
            props.setStructure(result);
            resetRunResult();
          } catch (error) {
            console.error(
              'Error occured while simplifying structure: ' + error
            );
          }
        }
        break;
    }
  };

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
        return <Text style={mainPageStyles.resultTextAllowed}>Allowed!</Text>;
      case false:
        return <Text style={mainPageStyles.resultTextRejected}>Rejected!</Text>;
    }
  };

  const runCharacter = async () => {
    if (runStepText === textToRun) {
      await runStructure();
    } else {
      try {
        const newText = runStepText + textToRun[runStepText.length];
        console.log('newText: ' + newText);
        switch (props.structure.type) {
          case 'nfa':
            const nfa = props.structure.structure as NFA;
            const result = await CPPCode.runCharacter(nfa, newText);
            console.log(result);
            setActiveIds(result);
        }
        setRunStepText(newText);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const runStructure = async () => {
    switch (props.structure.type) {
      case 'nfa':
        const nfa = props.structure.structure as NFA;
        try {
          console.log(JSON.stringify(nfa));
          const result = await CPPCode.runNFAorDFA(nfa, textToRun);
          setRunResult(result);
          setRunStepText('');
          setActiveIds([]);
        } catch (error) {
          console.error('Error occured while simplifying structure: ' + error);
        }
        break;
    }
  };

  const convertNFAtoDFA = async () => {
    try {
      // const result = getDefaultStructureLocation(
      //   JSON.parse(
      //     await CPPCode.convertNFAtoDFA(props.structure.structure as NFA)
      //   )
      // );
      const result = JSON.parse(
        await CPPCode.convertNFAtoDFA(props.structure.structure as NFA)
      );
      props.setStructure(result);
      resetRunResult();
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
        <View style={mainPageStyles.titleContainer}>
          <Text style={mainPageStyles.title}>Formal</Text>
          <Text style={mainPageStyles.title}>Structures App</Text>
        </View>
        <IconButton
          icon={ShareIcon}
          onPress={() => exportSVG(props.structure)}
        />
        <BasicButton
          style={mainPageStyles.previousStructuresButton}
          onPress={() => props.setPageNumber(4)}
        >
          Previous Structures
        </BasicButton>
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
          <IconButton
            icon={EditIcon}
            small
            onPress={() => props.setPageNumber(3)}
          />
          <BasicButton
            small
            onPress={() => props.setStructure(props.savedStructure)}
          >
            Use Last Saved Structure
          </BasicButton>
          <IconButton small icon={SaveIcon} onPress={save} />
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
              activeIds={activeIds}
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
            setRunStepText('');
            setActiveIds([]);
          }}
          value={textToRun}
        />
        <BasicButton small style={mainPageStyles.runStep} onPress={runCharacter}>
          Run Character
        </BasicButton>
        <BasicButton small onPress={runStructure}>
          Run!
        </BasicButton>
      </View>
      {props.structure.type === 'nfa' &&
      props.structure.structure?.isDfa === false ? (
        <View style={mainPageStyles.convertBox}>
          <Text>Convert to:</Text>
          <View style={mainPageStyles.convertButtonsList}>
            {convertButtons()}
          </View>
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default MainPage;
