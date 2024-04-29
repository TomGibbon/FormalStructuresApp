# Running the Testing File

1. Download FormalStructuresApp repository from [this repository](https://github.com/TomGibbon/FormalStructuresApp). (If using the source code submitted through tabular, this step is not needed)
2. Make sure OpenCV is installed by running `brew install opencv@4`
3. Open the `testcpp.sh` file and make sure the correct command is run depending on whether the machine running the tests runs with Apple Silicon (M1, M2 chips) or Mac Intel.
   - If the command still does not work the version of opencv may differ slightly from the one in the command. Change "4.9.0_3" or "4.9.0_7" to the correct version stored at opencv's location
4. Run ./testcpp.sh to run the program

To choose which tests to run, you can comment out different lines of code in the main function of the testing file (ios/tester.cpp).
Furthermore, when testing photos, inside the photoToNFATest function, you can toggle which line is commented out, depending on whether you would like the photos to be displayed during testing or not.

# Building the App on a Physical iPhone

>**Note**: During development the build was built on an iPhone 12 with iOS 17.4

1. Complete the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions up to the 'Creating a new application' step. Use the React Native CLI Quickstart instructions, and make sure to set the Target OS as iOS. (Note, you do not need to download a simulator)
2. Download FormalStructuresApp repository from [this repository](https://github.com/TomGibbon/FormalStructuresApp), and navigate to it in a terminal
3. Run `./downloadAndInsertOpenCV.sh` - This inserts OpenCV into the application
4. Run `npm install`
5. Run `./podinstall.sh`
6. Make sure the physical iPhone is on developer mode by going to Settings > Privacy & Security > Developer Mode
7. Make sure the physical iPhone is connected to the computer by USB and is on the same local network
8. Open the `runphone.sh` file, and change "Toms iPhone" to the name of the intended device
9. Run `./runphone.sh` to build the application. If an error occurs:
   - Redo steps 4 and 5.
   - Run `xed ios/FormalStructuresApp.xcodeproj` to open the project settings in XCode, go to Signing & Capabilities, then make sure a user is selected under "Team". It may sometimes expire so sometimes you need to deselect and then reselect the user.
   - Try to follow the error message.
11. Open another terminal in the same directory, and run `./runmetro.sh` - This acts as the console for the app.
12. Make sure the developer of the app (specified in the signing and capabilities settings on XCode) is trusted on the iPhone.
13. Make sure to allow the app to use the camera and camera roll after opening it. This can always be changed in the iPhone settings at Settings > FormalStructuresApp

If any errors occur while performing these steps, try to follow the error messages given. Sometimes errors can occur after XCode gets an update to their command line tools.