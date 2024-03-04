import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';

import Structure, { copyStructure } from '../types/Structure';
import IconButton from '../components/IconButton';
import SaveIcon from '../../res/save_icon.png';
import CloseIcon from '../../res/close_icon.png';
import { editPageStyles } from '../styles';
import StructureDrawing, {
  getDefaultStructureLocation,
} from '../components/StructureDrawing';
import EditIcons from '../components/EditIcons';
import BasicButton from '../components/BasicButton';
import CPPCode from '../nativeModules';
import NFA from '../types/NFA';

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

  const close = () => {
    props.setPageNumber(0);
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
          <BasicButton
            onPress={() =>
              setCurrentStructure(getDefaultStructureLocation(currentStructure))
            }
          >
            Reset Layout
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
          <View style={{ width: svgWidth, height: svgHeight }}>
            <StructureDrawing
              structure={currentStructure}
              svgWidth={svgWidth}
              svgHeight={svgHeight}
              scale={1}
              translateX={0}
              translateY={0}
              editable={editing}
              setCurrentStructure={setCurrentStructure}
            />
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={editPageStyles.line} />
      <ScrollView style={editPageStyles.scrollView}>
        {EditIcons(currentStructure, setCurrentStructure)}
      </ScrollView>
    </>
  );
};

export default EditPage;
