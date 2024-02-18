import React, { useEffect, useState } from 'react';
import {
  Image,
  NativeModules,
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
import { CameraRollPageStyles } from '../styles';

const { CPPCode } = NativeModules;
if (!CPPCode) {
  throw new Error('CPPCode is null');
}

type CameraRollPageProps = {
  setPageNumber: (newPageNumber: number) => void;
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
      const result = await CPPCode.photoToNFA(currentPhotoPath);
      console.log(result);
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

  return (
    <>
      <BasicButton onPress={() => props.setPageNumber(0)}>Back</BasicButton>
      {currentPhotoPath ? (
        <>
          <Image
            source={{ uri: currentPhotoPath }}
            style={[CameraRollPageStyles.mainPhoto, StyleSheet.absoluteFill]}
          />
          <BasicButton onPress={usePhoto}>Use Photo</BasicButton>
          <BasicButton onPress={() => postPhoto(currentPhotoPath)}>
            Post Photo
          </BasicButton>
        </>
      ) : (
        <ScrollView>
          <View style={CameraRollPageStyles.photosContainer}>
            {photos.map((photo, index) => {
              return (
                <TouchableOpacity
                  // eslint-disable-next-line react-hooks/rules-of-hooks -- Due to usePhoto being falsely detected as a react hook
                  onPress={async () => await selectPhoto(photo.node.image.uri)}
                  key={index}
                >
                  <Image
                    style={CameraRollPageStyles.photo}
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
