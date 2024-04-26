# Apple silicon machines
# (cd ios && g++ -std=c++11 -stdlib=libc++ -I/opt/homebrew/Cellar/opencv/4.9.0_3/include/opencv4 -L/opt/homebrew/Cellar/opencv/4.9.0_3/lib -lopencv_core -lopencv_imgproc -lopencv_highgui -lopencv_imgcodecs -lopencv_videoio -lopencv_features2d -lopencv_dnn -lopencv_ml mainCode.cpp tester.cpp -o tester && ./tester)

# Mac Intel machines
(cd ios && g++ -std=c++11 -stdlib=libc++ -I/usr/local/Cellar/opencv/4.9.0_7/include/opencv4/ -L/usr/local/Cellar/opencv/4.9.0_7/lib -lopencv_core -lopencv_imgproc -lopencv_highgui -lopencv_imgcodecs -lopencv_videoio -lopencv_features2d -lopencv_dnn -lopencv_ml mainCode.cpp tester.cpp -o tester && ./tester)