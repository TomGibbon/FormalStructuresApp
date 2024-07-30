// 
// Contains functions non-specific to any particular feature
//

import RNHeicConverter from 'react-native-heic-converter';
import AWS from 'aws-sdk';
import Structure from './types/Structure';
import _ from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from '@env';

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: 'eu-west-2',
});

const s3 = new AWS.S3();

// Upload to S3 bucket
const uploadFileToS3 = async (bucketName: string, fileName: string, filePath: Blob) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: filePath,
  };
  return await s3.upload(params).promise();
};

// Post photo to S3 bucket
export const postPhoto = async (path: string, setIsLoading: (newLoading: boolean) => void) => {
  if (!path) {
    console.error('no photo path'); // Should not happen
    return;
  }
  try {
    setIsLoading(true); // Set loading
    const fileData = await fetch(path).then(response => response.blob());
    console.log('uploading...');
    await uploadFileToS3('formal-structures-app-bucket', 'test_photo_.jpg', fileData); // Upload file
    console.log('File uploaded');
  } catch (error) {
    console.error(error);
  }
  setIsLoading(false); // Turn off loading
};

// Convert HEIC image from camera roll to JPG image
export const convertHEICtoJPG = async (uri: string) => {
  try {
    const result = await RNHeicConverter.convert({ path: uri });
    return result;
  } catch (error) {
    console.error(error);
  }
};

// Add a structure to the previous structures
export const addToPreviousStructures = async (newStructure: Structure) => {
  try {
    const result = await AsyncStorage.getItem('previous-structures'); // Get previous structures
    const previousStructures: Structure[] | null = result
      ? JSON.parse(result)
      : null;
    if (previousStructures) { // Check that the access was successful
      let contains = false;
      previousStructures.forEach(structure => {
        if (_.isEqual(structure, newStructure)) { // Identical structure exists
          contains = true;
        }
      });
      if (!contains) { // Only add if identical structure does not already exist in the previous structures
        previousStructures.push(newStructure);
        await AsyncStorage.setItem('previous-structures', JSON.stringify(previousStructures));
      }
    }
  } catch (error) {
    console.error(error);
  }
};
