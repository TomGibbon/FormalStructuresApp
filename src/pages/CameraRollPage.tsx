import React, { useEffect, useState } from 'react';
import {
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

type CameraRollPageProps = {
  setPageNumber: (newPageNumber: number) => void;
  setIsLoading: (newIsLoading: boolean) => void;
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
      console.log(result);
      props.setIsLoading(false);
      props.setPageNumber(0);
    } catch (error) {
      console.error(error);
    }
  };

  const selectPhoto = async (path: string) => {
    try {
      const jpgData = await convertHEICtoJPG(path);
      console.log(jpgData.path);
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
      await postPhoto(currentPhotoPath);
      props.setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const tesseractTest = async () => {
    try {
      props.setIsLoading(true);
      const result = await CPPCode.tesseractTest(currentPhotoPath);
      console.log(result);
      props.setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <BasicButton onPress={() => props.setPageNumber(0)}>Back</BasicButton>
      {currentPhotoPath ? (
        <>
          <Image
            source={{ uri: currentPhotoPath }}
            style={[cameraRollPageStyles.mainPhoto, StyleSheet.absoluteFill]}
          />
          <BasicButton onPress={usePhoto}>Use Photo</BasicButton>
          <BasicButton onPress={postPhotoHere}>Post Photo</BasicButton>
          <BasicButton onPress={tesseractTest}>Tesseract Test</BasicButton>
        </>
      ) : (
        <ScrollView>
          <View style={cameraRollPageStyles.photosContainer}>
            {photos.map((photo, index) => {
              return (
                <TouchableOpacity
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
      )}
    </>
  );
};

export default CameraRollPage;
