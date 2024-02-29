#include "mainCode.hpp"
#include <iostream>
#include <fstream>
#include <opencv2/dnn.hpp>

using namespace std;
using namespace cv;
using namespace cv::dnn;

namespace mainCode {
  // ==================================
  // ======== ** Classes ** ===========
  // ==================================

  // State
  State::State(int id, string name, bool isStart, bool isFinal, int locX, int locY):
    Id(id), Name(name), IsStart(isStart), IsFinal(isFinal), LocX(locX), LocY(locY) {}

  string State::convertToJSON(bool testing) {
    if (testing) {
      return "\n\t\t\t{ \"id\":" + to_string(Id) + ", \"name\":\"" + Name + "\", \"isStart\":" + boolToString(IsStart) + ", \"isFinal\":" + boolToString(IsFinal) + ", \"locX\":" + to_string(LocX) + ", \"locY\":" + to_string(LocY) + " }";
    } else {
      return "{\"id\":" + to_string(Id) + ",\"name\":\"" + Name + "\",\"isStart\":" + boolToString(IsStart) + ",\"isFinal\":" + boolToString(IsFinal) + ",\"locX\":" + to_string(LocX) + ",\"locY\":" + to_string(LocY) + "}";
    }
  }

  // Transition
  Transition::Transition(int id, int from, int to, string token):
    Id(id), From(from), To(to), Token(token) {}

  string Transition::convertToJSON(bool testing) {
    if (testing) {
      return "\n\t\t\t{ \"id\":" + to_string(Id) + ", \"from\":" + to_string(From) + ", \"to\":" + to_string(To) + ", \"token\":\"" + Token + "\" }";
    } else {
      return "{\"id\":" + to_string(Id) + ",\"from\":" + to_string(From) + ",\"to\":" + to_string(To) + ",\"token\":\"" + Token + "\"}";
    }
  }

  // NFA
  NFA::NFA(bool isDfa, vector<State> states, vector<Transition> transitions):
    IsDfa(isDfa), States(states), Transitions(transitions) {}

  string NFA::convertToJSON(bool testing) {
    string statesJSON = "";
    int i = 0;
    if (States.size() > 0) { // Initial check due to size_t underflow probelem
      for (; i < States.size() - 1; i++) {
        statesJSON += States[i].convertToJSON(testing) + ",";
        if (testing) {
          statesJSON += " ";
        }
      }
      statesJSON += States[i].convertToJSON(testing);
    }

    string transitionsJSON = "";
    i = 0;
    if (Transitions.size() > 0) {
      for (; i < Transitions.size() - 1; i++) {
        transitionsJSON += Transitions[i].convertToJSON(testing) + ",";
        if (testing) {
          transitionsJSON += " ";
        }
      }
      transitionsJSON += Transitions[i].convertToJSON(testing);
    }

    if (testing) {
      return "{\n\t\"structure\":\n\t{\n\t\t\"isDfa\":" + boolToString(IsDfa) + ",\n\t\t\"states\":\n\t\t[" + statesJSON + "\n\t\t],\n\t\t\"transitions\":\n\t\t[" + transitionsJSON + "\n\t\t]\n\t},\n\t\"type\":\"nfa\"\n}";
    } else {
      return "{\"structure\":{\"isDfa\":" + boolToString(IsDfa) + ",\"states\":[" + statesJSON + "],\"transitions\":[" + transitionsJSON + "]},\"type\":\"nfa\"}";
    }
  }

  // MathmaticalDFA
  MathmaticalDFA::MathmaticalDFA(set<int> states, set<string> alphabet, map<int, map<string, int>> transitionTable, int startState, set<int> finalStates):
    States(states), Alphabet(alphabet), TransitionTable(transitionTable), StartState(startState), FinalStates(finalStates) {}

  MathmaticalDFA::MathmaticalDFA(NFA dfa): 
    States(getStates(dfa.States)), Alphabet(getAlphabet(dfa.Transitions)), TransitionTable(), StartState(getStartState(dfa.States)), FinalStates(getFinalStates(dfa.States)) {
      map<int, map<string, int>> transitionTable; // No need to declare cells as dfa is assumed to have all possible transitions mapped
      for (Transition transition : dfa.Transitions) {
        int from = transition.From;
        int to = transition.To;
        string token = transition.Token;

        map<string, int> fromTable = transitionTable[from];
        fromTable[token] = to;
        transitionTable[from] = fromTable;
      }
      TransitionTable = transitionTable;
    }

  MathmaticalNFA::MathmaticalNFA(set<int> states, set<string> alphabet, map<int, map<string, set<int>>> transitionTable, int startState, set<int> finalStates):
    States(states), Alphabet(alphabet), TransitionTable(transitionTable), StartState(startState), FinalStates(finalStates) {}

  MathmaticalNFA::MathmaticalNFA(NFA nfa):
        States(getStates(nfa.States)), Alphabet(getAlphabet(nfa.Transitions)), StartState(getStartState(nfa.States)), FinalStates(getFinalStates(nfa.States)) {
          Alphabet.insert("ε");
          map<int, map<string, set<int>>> transitionTable;

          // Declare each cell in map
          for (State state : nfa.States) {
            for (string token : Alphabet) {
              transitionTable[state.Id][token] = {};
            }
          }

          // Start by adding all single transitions
          for (Transition transition : nfa.Transitions) {
            transitionTable[transition.From][transition.Token].insert(transition.To);
          }

          // Update with epsilon transitions
          for (State state : nfa.States) {
            set<int> epsilonTransitions = transitionTable[state.Id]["ε"]; // Get epsilon closure of state
            epsilonTransitions.insert(state.Id); // Make sure itself is added

            // Continue checking epsilon closure of states until no new ones are detected
            set<int> remaining = epsilonTransitions; // Contains all states that need to have their epsilon closure checked
            while (!remaining.empty()) {
              // Pop front
              auto iterator = remaining.begin();
              int current = *iterator; // Contains the next state that needs to be checked
              remaining.erase(iterator);

              set<int> newStates = transitionTable[current]["ε"]; // Get epsilon closure of current
              for (int newState : newStates) { // Check if any of the resulting states are new
                if (epsilonTransitions.find(newState) == epsilonTransitions.end()) {
                  epsilonTransitions.insert(newState);
                  remaining.insert(newState); // New state so must be checked later
                }
              }
            }

            // Update the current row in the table using the epsilon closure
            for (string token : Alphabet) {
              set<int> currentTransitions = transitionTable[state.Id][token];

              // Update the transition table with the transitions from this epsilon closure
              if (token == "ε") {
                transitionTable[state.Id]["ε"] = setUnion(transitionTable[state.Id]["ε"], epsilonTransitions);
              } else {
                for (int epsilonTransition : epsilonTransitions) {
                  set<int> resultingTransitions = transitionTable[epsilonTransition][token];
                  transitionTable[state.Id][token] = setUnion(transitionTable[state.Id][token], resultingTransitions);
                }
              }
            }
          }
          TransitionTable = transitionTable;
        }

  // OpenCV
  Circle::Circle(Point center, float radius):
    Center(center), Radius(radius) {}

  // Helpers

  void printVector(string name, vector<int> list) {
    cout << name << ": {";
    for (int i : list) {
      cout << to_string(i) << " ";
    }
    cout << "}\n";
  }

  void printSet(string name, set<int> set) {
    cout << name << ": {";
    for (int i : set) {
      cout << to_string(i) << " ";
    }
    cout << "}\n";
  }

  string boolToString(bool x) {
    return x ? "true" : "false";
  }

  template <typename T>
  set<T> setIntersection(set<T> set1, set<T> set2) {
    set<T> result;
    for (T item : set1) {
      if (set2.find(item) != set2.end()) {
        result.insert(item);
      }
    }
    return result;
  }

  template <typename T>
  set<T> setUnion(set<T> set1, set<T> set2) {
    set1.insert(set2.begin(), set2.end());
    return set1;
  }

  template <typename T>
  set<T> setDifference(set<T> set1, set<T> set2) {
    set<T> result;
    for (T item : set1) {
      if (set2.find(item) == set2.end()) {
        result.insert(item);
      }
    }
    return result;
  }
  
  string base64Decode(const string &base64data) {
    // Create BIO object to handle base64 decoding
    BIO *bio = BIO_new_mem_buf(base64data.c_str(), base64data.length());
    BIO *b64 = BIO_new(BIO_f_base64());
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    bio = BIO_push(b64, bio);

    // Create buffer to store decoded data
    char buffer[4096];
    string decodedData;

    // Decode base64 data
    int len = 0;
    while ((len = BIO_read(bio, buffer, sizeof(buffer))) > 0) {
      decodedData.append(buffer, len);
    }

    // Free resources
    BIO_free_all(bio);

    return decodedData;

    // vector<uchar> imageData = vector<uchar>(decodedData.begin(), decodedData.end());
    // Mat image = imdecode(Mat(imageData), 1);
    
    // return image;
  }

  // DFA / NFA functions

  set<int> getStates(vector<State> states) {
    set<int> result;
    for (State state : states) {
      result.insert(state.Id);
    }
    return result;
  }

  set<string> getAlphabet(vector<Transition> transitions) {
    set<string> alphabet;
    for (Transition transition : transitions) {
      alphabet.insert(transition.Token);
    }
    return alphabet;
  }

  int getStartState(vector<State> states) {
    for (State state : states) {
      if (state.IsStart) {
        return state.Id;
      }
    }
    throw out_of_range("Start state not found");
  }

  set<int> getFinalStates(vector<State> states) {
    set<int> finalStates;
    for (State state : states) {
      if (state.IsFinal) {
        finalStates.insert(state.Id);
      }
    }
    return finalStates;
  }

  void thinningIteration(Mat& img, int iter) {
    CV_Assert(img.channels() == 1);
    CV_Assert(img.depth() != sizeof(uchar));
    CV_Assert(img.rows > 3 && img.cols > 3);

    Mat marker = Mat::zeros(img.size(), CV_8UC1);

    int nRows = img.rows;
    int nCols = img.cols;

    if (img.isContinuous()) {
      nCols *= nRows;
      nRows = 1;
    }

    int x, y;
    uchar *pAbove;
    uchar *pCurr;
    uchar *pBelow;
    uchar *nw, *no, *ne;    // north (pAbove)
    uchar *we, *me, *ea;
    uchar *sw, *so, *se;    // south (pBelow)

    uchar *pDst;

    // initialize row pointers
    pAbove = NULL;
    pCurr = img.ptr<uchar>(0);
    pBelow = img.ptr<uchar>(1);

    for (y = 1; y < img.rows - 1; ++y) {
      // shift the rows up by one
      pAbove = pCurr;
      pCurr = pBelow;
      pBelow = img.ptr<uchar>(y + 1);

      pDst = marker.ptr<uchar>(y);

      // initialize col pointers
      no = &(pAbove[0]);
      ne = &(pAbove[1]);
      me = &(pCurr[0]);
      ea = &(pCurr[1]);
      so = &(pBelow[0]);
      se = &(pBelow[1]);

      for (x = 1; x < img.cols - 1; ++x) {
        // shift col pointers left by one (scan left to right)
        nw = no;
        no = ne;
        ne = &(pAbove[x + 1]);
        we = me;
        me = ea;
        ea = &(pCurr[x + 1]);
        sw = so;
        so = se;
        se = &(pBelow[x + 1]);

        int A = (*no == 0 && *ne == 1) + (*ne == 0 && *ea == 1) +
          (*ea == 0 && *se == 1) + (*se == 0 && *so == 1) +
          (*so == 0 && *sw == 1) + (*sw == 0 && *we == 1) +
          (*we == 0 && *nw == 1) + (*nw == 0 && *no == 1);
        int B = *no + *ne + *ea + *se + *so + *sw + *we + *nw;
        int m1 = iter == 0 ? (*no * *ea * *so) : (*no * *ea * *we);
        int m2 = iter == 0 ? (*ea * *so * *we) : (*no * *so * *we);

        if (A == 1 && (B >= 2 && B <= 6) && m1 == 0 && m2 == 0)
          pDst[x] = 1;
      }
    }

    img &= ~marker;
  }

  void thinning(const Mat& src, Mat& dst) {
    dst = src.clone();
    dst /= 255;         // convert to binary image

    Mat prev = Mat::zeros(dst.size(), CV_8UC1);
    Mat diff;

    do {
      thinningIteration(dst, 0);
      thinningIteration(dst, 1);
      absdiff(dst, prev, diff);
      dst.copyTo(prev);
      cout << "Thinning iteration, countNonZero = " << countNonZero(diff) << "\n";
    } while (countNonZero(diff) > 0);

    dst *= 255;
  }

  void fourPointsTransform(const Mat& frame, const Point2f vertices[], Mat& result) {
    const Size outputSize = Size(100, 32);

    Point2f targetVertices[4] = {
      Point(0, outputSize.height - 1),
      Point(0, 0), Point(outputSize.width - 1, 0),
      Point(outputSize.width - 1, outputSize.height - 1)
    };
    Mat rotationMatrix = getPerspectiveTransform(vertices, targetVertices);

    warpPerspective(frame, result, rotationMatrix, outputSize);
  }

  // Exported

  string photoToNFA(Mat img, string path, bool imgPreMade, bool testing) {
    string result;
    Mat3b src;
    if (!imgPreMade) {
      src = imread(path, IMREAD_COLOR);
      if (!src.data) {
        result += "could not open file\n";
        return result;
        throw runtime_error("Could not open file");
      }
    } else {
      src = img;
    }
    RNG rng;
    Mat1b gray;
    cvtColor(src, gray, COLOR_BGR2GRAY);
    GaussianBlur(gray, gray, Size(9, 9), 3);
    Mat1b bin;
    threshold(gray, bin, 95, 255, THRESH_BINARY_INV);
    // imshow("gray", gray);
    // imshow("bin", bin);
    // waitKey(0);
    // thinning(bin, bin);
    Mat3b res = src.clone();
    Mat3b contourRes = src.clone();
    vector<vector<Point>> contours;
    findContours(bin.clone(), contours, RETR_LIST, CHAIN_APPROX_NONE);
    cout << contours.size() << "\n";

    // Detect Circles
    vector<Circle> detectedCircles;
    bool first = true;
    for (vector<Point>& contour : contours) {
      // Compute convex hull
      vector<Point> hull;
      convexHull(contour, hull);
      Scalar color = Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255));
      for (Point p : contour) {
        circle(contourRes, p, 5, color);
      }

      // Compute circularity, used for shape classification
      double area = contourArea(hull);
      double perimeter = arcLength(hull, true);
      double circularity = (4 * CV_PI * area) / (perimeter * perimeter);

      // Shape classification
      if (circularity > 0.9) {
        // ellipse
        // RotatedRect rect = fitEllipse(contour);
        // ellipse(res, rect, color, 5);

        // min enclosing circle
        Point2f center;
        float radius;
        minEnclosingCircle(contour, center, radius);
        detectedCircles.push_back(Circle(center, radius));
        circle(res, center, radius, color, 5);

        // Remove circle from bin
        for (Point p : contour) {
          circle(bin, p, 1, Scalar(0, 0, 0), FILLED);
        }
      }
    }

    if (testing) {
      // int finalColumns = 9;
      // int x = src.cols * finalColumns;
      // int yD = (contours.size() / finalColumns) + 1;
      // int y = src.rows * yD;
      // Mat collage(Size(x, y), CV_8UC3, Scalar(255, 255, 255));
      // int i = 0;
      // int j = 0;
      // Scalar color = Scalar(0, 255, 0);
      // for (vector<Point>& contour : contours) {
      //   Mat3b img = src.clone();
      //   for (Point p : contour) {
      //     circle(img, p, 5, color);
      //   }
      //   img.copyTo(collage(Rect(i * img.cols, j * img.rows, img.cols, img.rows)));
      //   if (i == finalColumns - 1) {
      //     j++;
      //     i = 0;
      //   } else {
      //     i++;
      //   }
      // }
      // namedWindow("a", WINDOW_AUTOSIZE);
      // imshow("a", collage);
      namedWindow("blurred", WINDOW_AUTOSIZE);
      imshow("blurred", gray);
      namedWindow("bin", WINDOW_NORMAL);
      imshow("bin", bin);
      namedWindow("contours", WINDOW_AUTOSIZE);
      imshow("contours", contourRes);
      namedWindow("result", WINDOW_AUTOSIZE);
      imshow("result", res);
      waitKey(0);
    }

    result += "[\n";
    for (Circle c : detectedCircles) {
      result += "\t{center:{x:" + to_string(c.Center.x) + ",y:" + to_string(c.Center.y) + "},radius:" + to_string(c.Radius) + "}\n";
    }
    result += "]\n";




    // BLOB ATTEMPT

    // Mat blurredImg;
    // GaussianBlur(img, blurredImg, Size(15, 15), 9);

    // SimpleBlobDetector::Params params;
    // params.minThreshold = 10;
    // params.maxThreshold = 200;
    // params.filterByArea = false;
    // // params.minArea = 1000;
    // params.filterByCircularity = false;
    // params.filterByConvexity = false;
    // params.filterByInertia = false;

    // Ptr<SimpleBlobDetector> detector = SimpleBlobDetector::create(params);
    // vector<KeyPoint> keypoints;
    // detector->detect(blurredImg, keypoints);
    // Mat newImg;
    // drawKeypoints(img, keypoints, newImg, Scalar(0, 0, 255), DrawMatchesFlags::DRAW_RICH_KEYPOINTS);

    // namedWindow("blurred", WINDOW_AUTOSIZE);
    // imshow("blurred", blurredImg);
    // namedWindow("keypoints", WINDOW_AUTOSIZE);
    // imshow("keypoints", newImg);
    // waitKey(0);

    //  HOUGH_CIRCLES ATTEMT 

    // Mat gray;
    // cvtColor(img, gray, COLOR_BGR2GRAY);
    // GaussianBlur(gray, gray, Size(9, 9), 2);
    // vector<Vec3f> circles;
    // // HoughCircles(gray, circles, HOUGH_GRADIENT, 2, 200, 200, 100, 150, 300);
    // HoughCircles(gray, circles, HOUGH_GRADIENT, 2, 70, 200, 150);

    // result += "Width: " + to_string(img.cols) + "\n";
    // result += "Height: " + to_string(img.rows) + "\n";

    // vector<State> states;
    // for (int id = 0; id < circles.size(); id++) {
    //   Vec3f circle = circles[id];
    //   result += "X: " + to_string(circle[0]) + "\n";
    //   result += "Y: " + to_string(circle[1]) + "\n";
    //   result += "Radius: " + to_string(circle[2]) + "\n\n";
    //   int locX = circle[0] - img.cols / 2; // Still need to scale
    //   int locY = circle[1] - img.rows / 2;
    //   states.push_back(State(id, "q" + to_string(id), false, false, locX, locY));
    // }
    // vector<Transition> transitions;
    // result += NFA(false, states, transitions).convertToJSON(false);
    // if (testing) {
    //   for(size_t i = 0; i < circles.size(); i++) {
    //     Point center(cvRound(circles[i][0]), cvRound(circles[i][1]));
    //     int radius = cvRound(circles[i][2]);
    //     // draw the circle center
    //     circle(img, center, 3, Scalar(0, 255, 0), FILLED);
    //     // draw the circle outline
    //     circle(img, center, radius, Scalar(0, 0, 255), 3);
    //   }
    //   namedWindow("gray", WINDOW_AUTOSIZE);
    //   imshow("gray", gray);
    //   namedWindow("circles", WINDOW_AUTOSIZE);
    //   imshow("circles", img);
    //   waitKey(0);
    // }

    return result;
  }

  NFA simplifyDFA(NFA oldDfa) {
    MathmaticalDFA dfa(oldDfa);

    // Removing unreachable states
    set<int> reachableStates = { dfa.StartState };
    set<int> newStates = { dfa.StartState };

    while (!newStates.empty()) {
      set<int> temp;
      for (int newState : newStates) {
        for (string token : dfa.Alphabet) {
          temp.insert(dfa.TransitionTable[newState][token]);
        }
      }

      newStates = setDifference(temp, reachableStates);
      reachableStates = setUnion(reachableStates, newStates);
    }
    
    // Split into final and non-final states
    set<int> nonFinalStates;
    for (int stateId : reachableStates) {
      if (dfa.FinalStates.find(stateId) == dfa.FinalStates.end()) {
        nonFinalStates.insert(stateId);
      }
    }
    set<set<int>> p = { dfa.FinalStates, nonFinalStates };
    set<set<int>> w = { dfa.FinalStates, nonFinalStates };

    // Hopcrofts algorithm
    while (!w.empty()) {

      // Pop a from w
      auto iterator = w.begin();
      set<int> a = *iterator;
      w.erase(iterator);

      for (string token : dfa.Alphabet) {
        // Get x
        set<int> x;
        for (int state : dfa.States) {
          if (a.find(dfa.TransitionTable[state][token]) != a.end()) {
            x.insert(state);
          }
        }

        set<set<int>> newP = p;
        for (set<int> y : p) {
          set<int> intersection = setIntersection(x, y);
          set<int> difference = setDifference(y, x);
          if (!intersection.empty() && !difference.empty()) {
            newP.erase(y);
            newP.insert(intersection);
            newP.insert(difference);
            auto iterator = w.find(y);
            if (iterator != w.end()) {
              w.erase(iterator); // Remove y from w
              w.insert(intersection);
              w.insert(difference);
            } else {
              if (intersection.size() <= difference.size()) {
                w.insert(intersection);
              } else {
                w.insert(difference);
              }
            }
          }
        }
        p = newP;
      }
    }

    // Generate new DFA states
    vector<State> states;
    int id = 0;
    for (set<int> partition : p) {
      bool isStart = partition.find(dfa.StartState) != partition.end();
      bool isFinal = !setIntersection(partition, dfa.FinalStates).empty();
      states.push_back(State(id, "q" + to_string(id), isStart, isFinal, -1, -1));
      id++;
    }

    // Generate new DFA transitions
    vector<Transition> transitions;
    for (int fromState : reachableStates) {
      for (string token : dfa.Alphabet) {
        int fromId = 0;
        for (set<int> partition : p) {
          if (partition.find(fromState) != partition.end()) {
            break;
          }
          fromId++;
        }
        int toState = dfa.TransitionTable[fromState][token];
        int toId = 0;
        for (set<int> partition : p) {
          if (partition.find(toState) != partition.end()) {
            break;
          }
          toId++;
        }
        bool alreadyInList = false;
        for (Transition preAddedTransition : transitions) {
          if (preAddedTransition.From == fromId && preAddedTransition.To == toId && preAddedTransition.Token == token) {
            alreadyInList = true;
            break;
          }
        }
        if (!alreadyInList) {
          transitions.push_back(Transition(transitions.size(), fromId, toId, token));
        }
      }
    }

    return NFA(true, states, transitions);
  }

  NFA convertNFAtoDFA(NFA oldNfa) {
    MathmaticalNFA nfa(oldNfa);

    // Initiate stateSubsets
    set<set<int>> stateSubsets = {{}}; // Contains each possible subset of states
    for (int stateId : nfa.States) {
      set<set<int>> newStateSubsets = stateSubsets;
      for (set<int> currentSubset : stateSubsets) {
        set<int> newSubset = currentSubset;
        newSubset.insert(stateId);
        newStateSubsets.insert(newSubset);
      }
      stateSubsets = newStateSubsets;
    }

    vector<State> newStates;
    vector<Transition> newTransitions;

    int newId = 0;
    for (set<int> subset : stateSubsets) {

      // Detemine if corresponding state is start or final
      bool isStart = nfa.TransitionTable[nfa.StartState]["ε"] == subset;
      bool isFinal = !setIntersection(nfa.FinalStates, subset).empty();
      newStates.push_back(State(newId, "q" + to_string(newId), isStart, isFinal, -1, -1));

      // Make subsets corresponding transitions
      for (string token : nfa.Alphabet) {
        // Ignore all epsilon transitions
        if (token == "ε") {
          continue;
        }

        // Get the set of states that the NFA can be in after consuming token
        set<int> allResultingStates;
        for (int i : subset) {
          allResultingStates = setUnion(allResultingStates, nfa.TransitionTable[i][token]);
        }        
        int resultingId = distance(stateSubsets.begin(), stateSubsets.find(allResultingStates));
        newTransitions.push_back(Transition(newTransitions.size(), newId, resultingId, token));
      }
      newId++;
    }

    return simplifyDFA(NFA(true, newStates, newTransitions));
  }

  bool runDFA(NFA oldDfa, string word) {
    MathmaticalDFA dfa(oldDfa);
    int currentState = dfa.StartState;
    for (char character : word) {
      string characterString(1, character);
      currentState = dfa.TransitionTable[currentState][characterString];
    }
    return dfa.FinalStates.find(currentState) != dfa.FinalStates.end();
  }

  bool runNFA(NFA oldNfa, string word) {
    MathmaticalNFA nfa(oldNfa);

    set<int> currentStates = { nfa.StartState };
    for (char character : word) {
      string characterString(1, character);
      set<int> newStates = {};
      for (int currentState : currentStates) {
        set<int> epsilonClosure = nfa.TransitionTable[currentState]["ε"];
        for (int epsilonState : epsilonClosure) {
          newStates = setUnion(newStates, nfa.TransitionTable[epsilonState][characterString]);
        }
      }
      currentStates = newStates;
    }
    // Perform one final epsilon closure
    set<int> resultingStates;
    for (int currentState : currentStates) {
      resultingStates = setUnion(resultingStates, nfa.TransitionTable[currentState]["ε"]);
    }
    for (int resultingState : resultingStates) {
      if (nfa.FinalStates.find(resultingState) != nfa.FinalStates.end()) {
        return true;
      }
    }
    return false;
  }

  int validateNFA(NFA nfa) {
    int numStartStates = 0;
    vector<string> names;
    for (State state : nfa.States) {
      if (find(names.begin(), names.end(), state.Name) != names.end()) {
        return 1;
      }
      names.push_back(state.Name);
      if (state.IsStart) {
        numStartStates++;
      }
    }
    if (numStartStates != 1) {
      return 2;
    }
    vector<Transition> checkedTransitions;
    for (Transition transition : nfa.Transitions) {
      for (Transition checkedTransition : checkedTransitions) {
        if (checkedTransition.From == transition.From && checkedTransition.To == transition.To && checkedTransition.Token == transition.Token) {
          return 3;
        }
      }
      checkedTransitions.push_back(transition);
    }
    return 0;
  }

  bool checkIfDFA(NFA oldNfa) {
    // Start with checking for any epsilon transitions. If an epsilon transition to itself exists it will go undetected once converted to MathmaticalNFA
    for (Transition transition : oldNfa.Transitions) {
      if (transition.Token == "ε") {
        return false;
      }
    }
    MathmaticalNFA nfa(oldNfa);
    for (int state : nfa.States) {
      for (string token : nfa.Alphabet) {
        if (nfa.TransitionTable[state][token].size() != 1) {
          return false;
        }
      }
    }
    return true;
  }

  // string tesseractTest(string path) {
  //   string result;

  //   string outText;

  //   tesseract::TessBaseAPI* api = new tesseract::TessBaseAPI();
  //   // Initialize tesseract-ocr with English, without specifying tessdata path
  //   if (api->Init(NULL, "eng") == -1) {
  //     result += "Could not initialize tesseract.\n";
  //     return result;
  //   }

  //   Mat im = imread(path, IMREAD_COLOR);

  //   // Open input image with leptonica library
  //   // Pix* image = pixRead(path.c_str());
  //   api->SetPageSegMode(tesseract::PSM_AUTO);
  //   api->SetImage(im.data, im.cols, im.rows, 3, im.step);
  //   // Get OCR result
  //   outText = string(api->GetUTF8Text());
  //   result += "OCR output:\n" + outText;

  //   // Destroy used object and release memory
  //   api->End();
  //   delete api;
  //   // pixDestroy(&image);

//   //   return result;
//   // }

//   int fullOpenCVTextRecognition(string imPath) {
//     float confThreshold = 0.5;
//     float nmsThreshold = 0.4;

//     // Load networks.
//     TextDetectionModel_EAST detector("testing_resources/frozen_east_text_detection.pb");
//     detector.setConfidenceThreshold(confThreshold)
//             .setNMSThreshold(nmsThreshold);

//     TextRecognitionModel recognizer("testing_resources/crnn_cs.onnx");

//     // Load vocabulary
//     ifstream vocFile;
//     vocFile.open(samples::findFile("testing_resources/alphabet_94.txt"));
//     CV_Assert(vocFile.is_open());
//     String vocLine;
//     vector<String> vocabulary;
//     while (getline(vocFile, vocLine)) {
//       vocabulary.push_back(vocLine);
//     }
//     recognizer.setVocabulary(vocabulary);
//     recognizer.setDecodeType("CTC-greedy");

//     // Parameters for Recognition
//     double recScale = 1.0 / 127.5;
//     Scalar recMean = Scalar(127.5, 127.5, 127.5);
//     Size recInputSize = Size(100, 32);
//     recognizer.setInputParams(recScale, recInputSize, recMean);

//     // Parameters for Detection
//     double detScale = 1.0;
//     Size detInputSize = Size(320, 320);
//     Scalar detMean = Scalar(123.68, 116.78, 103.94);
//     bool swapRB = true;
//     detector.setInputParams(detScale, detInputSize, detMean, swapRB);

//     // Open an image file.
//     Mat frame = imread(imPath, IMREAD_COLOR);
//     cout << frame.size << "\n";

//     // Detection
//     vector<vector<Point>> detResults;
//     detector.detect(frame, detResults);
//     Mat result = frame.clone();

//     if (detResults.size() > 0) {
//       // Text Recognition
//       vector<vector<Point>> contours;
//       for (uint i = 0; i < detResults.size(); i++) {
//         vector<Point> quadrangle = detResults[i];
//         CV_CheckEQ(quadrangle.size(), (size_t) 4, "");
//         contours.emplace_back(quadrangle);
//         vector<Point2f> quadrangle_2f;
//         for (int j = 0; j < 4; j++) {
//           quadrangle_2f.emplace_back(quadrangle[j]);
//         }
//         Mat cropped;
//         fourPointsTransform(frame, &quadrangle_2f[0], cropped); // Maybe change frame to be grayscale
//         string recognitionResult = recognizer.recognize(cropped);
//         cout << i << ": '" << recognitionResult << "'\n";
//         putText(result, recognitionResult, quadrangle[3], FONT_HERSHEY_SIMPLEX, 1.5, Scalar(0, 0, 255), 2);
//       }
//       polylines(result, contours, true, Scalar(0, 255, 0), 2);
//     }
//     imshow("EAST: An Efficient and Accurate Scene Text Detector", result);
//     waitKey(0);
//     return 0;
//   }

//   string textDetection(string imPath) {
//     Mat frame = imread(imPath);

//     TextDetectionModel_EAST model("testing_resources/frozen_east_text_detection.pb");
//     float confThresh = 0.5;
//     float nmsThresh = 0.4;
//     model.setConfidenceThreshold(confThresh).setNMSThreshold(nmsThresh);
//     double detScale = 1.0;
//     Size detInputSize = Size(320, 320);
//     Scalar detMean = Scalar(123.68, 116.78, 103.94);
//     bool swapRB = true;
//     model.setInputParams(detScale, detInputSize, detMean, swapRB);

//     vector<vector<Point>> results;
//     model.detect(frame, results);

//     polylines(frame, results, true, Scalar(0, 255, 0), 2);
//     imshow("Text Detection", frame);
//     waitKey(0);

//     return "";
//   }

//   string textRecognition(string imPath) {
//     Mat image = imread(imPath, IMREAD_COLOR);

//     // Load models
//     TextRecognitionModel model("testing_resources/crnn_cs.onnx");
//     model.setDecodeType("CTC-greedy");

//     // Load vocabulary
//     ifstream vocFile;
//     vocFile.open("testing_resources/alphabet_94.txt");
//     CV_Assert(vocFile.is_open());
//     String vocLine;
//     vector<String> vocabulary;
//     while (getline(vocFile, vocLine)) {
//       vocabulary.push_back(vocLine);
//     }
//     model.setVocabulary(vocabulary);

//     // Set parameters
//     double scale = 1.0 / 127.5;
//     Scalar mean = Scalar(127.5, 127.5, 127.5);
//     Size inputSize = Size(100, 32);
//     model.setInputParams(scale, inputSize, mean);

//     // Output
//     string recognitionResult = model.recognize(image);
//     // cout << "'" << recognitionResult << "'" << endl;
//     return recognitionResult;
//   }
}
