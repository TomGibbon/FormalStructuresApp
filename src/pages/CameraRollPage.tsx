import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';

import BasicButton from '../components/BasicButton';
import { convertHEICtoJPG, postPhoto } from '../helperFunctions';
import { cameraRollPageStyles } from '../styles';
import CPPCode from '../nativeModules';
import Structure from '../types/Structure';
// import { getDefaultStructureLocation } from '../components/StructureDrawing';
import IconButton from '../components/IconButton';
import CloseIcon from '../../res/close_icon.png';

type CameraRollPageProps = {
  setPageNumber: (newPageNumber: number) => void;
  setIsLoading: (newIsLoading: boolean) => void;
  setStructure: (newStructure: Structure) => void;
};

const CameraRollPage = (props: CameraRollPageProps) => {
  const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);
  const [currentPhotoPath, setCurrentPhotoPath] = useState();

  useEffect(() => {
    CameraRoll.getPhotos({
      first: 21,
      assetType: 'Photos',
    })
      .then(r => {
        setPhotos(r.edges);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const usePhoto = async () => {
    try {
      props.setIsLoading(true);
      const result = await CPPCode.photoToNFA(currentPhotoPath);
      try {
        // const processedResult = getDefaultStructureLocation(JSON.parse(result));
        const processedResult = JSON.parse(result);
        props.setStructure(processedResult);
        props.setPageNumber(0);
      } catch (error) {
        switch (result) {
          case 'No start state':
          case 'More than 1 start state':
            Alert.alert('Problem with structure', result, [{ text: 'OK' }]);
            break;
          default:
            throw error;
        }
      }
    } catch (error) {
      console.error(error);
    }
    props.setIsLoading(false);
  };

  const selectPhoto = async (path: string) => {
    try {
      const jpgData = await convertHEICtoJPG(path);
      setCurrentPhotoPath(jpgData.path);
    } catch (error) {
      console.error(error);
    }
  };

  const postPhotoHere = async () => {
    if (!currentPhotoPath) {
      console.error('No photo path');
      return;
    }
    try {
      props.setIsLoading(true);
      await postPhoto(currentPhotoPath, props.setIsLoading);
      props.setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {currentPhotoPath ? (
        <>
          <Image
            source={{ uri: currentPhotoPath }}
            style={[cameraRollPageStyles.mainPhoto, StyleSheet.absoluteFill]}
          />
          <BasicButton onPress={usePhoto}>Use Photo</BasicButton>
          <BasicButton onPress={() => setCurrentPhotoPath(undefined)}>
            Choose Another Photo
          </BasicButton>
          <BasicButton onPress={postPhotoHere}>Post Photo</BasicButton>
        </>
      ) : (
        <>
          <IconButton icon={CloseIcon} onPress={() => props.setPageNumber(0)} />
          <ScrollView>
            <View style={cameraRollPageStyles.photosContainer}>
              {photos.map((photo, index) => {
                return (
                  <TouchableOpacity
                    style={cameraRollPageStyles.photoContainer}
                    onPress={async () =>
                      await selectPhoto(photo.node.image.uri)
                    }
                    key={index}
                  >
                    <Image
                      style={cameraRollPageStyles.photo}
                      source={{ uri: photo.node.image.uri }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </>
      )}
    </>
  );
};

export default CameraRollPage;
