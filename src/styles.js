import { StyleSheet } from 'react-native';

const basicMargin = 10;
const largeHeight = 50;
const smallHeight = 40;

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    margin: basicMargin,
  },
});

export const mainPageStyles = StyleSheet.create({
  mainButtonList: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  svgContainer: {
    marginVertical: basicMargin,
    height: '60%',

    borderRadius: 30,
    borderWidth: 1,
  },
  editingButtonList: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    display: 'flex',
    margin: basicMargin,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    height: smallHeight,
    paddingHorizontal: 5,
    paddingVertical: 7,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: basicMargin,
  },
  runList: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  convertBox: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: basicMargin,
  },
  convertButtonsList: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  convertButton: {
    flex: 1,
    marginLeft: basicMargin,
  },
  convertButtonRight: {
    flex: 1,
    marginHorizontal: basicMargin,
  },
  runText: {
    alignItems: 'center',
  },
});

export const cameraPageStyles = StyleSheet.create({
  photoButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 50,
    width: 75,
    height: 75,
    backgroundColor: 'white',
    borderRadius: 75,
  },
  container: {
    flex: 1,
  },
});

export const componentStyles = StyleSheet.create({
  basicButton: {
    backgroundColor: '#DDDDDD',
    borderRadius: 10,
    borderWidth: 1,
    height: largeHeight,
    paddingHorizontal: 5,
    paddingVertical: 7,

    justifyContent: 'center',
    alignItems: 'center',
  },
  smallBasicButton: {
    backgroundColor: '#DDDDDD',
    borderRadius: 10,
    borderWidth: 1,
    height: smallHeight,
    paddingHorizontal: 5,
    paddingVertical: 7,

    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImageContainer: {
    width: largeHeight,
    height: largeHeight,
  },
  smallIconImageContainer: {
    width: smallHeight,
    height: smallHeight,
  },
  iconImage: {
    height: '80%',
    width: '80%',
  },
});

export const CameraRollPageStyles = StyleSheet.create({
  photosContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  photo: {
    height: 120,
    width: 120,
  },
  mainPhoto: {
    zIndex: -1,
  },
});
