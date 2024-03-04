import React, { useEffect, useRef, useState } from 'react';
import BasicButton from '../components/BasicButton';
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { cameraPageStyles } from '../styles.js';
import Structure from '../types/Structure';
import CPPCode from '../nativeModules';
import { getDefaultStructureLocation } from '../components/StructureDrawing';
import { postPhoto } from '../helperFunctions';

type CameraPageProps = {
  setPageNumber: (newPage: number) => void;
  setStructure: (newStructure: Structure) => void;
  setIsLoading: (newLoading: boolean) => void;
};

const CameraPage = (props: CameraPageProps) => {
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [photo, setPhoto] = useState<PhotoFile>();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const device = useCameraDevice('back');

  if (!device) {
    return (
      <>
        <BasicButton onPress={() => props.setPageNumber(0)}>
          Go back
        </BasicButton>
        <Text>No camera device found</Text>
      </>
    );
  }
  if (!hasPermission) {
    return (
      <>
        <BasicButton onPress={() => props.setPageNumber(0)}>
          Go back
        </BasicButton>
        <ActivityIndicator />
      </>
    );
  }

  const takePicture = async () => {
    const tempPhoto = await camera.current?.takePhoto();
    setPhoto(tempPhoto);
  };

  const usePhoto = async () => {
    if (!photo) {
      console.error('No photo logged');
      return;
    }
    try {
      console.log(photo.path);
      const result = await CPPCode.photoToNFA(photo.path);
      console.log(result);
      try {
        const processedResult = getDefaultStructureLocation(JSON.parse(result));
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
      console.error('Error occured: ' + error);
    }
  };

  return (
    <View style={cameraPageStyles.container}>
      {photo ? (
        <>
          <Image source={{ uri: photo.path }} style={StyleSheet.absoluteFill} />
          <BasicButton onPress={usePhoto}>Use this photo</BasicButton>
          <BasicButton onPress={() => setPhoto(undefined)}>
            Take another photo
          </BasicButton>
          <BasicButton
            onPress={() => postPhoto(photo.path, props.setIsLoading)}
          >
            Post photo
          </BasicButton>
        </>
      ) : (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
          />
          <Pressable
            onPress={takePicture}
            style={cameraPageStyles.photoButton}
          />
          <BasicButton onPress={() => props.setPageNumber(0)}>
            Go back
          </BasicButton>
        </>
      )}
    </View>
  );
};

export default CameraPage;
