//
//  Allows the user to select a photo from camera roll and input it into the photo to NFA function
//

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

  // Get first 21 photos from the camera roll
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

  // Inputs photo into the photo to NFA algotithm
  const usePhoto = async () => {
    try {
      props.setIsLoading(true); // Could take time so alert the user that the process has started
      const result = await CPPCode.photoToNFA(currentPhotoPath); // Run algorithm
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
      console.error(error);
    }
    props.setIsLoading(false); // Process has finished
  };

  // Gets JPG photo from selected path
  const selectPhoto = async (path: string) => {
    try {
      const jpgData = await convertHEICtoJPG(path); // Convert to JPG format
      setCurrentPhotoPath(jpgData.path); // Set current photo to JPG one
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {currentPhotoPath ? ( // Photo selected
        <>
          <Image
            source={{ uri: currentPhotoPath }}
            style={StyleSheet.absoluteFill}
          />
          <View style={cameraRollPageStyles.buttonList}>
            <BasicButton onPress={usePhoto}>Use Photo</BasicButton>
            <BasicButton onPress={() => setCurrentPhotoPath(undefined)}>
              Choose Another Photo
            </BasicButton>
            {/* <BasicButton
              onPress={() => postPhoto(currentPhotoPath, props.setIsLoading)}
            >
              Post Photo
            </BasicButton> */}

            {/* This button was used when testing, to post photos to the AWS S3 bucket */}
          </View>
        </>
      ) : ( // Selecting photo
        <>
          <IconButton icon={CloseIcon} onPress={() => props.setPageNumber(0)} />
          <ScrollView>
            <View style={cameraRollPageStyles.photosContainer}>
              {photos.map((photo, index) => {
                return (
                  <TouchableOpacity
                    style={cameraRollPageStyles.photoContainer}
                    onPress={async () => await selectPhoto(photo.node.image.uri)}
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
