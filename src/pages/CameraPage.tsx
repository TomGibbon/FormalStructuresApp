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
  NativeModules,
} from 'react-native';
import { cameraPageStyles } from '../styles.js';
import Structure from '../types/Structure';

const { CPPCode } = NativeModules;
if (!CPPCode) {
  throw new Error('CPPCode is null');
}

type CameraPageProps = {
  setPageNumber: (newPage: number) => void;
  setStructure: (newStructure: Structure) => void;
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
      console.log(await CPPCode.photoToNFA(photo.path));
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
