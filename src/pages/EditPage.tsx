import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Alert, PanResponder, Text } from 'react-native';
import _ from 'lodash';

import Structure, { copyStructure } from '../types/Structure';
import IconButton from '../components/IconButton';
import SaveIcon from '../../res/save_icon.png';
import CloseIcon from '../../res/close_icon.png';
import { editPageStyles } from '../styles';
import StructureDrawing from '../components/StructureDrawing';
import EditIcons from '../components/EditIcons';
import BasicButton from '../components/BasicButton';
import CPPCode from '../nativeModules';
import NFA from '../types/NFA';
import { addToPreviousStructures } from '../helperFunctions';

const initialPosition = {
  zoom: 1.3,
  x: 0,
  y: 0,
};

type EditPageProps = {
  setPageNumber: (newPageNumber: number) => void;
  structure: Structure;
  setStructure: (newStructure: Structure) => void;
};

const EditPage = (props: EditPageProps) => {
  const [currentStructure, setCurrentStructure] = useState<Structure>(
    copyStructure(props.structure)
  );
  const [editing, setEditing] = useState(false);
  const [svgWidth, setSvgWidth] = useState(0);
  const [svgHeight, setSvgHeight] = useState(0);

  const [selectedState, setSelectedState] = useState<number | undefined>(
    undefined
  );
  const [selectedTransitionArrow, setSelectedTransitionArrow] = useState<
    number[] | undefined
  >(undefined);
  const [selectingNewTransitionEndState, setSelectingNewTransitionEndState] =
    useState(false);
  const [
    selectingTransitionNewStartState,
    setSelectingTransitionNewStartState,
  ] = useState(false);
  const [selectingTransitionNewEndState, setSelectingTransitionNewEndState] =
    useState(false);

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

  // Reset if editing is turned off
  useEffect(() => {
    if (editing === false) {
      setSelectedState(undefined);
      setSelectedTransitionArrow(undefined);
      setSelectingNewTransitionEndState(false);
      setSelectingTransitionNewEndState(false);
      setSelectingTransitionNewStartState(false);
    }
  }, [editing]);

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

  const close = () => {
    if (!_.isEqual(props.structure, currentStructure)) {
      Alert.alert(
        'Warning',
        'Closing without saving will remove any progress',
        [
          {
            text: 'Close without saving',
            onPress: () => props.setPageNumber(0),
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      props.setPageNumber(0);
    }
  };

  const save = async () => {
    try {
      let validationCode = 0;
      switch (currentStructure.type) {
        case 'nfa':
          const nfa = currentStructure.structure as NFA;
          validationCode = await CPPCode.validateNFA(nfa);
      }
      if (validationCode === 0) {
        if (currentStructure.type === 'nfa') {
          const nfa = currentStructure.structure as NFA;
          const isDfa = await CPPCode.checkIfDFA(nfa);
          const newStructure = copyStructure(currentStructure);
          const newNfa = newStructure.structure as NFA;
          newNfa.isDfa = isDfa;
          props.setStructure(newStructure);
          await addToPreviousStructures(newStructure);
        }
        props.setPageNumber(0);
      } else {
        let errorMessage = '';
        switch (currentStructure.type) {
          case 'nfa':
            switch (validationCode) {
              case 1:
                errorMessage = 'States cannot have duplicate names';
                break;
              case 2:
                errorMessage = 'There must be one starting state';
                break;
              case 3:
                errorMessage = 'Duplicate transitions exist';
                break;
            }
        }
        Alert.alert('Cannot save structure', errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Required so that the absolute position is contained under the status bar */}
      <View style={editPageStyles.buttonListContainer}>
        <View style={editPageStyles.buttonList}>
          <IconButton icon={CloseIcon} onPress={close} />
          <BasicButton onPress={() => setEditing(!editing)}>
            {editing ? 'Pan and Zoom' : 'Edit Structure'}
          </BasicButton>
          <IconButton icon={SaveIcon} onPress={save} />
        </View>
      </View>
      <View
        style={editPageStyles.svgContainer}
        onLayout={event => {
          setSvgWidth(event.nativeEvent.layout.width);
          setSvgHeight(event.nativeEvent.layout.height);
        }}
      >
        {svgWidth > 0 && svgHeight > 0 ? (
          editing ? (
            <View style={{ width: svgWidth, height: svgHeight }}>
              <StructureDrawing
                structure={currentStructure}
                svgWidth={svgWidth}
                svgHeight={svgHeight}
                scale={scale}
                translateX={translateX}
                translateY={translateY}
                editable={editing}
                setCurrentStructure={setCurrentStructure}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedTransitionArrow={selectedTransitionArrow}
                setSelectedTransitionArrow={setSelectedTransitionArrow}
                selectingNewTransitionEndState={selectingNewTransitionEndState}
                setSelectingNewTransitionEndState={
                  setSelectingNewTransitionEndState
                }
                selectingTransitionNewEndState={selectingTransitionNewEndState}
                setSelectingTransitionNewEndState={
                  setSelectingTransitionNewEndState
                }
                selectingTransitionNewStartState={
                  selectingTransitionNewStartState
                }
                setSelectingTransitionNewStartState={
                  setSelectingTransitionNewStartState
                }
              />
            </View>
          ) : (
            <View
              {...panResponder.panHandlers}
              style={{ width: svgWidth, height: svgHeight }}
            >
              <StructureDrawing
                structure={currentStructure}
                svgWidth={svgWidth}
                svgHeight={svgHeight}
                scale={scale}
                translateX={translateX}
                translateY={translateY}
                editable={editing}
                setCurrentStructure={setCurrentStructure}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedTransitionArrow={selectedTransitionArrow}
                setSelectedTransitionArrow={setSelectedTransitionArrow}
                selectingNewTransitionEndState={selectingNewTransitionEndState}
                setSelectingNewTransitionEndState={
                  setSelectingNewTransitionEndState
                }
                selectingTransitionNewEndState={selectingTransitionNewEndState}
                setSelectingTransitionNewEndState={
                  setSelectingTransitionNewEndState
                }
                selectingTransitionNewStartState={
                  selectingTransitionNewStartState
                }
                setSelectingTransitionNewStartState={
                  setSelectingTransitionNewStartState
                }
              />
            </View>
          )
        ) : (
          <></>
        )}
      </View>
      {selectingNewTransitionEndState ||
      selectingTransitionNewEndState ||
      selectingTransitionNewStartState ? (
        <View style={editPageStyles.cancelList}>
          {selectingNewTransitionEndState ? (
            <Text style={editPageStyles.cancelListItem}>
              Select an end state for the new transition(s)
            </Text>
          ) : (
            <></>
          )}
          {selectingTransitionNewEndState ? (
            <Text style={editPageStyles.cancelListItem}>
              Select a new end state for the selected transition(s)
            </Text>
          ) : (
            <></>
          )}
          {selectingTransitionNewStartState ? (
            <Text style={editPageStyles.cancelListItem}>
              Select a new start state for the selected transition(s)
            </Text>
          ) : (
            <></>
          )}
          <BasicButton
            style={editPageStyles.cancelListItem}
            onPress={() => {
              setSelectedState(undefined);
              setSelectedTransitionArrow(undefined);
              setSelectingNewTransitionEndState(false);
              setSelectingTransitionNewStartState(false);
              setSelectingTransitionNewEndState(false);
            }}
          >
            Cancel
          </BasicButton>
        </View>
      ) : (
        <></>
      )}
      <View style={editPageStyles.line} />
      <ScrollView style={editPageStyles.scrollView}>
        {EditIcons(currentStructure, setCurrentStructure)}
      </ScrollView>
    </>
  );
};

export default EditPage;
