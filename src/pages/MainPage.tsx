//
//  Initial landing page for the app, and where each process can be accessed
//

import React, { useEffect, useRef, useState } from 'react';
import { Alert, PanResponder, Text, TextInput, View } from 'react-native';

import BasicButton from '../components/BasicButton';
import IconButton from '../components/IconButton';
import StructureDrawing, { exportSVG } from '../components/StructureDrawing';
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
  const [textToRun, setTextToRun] = useState(''); // Contains full text that will be ran on the structure (text in text box)
  const [runResult, setRunResult] = useState<boolean | undefined>(undefined);
  const [runCharacterText, setRunCharacterText] = useState(''); // Contains the text that needs to be ran for the next character input
  const [activeIds, setActiveIds] = useState([]);

  // Used for the PanResponder
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

  // Update references when states change
  useEffect(() => {
    scaleRef.current = scale;
    translateXRef.current = translateX;
    translateYRef.current = translateY;
  }, [scale, translateX, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.numberActiveTouches === 1) { // Panning
          setTranslateX(previousTranslateXRef.current - gestureState.dx);
          setTranslateY(previousTranslateYRef.current - gestureState.dy);

          // Reset zoom values in the scenario one finger was lifted off
          initialPinchSize.current = undefined;
          previousScaleRef.current = scaleRef.current;

        } else if (gestureState.numberActiveTouches === 2) { // Zooming and panning
          const touches = event.nativeEvent.touches.map(touch => ({
            x: touch.pageX,
            y: touch.pageY,
          }));

          // Get initial pinch size if not yet defined
          if (!initialPinchSize.current) {
            initialPinchSize.current = Math.sqrt(
              (touches[0].x - touches[1].x) ** 2 +
              (touches[0].y - touches[1].y) ** 2
            );
          }

          // Get new pinch size
          const newPinchSize = Math.sqrt(
            (touches[0].x - touches[1].x) ** 2 +
            (touches[0].y - touches[1].y) ** 2
          );

          setScale(1.6 ** ((initialPinchSize.current - newPinchSize) / 100) * previousScaleRef.current); // Use them to update scale

          // Perform panning
          setTranslateX(previousTranslateXRef.current - gestureState.dx);
          setTranslateY(previousTranslateYRef.current - gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        // Update all previous values, and reset initial pinch size
        previousScaleRef.current = scaleRef.current;
        previousTranslateXRef.current = translateXRef.current;
        previousTranslateYRef.current = translateYRef.current;
        initialPinchSize.current = undefined;
      },
    })
  ).current;

  // Resets all run varaiables, except textToRun as the text box's value can remain
  const resetRunResult = () => {
    setRunResult(undefined);
    setRunCharacterText('');
    setActiveIds([]);
  };

  // Saves the structure
  const save = async () => {
    props.setSavedStructure(props.structure);
    await addToPreviousStructures(props.structure);
    Alert.alert('Structure saved!', undefined, [{ text: 'OK' }]);
  };

  // Simplifies the structure
  const simplifyStructure = async () => {
    switch (props.structure.type) {
      case 'nfa':
        const nfa = props.structure.structure as NFA;
        if (nfa.isDfa) { // Run if the structure is a DFA
          try {
            const result = JSON.parse(await CPPCode.simplifyDFA(nfa)); // Run algorithm
            props.setStructure(result);
            resetRunResult(); // Structure changed so reset run variables
          } catch (error) {
            console.error('Error occured while simplifying structure: ' + error);
          }
        }
        break;
    }
  };

  // Gets a displayable representation of the structure type
  const structureType = () => {
    switch (props.structure.type) {
      case 'nfa':
        return (props.structure.structure as NFA).isDfa ? 'DFA' : 'NFA';
      default:
        return '';
    }
  };

  // Displays either Allowed! or Rejected!
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

  // Runs the next character on the structure
  const runCharacter = async () => {
    if (runCharacterText === textToRun) { // Ran each character, so just run the full thing to get the result
      await runStructure();
    } else {
      try {
        const newText = runCharacterText + textToRun[runCharacterText.length]; // Get text up to new character
        switch (props.structure.type) {
          case 'nfa':
            const nfa = props.structure.structure as NFA;
            const result = await CPPCode.runCharacter(nfa, newText); // Get resulting active ids
            setActiveIds(result);
        }
        setRunCharacterText(newText); // Update variable for next press
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Run full text on the structure
  const runStructure = async () => {
    switch (props.structure.type) {
      case 'nfa':
        const nfa = props.structure.structure as NFA;
        try {
          const result = await CPPCode.runNFAorDFA(nfa, textToRun); // Run algorithm
          setRunResult(result);

          // Reset variables
          setRunCharacterText('');
          setActiveIds([]);
        } catch (error) {
          console.error('Error occured while simplifying structure: ' + error);
        }
        break;
    }
  };

  // Converts an NFA to a DFA
  const convertNFAtoDFA = async () => {
    try {
      const result = JSON.parse(await CPPCode.convertNFAtoDFA(props.structure.structure as NFA)); // Run algorithm
      props.setStructure(result);
      resetRunResult(); // Structure changed so reset run variables
    } catch (error) {
      console.error('Error occured while converting NFA to DFA: ' + error);
    }
  };

  // Generates convert buttons
  const convertButtons = () => {
    switch (props.structure.type) {
      case 'nfa':
        return (props.structure.structure as NFA).isDfa ? ( // DFA is already an NFA so no need to convert
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
          setSvgHeight(event.nativeEvent.layout.height - 2); // The -2 keeps the structure in the borders of the outer container
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
        {svgWidth > 0 && svgHeight > 0 ? ( // Can sometimes be less than 0 when first rendering, which causes an error in the SVG viewbox, crashing the app
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
            resetRunResult(); // Reset run variables
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
      {props.structure.type === 'nfa' && // Check if any convert buttons are needed
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
