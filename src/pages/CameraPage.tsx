//
//  Allows the user to take a photo and input it
//

import React, { useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';

import BasicButton from '../components/BasicButton';
import { cameraPageStyles } from '../styles.js';
import Structure from '../types/Structure';
import CPPCode from '../nativeModules';
import { postPhoto } from '../helperFunctions';
import IconButton from '../components/IconButton';
import CloseIcon from '../../res/close_icon.png';

type CameraPageProps = {
  setPageNumber: (newPage: number) => void;
  setStructure: (newStructure: Structure) => void;
  setIsLoading: (newLoading: boolean) => void;
};

const CameraPage = (props: CameraPageProps) => {
  const camera = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [photo, setPhoto] = useState<PhotoFile>();

  // First make sure permission is requested
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const device = useCameraDevice('back');

  if (!device) { // Should not happen on physical device
    return (
      <>
        <IconButton icon={CloseIcon} onPress={() => props.setPageNumber(0)} />
        <Text>No camera device found</Text>
      </>
    );
  }
  if (!hasPermission) { // Only happens if permission is not granted
    return (
      <>
        <IconButton icon={CloseIcon} onPress={() => props.setPageNumber(0)} />
        <ActivityIndicator />
      </>
    );
  }

  // Takes photo
  const takePicture = async () => {
    const tempPhoto = await camera.current?.takePhoto(); // Takes photo
    setPhoto(tempPhoto);
  };

  // Inputs photo into photo to NFA algorithm
  const usePhoto = async () => {
    if (!photo) {
      console.error('No photo logged'); // Should not happen
      return;
    }
    try {
      props.setIsLoading(true); // Could take time so alert the user that the process has started
      const result = await CPPCode.photoToNFA(photo.path); // Run algorithm
      try { // Nested try block needed to handle errors returned from photo to NFA algorithm
        const processedResult = JSON.parse(result); // Assume returned value was a structure
        props.setStructure(processedResult);
        props.setPageNumber(0);
      } catch (error) {
        switch (result) { // Check if error was due to bad input
          case 'No start state':
          case 'More than 1 start state':
            Alert.alert('Problem with structure', result, [{ text: 'OK' }]);
            break;
          default:
            throw error; // Different error occured, throw it
        }
      }
    } catch (error) {
      console.error('Error occured: ' + error);
    }
    props.setIsLoading(false); // Process has finished
  };

  return (
    <>
      {photo ? ( // Photo taken
        <>
          <Image source={{ uri: photo.path }} style={StyleSheet.absoluteFill} />
          <View style={cameraPageStyles.buttonList}>
            <BasicButton onPress={usePhoto}>Use Photo</BasicButton>
            <BasicButton onPress={() => setPhoto(undefined)}>
              Take Another Photo
            </BasicButton>
            {/* <BasicButton
              onPress={() => postPhoto(photo.path, props.setIsLoading)}
            >
              Post Photo
            </BasicButton> */}
            
            {/* This button was used when testing, to post photos to the AWS S3 bucket */}
          </View>
        </>
      ) : ( // Taking photo
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
          />
          <TouchableOpacity
            onPress={takePicture}
            style={cameraPageStyles.photoButton}
          >
            <View style={cameraPageStyles.photoButtonInnerCircle} />
          </TouchableOpacity>
          <IconButton
            style={cameraPageStyles.closeButton}
            icon={CloseIcon}
            onPress={() => props.setPageNumber(0)}
          />
        </>
      )}
    </>
  );
};

export default CameraPage;
