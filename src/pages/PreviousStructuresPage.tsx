//
//  Allows the user to select a previously saved structure
//

import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { previousStructuresPageStyles } from '../styles';
import IconButton from '../components/IconButton';
import CloseIcon from '../../res/close_icon.png';
import StructureDrawing from '../components/StructureDrawing';
import Structure from '../types/Structure';

type PreviousStructruresPageProps = {
  setPageNumber: (newPageNumber: number) => void;
  setStructure: (newStructure: Structure) => void;
};

const PreviousStructuresPage = (props: PreviousStructruresPageProps) => {
  const [previousStructures, setPreviousStructures] = useState<Structure[]>([]);

  useEffect(() => {
    const readAndSetStructures = async () => { // Async function in a useEffect, so must be pre-defined, then called.
      try {
        const result = await AsyncStorage.getItem('previous-structures'); // Get structures
        if (result !== null) {
          setPreviousStructures(JSON.parse(result));
        }
      } catch (error) {
        console.error(error);
      }
    };
    readAndSetStructures();
  }, []);

  return (
    <>
      <IconButton icon={CloseIcon} onPress={() => props.setPageNumber(0)} />
      <ScrollView>
        <View style={previousStructuresPageStyles.gridContainer}>
          {previousStructures.map((structure, index) => {
            return (
              <TouchableOpacity
                style={previousStructuresPageStyles.structure}
                onPress={() => {
                  props.setStructure(structure);
                  props.setPageNumber(0);
                }}
                key={index}
              >
                <StructureDrawing
                  structure={structure}
                  svgWidth={previousStructuresPageStyles.structure.width} // Width and height are the same as the container
                  svgHeight={previousStructuresPageStyles.structure.height}
                  scale={5} // Set zoom for displaying the previous structure
                  translateX={0}
                  translateY={0}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

export default PreviousStructuresPage;
