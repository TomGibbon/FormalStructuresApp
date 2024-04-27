#include "mainCode.hpp"

using namespace std;
using namespace cv;

namespace mainCode {
  // ==================================
  // ========= ** Classes ** ==========
  // ==================================

  // State
  State::State(int id, string name, bool isStart, bool isFinal):
    Id(id), Name(name), IsStart(isStart), IsFinal(isFinal) {}

  string State::convertToJSON(bool testing) {
    if (testing) { // Adds spaces and tabs to make it more readable
      return "\n\t\t\t{ \"id\":" + to_string(Id) + ", \"name\":\"" + Name + "\", \"isStart\":" + boolToString(IsStart) + ", \"isFinal\":" + boolToString(IsFinal) + " }";
    } else {
      return "{\"id\":" + to_string(Id) + ",\"name\":\"" + Name + "\",\"isStart\":" + boolToString(IsStart) + ",\"isFinal\":" + boolToString(IsFinal) + "}";
    }
  }

  // Transition
  Transition::Transition(int id, int start, int end, string token):
    Id(id), Start(start), End(end), Token(token) {}

  string Transition::convertToJSON(bool testing) {
    if (testing) { // Adds spaces and tabs to make it more readable
      return "\n\t\t\t{ \"id\":" + to_string(Id) + ", \"start\":" + to_string(Start) + ", \"end\":" + to_string(End) + ", \"token\":\"" + Token + "\" }";
    } else {
      return "{\"id\":" + to_string(Id) + ",\"start\":" + to_string(Start) + ",\"end\":" + to_string(End) + ",\"token\":\"" + Token + "\"}";
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
    if (Transitions.size() > 0) { // Initial check due to size_t underflow probelem
      for (; i < Transitions.size() - 1; i++) {
        transitionsJSON += Transitions[i].convertToJSON(testing) + ",";
        if (testing) {
          transitionsJSON += " ";
        }
      }
      transitionsJSON += Transitions[i].convertToJSON(testing);
    }

    if (testing) { // Add spaces and tabs to make it more readable
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
      map<int, map<string, int>> transitionTable;
      for (Transition transition : dfa.Transitions) {
        int start = transition.Start;
        int end = transition.End;
        string token = transition.Token;

        map<string, int> startTable = transitionTable[start];  // Get current transitions for start state
        startTable[token] = end; // Add new transition to it
        transitionTable[start] = startTable;
      }
      TransitionTable = transitionTable;
    }

  // MathmaticalNFA
  MathmaticalNFA::MathmaticalNFA(set<int> states, set<string> alphabet, map<int, map<string, set<int>>> transitionTable, int startState, set<int> finalStates):
    States(states), Alphabet(alphabet), TransitionTable(transitionTable), StartState(startState), FinalStates(finalStates) {}

  MathmaticalNFA::MathmaticalNFA(NFA nfa):
    States(getStates(nfa.States)), Alphabet(getAlphabet(nfa.Transitions)), StartState(getStartState(nfa.States)), FinalStates(getFinalStates(nfa.States)) {
      Alphabet.insert("ε"); // Make sure that epsilon is in the alphabet
      map<int, map<string, set<int>>> transitionTable;

      // Start by adding all single transitions
      for (Transition transition : nfa.Transitions) {
        transitionTable[transition.Start][transition.Token].insert(transition.End);
      }

      // Get epsilon transitions
      for (State state : nfa.States) {
        transitionTable[state.Id]["ε"].insert(state.Id); // Make sure itself is added

        // Continue checking epsilon closure of states until no new ones are detected
        set<int> remaining = transitionTable[state.Id]["ε"]; // Contains all states that need to have their epsilon closure checked
        while (!remaining.empty()) {
          // Pop front
          auto iterator = remaining.begin();
          int current = *iterator; // Contains the next state that needs to be checked
          remaining.erase(iterator);
          set<int> newStates = transitionTable[current]["ε"]; // Get epsilon closure of current
          for (int newState : newStates) { // Check if any of the resulting states are new
            if (transitionTable[state.Id]["ε"].find(newState) == transitionTable[state.Id]["ε"].end()) {
              transitionTable[state.Id]["ε"].insert(newState);
              remaining.insert(newState); // New state so must be checked later
            }
          }
        }
      }

      // Update with epsilon transitions
      for (State state : nfa.States) {
        for (string token : Alphabet) {
          if (token == "ε") {
            continue; // Already done
          } else {
            for (int epsilonTransition : transitionTable[state.Id]["ε"]) {
              set<int> resultingTransitions = transitionTable[epsilonTransition][token];
              set<int> totalResultingTransitions = resultingTransitions;
              // Make sure to check any epsilon transitions of resulting states
              for (int resultingTransition : resultingTransitions) {
                totalResultingTransitions = setUnion(totalResultingTransitions, transitionTable[resultingTransition]["ε"]);
              }
              transitionTable[state.Id][token] = setUnion(transitionTable[state.Id][token], totalResultingTransitions);
            }
          }
        }
      }
      TransitionTable = transitionTable;
    }

  Circle::Circle(Point center, float radius):
    Center(center), Radius(radius) {}

  StateCircle::StateCircle(State correspondingState, Circle correspondingCircle):
    CorrespondingState(correspondingState), CorrespondingCircle(correspondingCircle) {}

  StateCircle::StateCircle():
    CorrespondingState(State(0, "", false, false)), CorrespondingCircle(Circle(Point(), 0)) {}

  Arrow::Arrow(Point tip, Point tail):
    Tip(tip), Tail(tail) {}
  
  // ==================================
  // ===== ** Helper Functions ** =====
  // ==================================

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

  // ==================================
  // === ** DFA / NFA Functions ** ====
  // ==================================

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

  // ==================================
  // ===== ** OpenCV Functions ** =====
  // ==================================

  // This function is originally designed at https://stackoverflow.com/questions/66718462/how-to-detect-different-types-of-arrows-in-image
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

        if (A == 1 && (B >= 2 && B <= 6) && m1 == 0 && m2 == 0) {
          pDst[x] = 1;
        }
      }
    }

    img &= ~marker;
  }

  // This function is originally designed at https://stackoverflow.com/questions/66718462/how-to-detect-different-types-of-arrows-in-image
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

  // ==================================
  // = ** Main Exported Functions ** ==
  // ==================================

  string photoToNFA(string path, bool testing) {
    cout << "\n";
    Mat src = imread(path, IMREAD_COLOR);
    if (!src.data) {
      return "Could not open file";
    }
    if (src.cols == 3024 && src.rows == 4032) {
      resize(src, src, Size(1260, 1680)); // Resize to speed up thinning
    } 
    cout << "Cols: " << src.cols << ", Rows: " << src.rows << "\n";
    int srcSize = src.cols * src.rows;
    RNG rng;
    Mat gray;
    cvtColor(src, gray, COLOR_BGR2GRAY); // Grayscale
    Mat blurred;
    GaussianBlur(gray, blurred, Size(7, 7), 1); // Add blur to remove noise
    Mat outputArray;
    double thresholdValue = threshold(blurred, outputArray, 0, 255, THRESH_BINARY + THRESH_OTSU);
    thresholdValue -= 20;
    cout << "thresholdValue: " << to_string(thresholdValue) << "\n";
    Mat bin;
    threshold(blurred, bin, thresholdValue, 255, THRESH_BINARY_INV);
    if (testing) {
      imshow("binunthinned", bin);
      imshow("blurred", blurred);
      waitKey(0);
    }
    thinning(bin, bin);
    Mat res = src.clone(); // Final result
    Mat circleRes = src.clone(); // Image with all circles detected
    Mat arrowRes = src.clone(); // Image with all arrows detected
    Mat contourRes = src.clone(); // Image with contours
    vector<vector<Point>> contours;
    findContours(bin.clone(), contours, RETR_LIST, CHAIN_APPROX_NONE); // Gets contours
    for (int i = 0; i < contours.size(); i++) {
      Scalar color = Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255));
      drawContours(contourRes, contours, i, color, 5);
    }
    int minArrowArea = ceil(srcSize / 400);
    int minCircleArea = ceil(srcSize / 910);
    int duplicateContourThreshold = ceil(srcSize / 1200000);

    // Detect Circles
    vector<Circle> detectedCircles;
    vector<vector<Point>> remainingContours;
    for (int i = 0; i < contours.size(); i++) {
      vector<Point> contour = contours[i];
      // Compute convex hull
      vector<Point> hull;
      convexHull(contour, hull);

      // Compute circularity, used for shape classification
      double area = contourArea(hull);
      double perimeter = arcLength(hull, true);
      double circularity = (4 * CV_PI * area) / (perimeter * perimeter);
      if (circularity > 0.92 && area > minCircleArea) {
        Point2f center;
        float radius;
        minEnclosingCircle(contour, center, radius); // Get min enclosing circle

        // Check for duplicate circle detection
        bool duplicate = false;
        for (Circle circle : detectedCircles) {
          if (abs(center.x - circle.Center.x) <= 10 && abs(center.y - circle.Center.y) <= 10 && abs(radius - circle.Radius) <= 10) {
            duplicate = true;
          }
        }

        if (!duplicate) {
          Scalar color = Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255));
          circle(circleRes, center, radius, color, 3);
          detectedCircles.push_back(Circle(center, radius));
        }
      } else {
        remainingContours.push_back(contour); // Must check later if its an arrow
      }
    }

    // Detect Arrows
    vector<Arrow> detectedArrows;
    for (vector<Point> contour : remainingContours) {
      // Filter contours too small to be an arrow
      Rect boundingBox = boundingRect(contour);
      if (boundingBox.area() < minArrowArea) {
        continue;
      }

      // Work on only one contour at a time
      Mat newBinary(bin.size(), CV_8UC1, Scalar(0));
      drawContours(newBinary, vector<vector<Point>>{ contour }, 0, Scalar(10));

      // Extract end points
      int kernelData[3][3] = {
        {1, 1, 1},
        {1, 10, 1},
        {1, 1, 1}
      };
      Mat kernel(3, 3, CV_32SC1, kernelData);
      Mat endPointImg;
      filter2D(newBinary, endPointImg, -1, kernel);
      for (int y = 0; y < endPointImg.rows; y++) {
        for (int x = 0; x < endPointImg.cols; x++) {
          if (endPointImg.at<uchar>(y, x) == 110) {
            endPointImg.at<uchar>(y, x) = 255;
          } else {
            endPointImg.at<uchar>(y, x) = 0;
          }
        }
      }

      // Find clusters
      vector<Point> nonZeroPoints;
      findNonZero(endPointImg, nonZeroPoints);
      if (nonZeroPoints.size() != 3 && nonZeroPoints.size() != 4) { // Allow tip to have either 2 or 3 endpoints and tail have only 1
        continue;
      }
      Mat points(nonZeroPoints.size(), 2, CV_32SC1);
      for (int i = 0; i < nonZeroPoints.size(); i++) {
        points.at<int>(i, 0) = nonZeroPoints[i].x;
        points.at<int>(i, 1) = nonZeroPoints[i].y;
      }
      Mat floatPoints;
      points.convertTo(floatPoints, CV_32FC1);
      TermCriteria criteria(TermCriteria::EPS + TermCriteria::MAX_ITER, 10, 1.0);
      Mat labels, centers;
      kmeans(floatPoints, 2, labels, criteria, 10, KMEANS_RANDOM_CENTERS, centers);

      // Identify tip and tail
      int cluster0Count = 0;
      int cluster1Count = 0;
      for (int i = 0; i < labels.rows; i++) {
        if (labels.at<int>(i, 0) == 0) {
          cluster0Count++;
        } else {
          cluster1Count++;
        }
      }

      if (cluster0Count != 1 && cluster1Count != 1) { // Tail must only have 1 endpoint
        continue;
      }

      // Convert cluster centers to points
      Point tip;
      Point tail;
      if (cluster0Count > cluster1Count) { // Tip has more endpoints than tail
        tip = Point(centers.at<float>(0, 0), centers.at<float>(0, 1));
        tail = Point(centers.at<float>(1, 0), centers.at<float>(1, 1));
      } else {
        tail = Point(centers.at<float>(0, 0), centers.at<float>(0, 1));
        tip = Point(centers.at<float>(1, 0), centers.at<float>(1, 1));
      }

      // Draw onto res
      Scalar color = Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255));
      circle(arrowRes, tip, 20, color, FILLED);
      circle(arrowRes, tail, 20, color, FILLED);

      detectedArrows.push_back(Arrow(tip, tail));
    }

    // Generate NFA
    vector<StateCircle> stateCircles;
    vector<Circle> circlesToSkip;
    int stateId = 0;
    for (Circle circle : detectedCircles) {

      // Check if current circle is a final inner ring
      bool found = false;
      for (Circle innerCircle : circlesToSkip) {
        if (innerCircle.Center.x == circle.Center.x &&
            innerCircle.Center.y == circle.Center.y &&
            innerCircle.Radius == circle.Radius) {
          found = true;
          break;
        }
      }

      if (!found) {
        // Check for final state circle
        bool isFinal = false;
        for (Circle secondCircle : detectedCircles) {
          bool secondWithinCircle = secondCircle.Radius < circle.Radius && secondCircle.Radius > circle.Radius / 2; // Inner radius must be within 50-100% of the outer radius
          bool circleWithinSecond = circle.Radius < secondCircle.Radius && circle.Radius > secondCircle.Radius / 2;
          bool circlesWithinEachOther = sqrt(std::pow(circle.Center.x - secondCircle.Center.x, 2) + std::pow(circle.Center.y - secondCircle.Center.y, 2)) < abs(circle.Radius - secondCircle.Radius);
          if ((circleWithinSecond || secondWithinCircle) && circlesWithinEachOther) {
            isFinal = true;
            if (circle.Radius > secondCircle.Radius) { // State cirle is the outer circle
              stateCircles.push_back(StateCircle(State(stateId, "q" + to_string(stateId), false, true), circle));
              circlesToSkip.push_back(secondCircle); // May check in seperate loop
            } else {
              stateCircles.push_back(StateCircle(State(stateId, "q" + to_string(stateId), false, true), secondCircle));
              circlesToSkip.push_back(secondCircle); // May check in seperate loop
            }
          }
        }
        if (!isFinal) {
          stateCircles.push_back(StateCircle(State(stateId, "q" + to_string(stateId), false, false), circle));
        }
        stateId++;
      }
    }

    // Draw circles onto res
    for (StateCircle c : stateCircles) {
      Scalar color = Scalar(rng.uniform(0, 255), rng.uniform(0, 255), rng.uniform(0, 255));
      circle(res, c.CorrespondingCircle.Center, c.CorrespondingCircle.Radius, color, 5);
    }

    // Find transitions
    vector<Transition> transitions;
    int startId = -1;
    int transitionId = 0;
    for (Arrow arrow : detectedArrows) {
      // Calculate tip and tail distances from states
      float minTipDistance = INFINITY; // Default as max value
      float minTailDistance = INFINITY;
      StateCircle tipStateCircle;
      StateCircle tailStateCircle;
      for (StateCircle stateCircle : stateCircles) {
        float tipDistance = sqrt(std::pow(arrow.Tip.x - stateCircle.CorrespondingCircle.Center.x, 2) + std::pow(arrow.Tip.y - stateCircle.CorrespondingCircle.Center.y, 2));
        float tailDistance = sqrt(std::pow(arrow.Tail.x - stateCircle.CorrespondingCircle.Center.x, 2) + std::pow(arrow.Tail.y - stateCircle.CorrespondingCircle.Center.y, 2));
        if (tipDistance < minTipDistance) {
          minTipDistance = tipDistance;
          tipStateCircle = stateCircle;
        }
        if (tailDistance < minTailDistance) {
          minTailDistance = tailDistance;
          tailStateCircle = stateCircle;
        }
      }
      // Check if starting arrow
      if (minTipDistance < 2.5 * tipStateCircle.CorrespondingCircle.Radius) { // Arrow too far away
        if (minTailDistance > 1.7 * tailStateCircle.CorrespondingCircle.Radius) {
          // Starting arrow
          Scalar color = Scalar(0, 0, 255);
          circle(res, arrow.Tip, 5, color, FILLED);
          circle(res, arrow.Tail, 5, color, FILLED);
          putText(res, "START", arrow.Tail, FONT_HERSHEY_SIMPLEX, 0.8, color, 2);
          if (startId == -1) {
            startId = tipStateCircle.CorrespondingState.Id;
          } else {
            cout << "\nFailed: More than 1 start state\n";
            if (testing) {
              imshow("contours", contourRes);
              imshow("result", res);
              imshow("circles", circleRes);
              imshow("arrows", arrowRes);
              waitKey(0);
            }
            return "More than 1 start state";
          }
        } else {
          // Regular transition
          transitions.push_back(Transition(transitionId, tailStateCircle.CorrespondingState.Id, tipStateCircle.CorrespondingState.Id, "0"));
          Scalar color = Scalar(0, 0, 255);
          circle(res, arrow.Tip, 5, color, FILLED);
          circle(res, arrow.Tail, 5, color, FILLED);
          transitionId++;
        }
      }
    }
    if (startId == -1) {
      cout << "\nFailed: No start state\n";
      if (testing) {
        imshow("contours", contourRes);
        imshow("result", res);
        imshow("circles", circleRes);
        imshow("arrows", arrowRes);
        waitKey(0);
      }
      return "No start state";
    }
    vector<State> states;
    for (StateCircle stateCircle : stateCircles) {
      State state = stateCircle.CorrespondingState;
      // Check for states with no transitions (i.e. dead circles)
      bool noTransitions = true;
      for (Transition transition : transitions) {
        if (transition.Start == state.Id || transition.End == state.Id) {
          noTransitions = false;
        }
      }
      if (state.Id == startId) {
        state.IsStart = true;
      }
      if (noTransitions && !state.IsStart) {
        continue;
      }
      states.push_back(state);

      // Draw state
      Scalar color = Scalar(255, 0, 0);
      circle(res, stateCircle.CorrespondingCircle.Center, stateCircle.CorrespondingCircle.Radius, color, 5);
      putText(res, state.Name, stateCircle.CorrespondingCircle.Center, FONT_HERSHEY_SIMPLEX, 0.8, color, 2);
      if (state.IsFinal) {
        circle(res, stateCircle.CorrespondingCircle.Center, 0.8 * stateCircle.CorrespondingCircle.Radius, color, 5);
      }
    }

    NFA nfa(false, states, transitions);

    bool isDFA = checkIfDFA(nfa); // Calculate whether it is a DFA or NFA
    nfa.IsDfa = isDFA;

    cout << nfa.convertToJSON(true);
    if (testing) {
      imshow("contours", contourRes);
      imshow("circles", circleRes);
      imshow("arrows", arrowRes);
      imshow("result", res);
      waitKey(0);
    }

    return nfa.convertToJSON(false);
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
    set<int> finalStates;
    for (int stateId : reachableStates) {
      if (dfa.FinalStates.find(stateId) == dfa.FinalStates.end()) {
        nonFinalStates.insert(stateId);
      } else {
        finalStates.insert(stateId);
      }
    }

    // Must not add empty sets as Hopcrofts algorithm cannot remove them.
    set<set<int>> p;
    if (!finalStates.empty()) {
      p.insert(finalStates);
    }
    if (!nonFinalStates.empty()) {
      p.insert(nonFinalStates);
    }
    set<set<int>> w = p;

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
      states.push_back(State(id, "q" + to_string(id), isStart, isFinal));
      id++;
    }

    // Generate new DFA transitions
    vector<Transition> transitions;
    for (int startState : reachableStates) {
      for (string token : dfa.Alphabet) {
        // Find the start state
        int startId = 0;
        for (set<int> partition : p) {
          if (partition.find(startState) != partition.end()) {
            break;
          }
          startId++;
        }
        // Find the end state
        int endState = dfa.TransitionTable[startState][token];
        int endId = 0;
        for (set<int> partition : p) {
          if (partition.find(endState) != partition.end()) {
            break;
          }
          endId++;
        }
        // Check if transition has already been generated
        bool alreadyInList = false;
        for (Transition preAddedTransition : transitions) {
          if (preAddedTransition.Start == startId && preAddedTransition.End == endId && preAddedTransition.Token == token) {
            alreadyInList = true;
            break;
          }
        }
        if (!alreadyInList) {
          transitions.push_back(Transition(transitions.size(), startId, endId, token));
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
      newStates.push_back(State(newId, "q" + to_string(newId), isStart, isFinal));

      string result0;
      string result1;
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

  set<int> runDFA(NFA oldDfa, string word) {
    MathmaticalDFA dfa(oldDfa); // Convert to Mathmatical model

    int currentState = dfa.StartState;
    for (char character : word) {
      string characterString(1, character);
      if (dfa.TransitionTable[currentState].count(characterString) > 0) { // Must check, as an undefined transition will default in 0
        currentState = dfa.TransitionTable[currentState][characterString];
      } else {
        return set<int> {};
      }
    }
    return set<int> { currentState };
  }

  set<int> runNFA(NFA oldNfa, string word) {
    MathmaticalNFA nfa(oldNfa);

    set<int> currentStates = { nfa.StartState };
    for (char character : word) {
      string characterString(1, character); // Must have character as a string not a char
      set<int> newStates = {};
      for (int currentState : currentStates) {
        set<int> epsilonClosure = nfa.TransitionTable[currentState]["ε"];
        for (int epsilonState : epsilonClosure) {
          newStates = setUnion(newStates, nfa.TransitionTable[epsilonState][characterString]); // No need to check if transition exists, default value would be {} which is the desired outcome
        }
      }
      currentStates = newStates;
    }
    // Perform one final epsilon closure
    set<int> resultingStates;
    for (int currentState : currentStates) {
      resultingStates = setUnion(resultingStates, nfa.TransitionTable[currentState]["ε"]);
    }
    return resultingStates;
  }

  int validateNFA(NFA nfa) {
    int numStartStates = 0;
    vector<string> names; // Stores all names from states when checking for duplicate
    for (State state : nfa.States) {
      if (find(names.begin(), names.end(), state.Name) != names.end()) {
        return 1; // Duplicate state name
      }
      names.push_back(state.Name);
      if (state.IsStart) {
        numStartStates++;
      }
    }
    if (numStartStates != 1) {
      return 2; // Wrong number of start states
    }
    vector<Transition> checkedTransitions;
    for (Transition transition : nfa.Transitions) {
      for (Transition checkedTransition : checkedTransitions) {
        if (checkedTransition.Start == transition.Start && checkedTransition.End == transition.End && checkedTransition.Token == transition.Token) {
          return 3; // Duplicate transition
        }
      }
      checkedTransitions.push_back(transition);
    }
    return 0; // NFA is valid
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
        if (nfa.TransitionTable[state][token].size() != 1) { // There should be exactly 1 transition for each token from each state for a DFA
          return false;
        }
      }
    }
    return true;
  }
}