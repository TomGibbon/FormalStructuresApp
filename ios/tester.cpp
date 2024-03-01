#include "mainCode.hpp"
#include <iostream>

using namespace std;
using namespace cv;
using namespace mainCode;

class TestObject {
  public:
    string Name;
    bool (*Function)();

    TestObject(string name, bool (*function)()) : Name(name), Function(function) {}
};

const char* greenColor = "\033[32m";
const char* redColor = "\033[31m";
const char* whiteColor = "\033[0m";

void printOutcome(bool passed) {
  if (passed) {
    cout << greenColor << "Passed!";
  } else {
    cout << redColor << "Failed";
  }
  cout << whiteColor << "\n";
}

bool setIntersectionTest() {
  set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  set<int> predictedResult = { 1, 2, 5 };
  set<int> result = setIntersection(set1, set2);
  return result == predictedResult;
}

bool setUnionTest() {
  set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  set<int> predictedResult = { 0, 1, 2, 3, 4, 5, 6, 7 };
  set<int> result = setUnion(set1, set2);
  return result == predictedResult;
}

bool setDifferenceTest() {
  set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  set<int> predictedResult = { 0, 4 };
  set<int> result = setDifference(set1, set2);
  return result == predictedResult;
}

bool simplifyDFATest() {
  vector<State> states;
  states.push_back(State(0, "q0", true, false, 0, 0));
  states.push_back(State(1, "q1", false, true, 0, 0));
  states.push_back(State(2, "q2", false, true, 0, 0));
  states.push_back(State(3, "q3", false, false, 0, 0));
  states.push_back(State(4, "q4", false, true, 0, 0));
  states.push_back(State(5, "q5", false, false, 0, 0));
  states.push_back(State(6, "q6", false, false, 0, 0));
  vector<Transition> transitions;
  transitions.push_back(Transition(0, 0, 3, "0"));
  transitions.push_back(Transition(1, 0, 1, "1"));
  transitions.push_back(Transition(2, 1, 2, "0"));
  transitions.push_back(Transition(3, 1, 5, "1"));
  transitions.push_back(Transition(4, 2, 2, "0"));
  transitions.push_back(Transition(5, 2, 5, "1"));
  transitions.push_back(Transition(6, 3, 0, "0"));
  transitions.push_back(Transition(7, 3, 4, "1"));
  transitions.push_back(Transition(8, 4, 2, "0"));
  transitions.push_back(Transition(9, 4, 5, "1"));
  transitions.push_back(Transition(10, 5, 5, "0"));
  transitions.push_back(Transition(11, 5, 5, "1"));
  transitions.push_back(Transition(12, 6, 6, "0"));
  transitions.push_back(Transition(13, 6, 6, "1"));
  NFA dfa(true, states, transitions);

  string predictedResult = "{\"structure\":{\"isDfa\":true,\"states\":[{\"id\":0,\"name\":\"q0\",\"isStart\":true,\"isFinal\":false,\"locX\":-1,\"locY\":-1},{\"id\":1,\"name\":\"q1\",\"isStart\":false,\"isFinal\":true,\"locX\":-1,\"locY\":-1},{\"id\":2,\"name\":\"q2\",\"isStart\":false,\"isFinal\":false,\"locX\":-1,\"locY\":-1}],\"transitions\":[{\"from\":0,\"to\":0,\"token\":\"0\"},{\"from\":0,\"to\":1,\"token\":\"1\"},{\"from\":1,\"to\":1,\"token\":\"0\"},{\"from\":1,\"to\":2,\"token\":\"1\"},{\"from\":2,\"to\":2,\"token\":\"0\"},{\"from\":2,\"to\":2,\"token\":\"1\"}]},\"type\":\"nfa\"}";
  string result = simplifyDFA(dfa).convertToJSON(false);

  return result == predictedResult;
}

bool convertNFAtoDFATest() {
  vector<State> states;
  states.push_back(State(0, "a", true, false, 0, 0));
  states.push_back(State(1, "b", false, false, 0, 0));
  states.push_back(State(2, "c", false, false, 0, 0));
  states.push_back(State(3, "d", false, true, 0, 0));
  vector<Transition> transitions;
  transitions.push_back(Transition(0, 0, 1, "1"));
  transitions.push_back(Transition(1, 0, 2, "ε"));
  transitions.push_back(Transition(2, 0, 3, "1"));
  transitions.push_back(Transition(3, 1, 3, "0"));
  transitions.push_back(Transition(4, 1, 3, "1"));
  transitions.push_back(Transition(5, 2, 3, "ε"));
  transitions.push_back(Transition(6, 3, 3, "0"));
  NFA nfa(false, states, transitions);

  string predictedResult = "{\"structure\":{\"isDfa\":true,\"states\":[{\"id\":0,\"name\":\"q0\",\"isStart\":false,\"isFinal\":false,\"locX\":-1,\"locY\":-1},{\"id\":1,\"name\":\"q1\",\"isStart\":true,\"isFinal\":true,\"locX\":-1,\"locY\":-1},{\"id\":2,\"name\":\"q2\",\"isStart\":false,\"isFinal\":true,\"locX\":-1,\"locY\":-1},{\"id\":3,\"name\":\"q3\",\"isStart\":false,\"isFinal\":true,\"locX\":-1,\"locY\":-1}],\"transitions\":[{\"from\":0,\"to\":0,\"token\":\"0\"},{\"from\":0,\"to\":0,\"token\":\"1\"},{\"from\":1,\"to\":3,\"token\":\"0\"},{\"from\":1,\"to\":2,\"token\":\"1\"},{\"from\":2,\"to\":3,\"token\":\"0\"},{\"from\":2,\"to\":3,\"token\":\"1\"},{\"from\":3,\"to\":3,\"token\":\"0\"},{\"from\":3,\"to\":0,\"token\":\"1\"}]},\"type\":\"nfa\"}";
  string result = convertNFAtoDFA(nfa).convertToJSON(false);

  return result == predictedResult;
}

bool runDFATest() {
  vector<State> states;
  states.push_back(State(0, "q0", true, false, 0, 0));
  states.push_back(State(1, "q1", false, true, 0, 0));
  states.push_back(State(2, "q2", false, true, 0, 0));
  states.push_back(State(3, "q3", false, false, 0, 0));
  states.push_back(State(4, "q4", false, true, 0, 0));
  states.push_back(State(5, "q5", false, false, 0, 0));
  states.push_back(State(6, "q6", false, false, 0, 0));
  vector<Transition> transitions;
  transitions.push_back(Transition(0, 0, 3, "0"));
  transitions.push_back(Transition(1, 0, 1, "1"));
  transitions.push_back(Transition(2, 1, 2, "0"));
  transitions.push_back(Transition(3, 1, 5, "1"));
  transitions.push_back(Transition(4, 2, 2, "0"));
  transitions.push_back(Transition(5, 2, 5, "1"));
  transitions.push_back(Transition(6, 3, 0, "0"));
  transitions.push_back(Transition(7, 3, 4, "1"));
  transitions.push_back(Transition(8, 4, 2, "0"));
  transitions.push_back(Transition(9, 4, 5, "1"));
  transitions.push_back(Transition(10, 5, 5, "0"));
  transitions.push_back(Transition(11, 5, 5, "1"));
  transitions.push_back(Transition(12, 6, 6, "0"));
  transitions.push_back(Transition(13, 6, 6, "1"));
  NFA dfa(true, states, transitions);
  string word = "000010011";

  bool predictedResult = false;
  bool result = runDFA(dfa, word);

  return result == predictedResult;
}

bool runNFATest() {
  vector<State> states;
  states.push_back(State(0, "a", true, false, 0, 0));
  states.push_back(State(1, "b", false, false, 0, 0));
  states.push_back(State(2, "c", false, false, 0, 0));
  states.push_back(State(3, "d", false, true, 0, 0));
  vector<Transition> transitions;
  transitions.push_back(Transition(0, 0, 1, "1"));
  transitions.push_back(Transition(1, 0, 2, "ε"));
  transitions.push_back(Transition(2, 0, 3, "1"));
  transitions.push_back(Transition(3, 1, 3, "0"));
  transitions.push_back(Transition(4, 1, 3, "1"));
  transitions.push_back(Transition(5, 2, 3, "ε"));
  transitions.push_back(Transition(6, 3, 3, "0"));

  transitions.push_back(Transition(7, 1, 2, "2"));
  transitions.push_back(Transition(8, 1, 2, "1"));
  NFA nfa(false, states, transitions);
  // string word = "1100";
  string word = "12";

  bool predictedResult = true;
  bool result = runNFA(nfa, word);

  return result == predictedResult;
}

bool validateNFATest() {
  bool overallPass = true;

  cout << "\n- Duplicate names: ";
  State s0(0, "a", true, true, 0, 0);
  State s1(1, "a", false, false, 0, 0);
  vector<State> states = { s0, s1 };
  vector<Transition> transitions;
  NFA nfa(false, states, transitions);
  int predictedResult = 1;
  int result = validateNFA(nfa);
  bool passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- No starting state: ";
  states = { s1 };
  nfa.States = states;
  predictedResult = 2;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- More than one starting state: ";
  State s2(2, "b", true, false, 0, 0);
  states = { s0, s2 };
  nfa.States = states;
  predictedResult = 2;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- Duplicate transition: ";
  states = { s1, s2 };
  Transition t1(0, 1, 2, "0");
  Transition t2(1, 1, 2, "0");
  transitions = { t1, t2 };
  nfa.States = states;
  nfa.Transitions = transitions;
  predictedResult = 3;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- Allowed: ";
  transitions = { t1 };
  nfa.Transitions = transitions;
  predictedResult = 0;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);
  
  cout << "- Custom: ";
  State ss0(0, "a", true, false, 0, 0);
  State ss1(1, "a", false, false, 0, 0);
  State ss2(2, "c", false, false, 0, 0);
  State ss3(3, "d", false, true, 0, 0);
  states = { ss0, ss1, ss2, ss3 };
  Transition tt0(0, 0, 1, "1");
  Transition tt1(1, 0, 2, "ε");
  Transition tt2(2, 0, 3, "1");
  Transition tt3(3, 1, 3, "0");
  Transition tt4(4, 1, 3, "1");
  Transition tt5(5, 2, 3, "ε");
  Transition tt6(6, 3, 3, "0");
  transitions = { tt0, tt1, tt2, tt3, tt4, tt5, tt6 };
  nfa.States = states;
  nfa.Transitions = transitions;
  predictedResult = 1;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  return overallPass;
}

bool checkIfDFATest() {
  bool overallPass = true;

  cout << "\n- NFA with missing transition: ";
  State s0(0, "a", true, false, 0, 0);
  State s1(1, "b", false, true, 0, 0);
  vector<State> states = { s0, s1 };
  Transition t0(0, 0, 1, "0");
  Transition t1(1, 0, 0, "1");
  Transition t2(2, 1, 1, "0");
  vector<Transition> transitions = { t0, t1, t2 };
  NFA nfa(false, states, transitions);
  bool predictedResult = false;
  bool result = checkIfDFA(nfa);
  bool passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- NFA with additional transition: ";
  Transition t3(3, 1, 1, "1");
  Transition t4(4, 0, 0, "0");
  transitions = { t0, t1, t2, t3, t4 };
  nfa.Transitions = transitions;
  predictedResult = false;
  result = checkIfDFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- NFA with epsilon transition: ";
  Transition t5(5, 0, 0, "ε");
  transitions = { t0, t1, t2, t3, t5 };
  nfa.Transitions = transitions;
  predictedResult = false;
  result = checkIfDFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- DFA: ";
  transitions = { t0, t1, t2, t3 };
  nfa.Transitions = transitions;
  predictedResult = true;
  result = checkIfDFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  return overallPass;
}

bool photoToNFATest() {
  cout << "\n";
  string predictedResult = "";
  string result = photoToNFA(Mat(), "testing_resources/custom_images/test-photo_7.jpg", false, true);
  cout << result << "\n";

  return result == predictedResult;
}

// bool tesseractTestTest() {
//   cout << "\n";
//   string predictedResult = "";
//   string result = tesseractTest("testing_resources/custom_images/test-photo_6.jpg");
//   cout << result << "\n";

//   return result == predictedResult;
// }

// bool textDetectionTest() {
//   cout << "\n";
//   string predictedResult = "";
//   // string result = textRecognition("testing_resources/detection_test_images/IC15/test_images/img_2.jpg");
//   string result = textDetection("testing_resources/custom_images/test-photo_2.jpg");
//   cout << result << "\n";

//   return result == predictedResult;
// }

// bool textRecognitionTest() {
//   cout << "\n";
//   string predictedResult = "Coca Cola";
//   string result = textRecognition("testing_resources/recognition_test_images/test/5065_7.png");
//   cout << result << "\n";

//   return result == predictedResult;
// }

// bool fullOpenCVTextRecognitionTest() {
//   cout << "\n";
//   // fullOpenCVTextRecognition("testing_resources/detection_test_images/IC15/test_images/img_2.jpg");
//   fullOpenCVTextRecognition("testing_resources/custom_images/test-photo_6.jpg");
//   return true;
// }

int main() {
  vector<TestObject> tests;
  // tests.push_back(TestObject("setIntersection", setIntersectionTest));
  // tests.push_back(TestObject("setUnion", setUnionTest));
  // tests.push_back(TestObject("setDifference", setDifferenceTest));
  // tests.push_back(TestObject("simplifyDFA", simplifyDFATest));
  // tests.push_back(TestObject("convertNFAtoDFA", convertNFAtoDFATest));
  // tests.push_back(TestObject("runNFA", runNFATest));
  tests.push_back(TestObject("runDFA", runDFATest));
  // tests.push_back(TestObject("validateNFA", validateNFATest));
  // tests.push_back(TestObject("checkIfDFA", checkIfDFATest));
  // tests.push_back(TestObject("photoToDFA", photoToNFATest));
  // tests.push_back(TestObject("tesseractTest", tesseractTestTest));
  // tests.push_back(TestObject("textRecognition", textRecognitionTest));
  // tests.push_back(TestObject("textDetection", textDetectionTest));
  // tests.push_back(TestObject("fullOpenCVTextRecognition", fullOpenCVTextRecognitionTest));
  int numPassed = 0;
  for (TestObject test : tests) {
    cout << whiteColor << test.Name << ": ";
    try {
      if (test.Function()) {
        cout << greenColor << "Passed!\n";
        numPassed++;
      } else {
        cout << redColor << "Failed\n";
      }
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << "\n";
    }
  }
  cout << whiteColor << to_string(numPassed) << " out of " << to_string(tests.size()) << " tests passed\n";
  if (numPassed == tests.size()) {
    cout << greenColor << "ALL TESTS PASSED!\n" << whiteColor;
  }
  return 0;
}