<!-- This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native. -->

To run the testing files

1. Download FormalStructuresApp repository from XXX (If using the source code submitted through tabular, this step is not needed)
2. Make sure OpenCV is installed by running brew install opencv@4
3. In the testcpp.sh file, make sure the correct command is run depending on whether the machine running the tests runs with Apple Silicon (M1, M2 chips) or Mac Intel.
   - If the command still does not work the version of opencv may differ slightly from the one in the command. Change '4.9.0_3' or '4.9.0_7' to the correct version stored at opencv's location
4. Run ./testcpp.sh

To choose which tests to run, you can comment out different lines of code in the main function of the testing file (ios/tester.cpp)
Furthermore, when testing photos, 

To build the app on a physical iPhone. (Note during development the build was built on an iPhone 12 with iOS 17.4)

1. Download FormalStructuresApp repository from XXX
2. Run ./downloadAndInsertOpenCV.sh
3. Make sure XCode is fully installed and updated
4. Run npm install
5. Run npm install -g react-native-cli
6. Run brew install ruby (make sure the version of ruby being used is up to date)
7. Run sudo gem install cocoapods (this can take a while)
8. Run ./podinstall.sh
9. Make sure the physical iPhone is on developer mode by going to Settings > Privacy & Security > Developer Mode
10. Make sure the physical iPhone is connected to the computer by USB and is on the same local network
11. Run ./runphone.sh (If an error occurs:)
   - Redo steps 4 and 8
   - Open the ios/FormalStructuresApp.xcodeproj file in XCode, go to Signing & Capabilities, then make sure a user is selected under 'Team'. It may sometimes expire so sometimes you need to deselect and then reselect the user.
   - Try to follow the error message
12. Make sure the developer of the app (specified in the signing and capabilities settings on XCode) is trusted on the iPhone
13. Make sure to allow the app to use the camera and camera roll

If any errors occur while performing these steps, try to follow the error messages given. Sometimes errors can occur after XCode gets an update to their command line tools