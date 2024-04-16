import { StyleSheet } from 'react-native';

const basicMargin = 10;
const largeHeight = 50;
const smallHeight = 40;
const gray = '#DDDDDD';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    margin: basicMargin,
  },
});

export const mainPageStyles = StyleSheet.create({
  mainButtonList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
  resultTextAllowed: {
    color: 'green',
  },
  resultTextRejected: {
    color: 'red',
  },
  runStep: {
    marginRight: basicMargin,
  },
  previousStructuresButton: {
    maxWidth: 100,
  },
});

export const editPageStyles = StyleSheet.create({
  buttonListContainer: {
    zIndex: 1,
  },
  buttonList: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  svgContainer: {
    flex: 1,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    maxHeight: 200,
  },
  cancelList: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    top: 530,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
  },
  cancelListItem: {
    paddingHorizontal: 10,
    maxWidth: 200,
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
  closeButton: {
    marginTop: basicMargin,
    marginLeft: basicMargin,
  },
  buttonList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: basicMargin,
    marginHorizontal: basicMargin,
  },
});

export const cameraRollPageStyles = StyleSheet.create({
  photosContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    marginTop: basicMargin,
  },
  photoContainer: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  photo: {
    height: 122,
    width: 122,
  },
  mainPhoto: {
    zIndex: -1,
  },
});

export const previousStructuresPageStyles = StyleSheet.create({
  gridContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    marginTop: basicMargin,
  },
  structure: {
    width: 123,
    height: 123,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
});

export const basicButtonStyles = StyleSheet.create({
  basicButton: {
    backgroundColor: gray,
    borderRadius: 10,
    borderWidth: 1,
    height: largeHeight,
    paddingHorizontal: 5,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallBasicButton: {
    backgroundColor: gray,
    borderRadius: 10,
    borderWidth: 1,
    height: smallHeight,
    paddingHorizontal: 5,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export const iconStyles = StyleSheet.create({
  imageContainer: {
    width: largeHeight,
    height: largeHeight,
  },
  smallImageContainer: {
    width: smallHeight,
    height: smallHeight,
  },
  image: {
    height: '80%',
    width: '80%',
  },
  smallImage: {
    height: '75%',
    width: '75%',
  },
});

export const loadingStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    height: 100,
    width: 200,
    backgroundColor: gray,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeText: {
    fontSize: 20,
  },
});

export const editIconStyles = StyleSheet.create({
  editIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
});
