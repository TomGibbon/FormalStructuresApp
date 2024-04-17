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

bool mathmaticalDFAConstructorTest() {
  bool overallResult = true;

  cout << "- Normal DFA: ";
  State s0(0, "q0", true, false);
  State s1(1, "q1", false, false);
  State s2(2, "q2", false, true);
  vector<State> states = { s0, s1, s2 };
  Transition t0(0, 0, 0, "0");
  Transition t1(1, 0, 1, "1");
  Transition t2(2, 1, 2, "0");
  Transition t3(3, 1, 0, "1");
  Transition t4(4, 2, 2, "0");
  Transition t5(5, 2, 2, "1");
  vector<Transition> transitions = { t0, t1, t2, t3, t4, t5 };
  NFA dfa(true, states, transitions);
  set<int> predictedStates = { 0, 1, 2 };
  set<string> predictedAlphabet = { "0", "1" };
  map<int, map<string, int>> predictedTransitionTable = {
    {0, {{"0", 0}, {"1", 1}}},
    {1, {{"0", 2}, {"1", 0}}},
    {2, {{"0", 2}, {"1", 2}}}
  };
  int predictedStartState = 0;
  set<int> predictedFinalStates = { 2 };
  MathmaticalDFA result = MathmaticalDFA(dfa);
  bool passed = result.States == predictedStates &&
                result.Alphabet == predictedAlphabet &&
                result.TransitionTable == predictedTransitionTable &&
                result.StartState == predictedStartState &&
                result.FinalStates == predictedFinalStates;
  overallResult = overallResult && passed;
  printOutcome(passed);

  cout << "- DFA with no transitions: ";
  dfa.Transitions = {};
  predictedAlphabet = {};
  predictedTransitionTable = {};
  result = MathmaticalDFA(dfa);
  passed = result.States == predictedStates &&
            result.Alphabet == predictedAlphabet &&
            result.TransitionTable == predictedTransitionTable &&
            result.StartState == predictedStartState &&
            result.FinalStates == predictedFinalStates;
  overallResult = overallResult && passed;
  printOutcome(passed);

  return overallResult;
}

bool mathmaticalNFAConstructorTest() {
  bool overallResult = true;

  cout << "- Normal NFA: ";
  State s0(0, "a", true, false);
  State s1(1, "b", false, false);
  State s2(2, "c", false, false);
  State s3(3, "d", false, true);
  vector<State> states = { s0, s1, s2, s3 };
  Transition t0(0, 0, 1, "1");
  Transition t1(1, 0, 2, "ε");
  Transition t2(2, 0, 3, "1");
  Transition t3(3, 1, 3, "0");
  Transition t4(4, 1, 3, "1");
  Transition t5(5, 2, 3, "ε");
  Transition t6(6, 3, 3, "0");
  vector<Transition> transitions = { t0, t1, t2, t3, t4, t5, t6 };
  NFA nfa(false, states, transitions);
  set<int> predictedStates = { 0, 1, 2, 3 };
  set<string> predictedAlphabet = { "ε", "0", "1" };
  map<int, map<string, set<int>>> predictedTransitionTable = {
    {0, {{"ε", {0, 2, 3}}, {"0", {3}}, {"1", {1, 3}}}},
    {1, {{"ε", {1}}, {"0", {3}}, {"1", {3}}}},
    {2, {{"ε", {2, 3}}, {"0", {3}}, {"1", {}}}},
    {3, {{"ε", {3}}, {"0", {3}}, {"1", {}}}}
  };
  int predictedStartState = 0;
  set<int> predictedFinalStates = { 3 };
  MathmaticalNFA result(nfa);
  bool passed = result.States == predictedStates &&
                result.Alphabet == predictedAlphabet &&
                result.TransitionTable == predictedTransitionTable &&
                result.StartState == predictedStartState &&
                result.FinalStates == predictedFinalStates;
  overallResult = overallResult && passed;
  printOutcome(passed);

  cout << "- NFA with no epsilon transitions: ";
  nfa.Transitions = { t0, t2, t3, t4, t6 };
  predictedTransitionTable = {
    {0, {{"ε", {0}}, {"0", {}}, {"1", {1, 3}}}},
    {1, {{"ε", {1}}, {"0", {3}}, {"1", {3}}}},
    {2, {{"ε", {2}}, {"0", {}}, {"1", {}}}},
    {3, {{"ε", {3}}, {"0", {3}}, {"1", {}}}}
  };
  result = MathmaticalNFA(nfa);
  passed = result.States == predictedStates &&
           result.Alphabet == predictedAlphabet &&
           result.TransitionTable == predictedTransitionTable &&
           result.StartState == predictedStartState &&
           result.FinalStates == predictedFinalStates;
  overallResult = overallResult && passed;
  printOutcome(passed);

  cout << "- NFA with epsilon cycle: ";
  Transition t7(7, 3, 0, "ε");
  nfa.Transitions = { t0, t1, t2, t3, t4, t5, t6, t7 };
  predictedTransitionTable = {
    {0, {{"ε", {0, 2, 3}}, {"0", {0, 2, 3}}, {"1", {0, 1, 2, 3}}}},
    {1, {{"ε", {1}}, {"0", {0, 2, 3}}, {"1", {0, 2, 3}}}},
    {2, {{"ε", {0, 2, 3}}, {"0", {0, 2, 3}}, {"1", {0, 1, 2, 3}}}},
    {3, {{"ε", {0, 2, 3}}, {"0", {0, 2, 3}}, {"1", {0, 1, 2, 3}}}}
  };
  result = MathmaticalNFA(nfa);

  passed = result.States == predictedStates &&
           result.Alphabet == predictedAlphabet &&
           result.TransitionTable == predictedTransitionTable &&
           result.StartState == predictedStartState &&
           result.FinalStates == predictedFinalStates;
  overallResult = overallResult && passed;
  printOutcome(passed);

  return overallResult;
}

bool setIntersectionTest() {
  bool overralResult = true;

  cout << "- No common values: ";
  set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  set<int> set2 = { 3, 7, 6, 6 };
  set<int> predictedResult = {};
  set<int> result = setIntersection(set1, set2);
  bool passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- Common values: ";
  set1 = { 0, 4, 2, 1, 1, 5 };
  set2 = { 1, 3, 7, 6, 5, 2 };
  predictedResult = { 1, 2, 5 };
  result = setIntersection(set1, set2);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  return overralResult;
}

bool setUnionTest() {
  bool overralResult = true;
  set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  set<int> predictedResult = { 0, 1, 2, 3, 4, 5, 6, 7 };
  set<int> result = setUnion(set1, set2);
  bool passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  return overralResult;
}

bool setDifferenceTest() {
  bool overallPass = true;

  cout << "\n- Set: ";
  set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  set<int> predictedResult1 = { 0, 4 };
  set<int> result1 = setDifference(set1, set2);
  bool passed = result1 == predictedResult1;
  overallPass = overallPass && passed;
  printOutcome(passed);

  // cout << "- Vector: ";
  // vector<int> vector1 = { 0, 4, 2, 1, 1, 5 };
  // vector<int> vector2 = { 1, 3, 7, 6, 5, 2 };
  // vector<int> predictedResult2 = { 0, 4 };
  // vector<int> result2 = vectorDifference(vector1, vector2);
  // passed = result2 == predictedResult2;
  // overallPass = overallPass && passed;
  // printOutcome(passed);

  return overallPass;
}

bool simplifyDFATest() {
  State s0(0, "q0", true, false);
  State s1(1, "q1", false, true);
  State s2(2, "q2", false, true);
  State s3(3, "q3", false, false);
  State s4(4, "q4", false, true);
  State s5(5, "q5", false, false);
  State s6(6, "q6", false, false);
  vector<State> states = { s0, s1, s2, s3, s4, s5, s6 };
  Transition t0(0, 0, 3, "0");
  Transition t1(1, 0, 1, "1");
  Transition t2(2, 1, 2, "0");
  Transition t3(3, 1, 5, "1");
  Transition t4(4, 2, 2, "0");
  Transition t5(5, 2, 5, "1");
  Transition t6(6, 3, 0, "0");
  Transition t7(7, 3, 4, "1");
  Transition t8(8, 4, 2, "0");
  Transition t9(9, 4, 5, "1");
  Transition t10(10, 5, 5, "0");
  Transition t11(11, 5, 5, "1");
  Transition t12(12, 6, 6, "0");
  Transition t13(13, 6, 6, "1");
  vector<Transition> transitions = { t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13 };
  NFA dfa(true, states, transitions);

  State ps0(0, "q0", true, false);
  State ps1(1, "q1", false, true);
  State ps2(2, "q2", false, false);
  vector<State> predictedStates = { ps0, ps1, ps2 };
  Transition pt0(0, 0, 0, "0");
  Transition pt1(1, 0, 1, "1");
  Transition pt2(2, 1, 1, "0");
  Transition pt3(3, 1, 2, "1");
  Transition pt4(4, 2, 2, "0");
  Transition pt5(5, 2, 2, "1");
  vector<Transition> predictedTransitions = { pt0, pt1, pt2, pt3, pt4, pt5 };
  NFA predictedNfa(true, predictedStates, predictedTransitions);
  string predictedResult = predictedNfa.convertToJSON(true);
  string result = simplifyDFA(dfa).convertToJSON(true);
  return result == predictedResult;
}

bool convertNFAtoDFATest() {
  bool overallResult = true;

  cout << "\n- NFA 1: ";
  State s0(0, "a", true, false);
  State s1(1, "b", false, false);
  State s2(2, "c", false, false);
  State s3(3, "d", false, true);
  vector<State> states = { s0, s1, s2, s3 };
  Transition t0(0, 0, 1, "1");
  Transition t1(1, 0, 2, "ε");
  Transition t2(2, 0, 3, "1");
  Transition t3(3, 1, 3, "0");
  Transition t4(4, 1, 3, "1");
  Transition t5(5, 2, 3, "ε");
  Transition t6(6, 3, 3, "0");
  vector<Transition> transitions = { t0, t1, t2, t3, t4, t5, t6 };
  NFA nfa(false, states, transitions);

  State ps0(0, "q0", false, false);
  State ps1(1, "q1", true, true);
  State ps2(2, "q2", false, true);
  State ps3(3, "q3", false, true);
  vector<State> predictedStates = { ps0, ps1, ps2, ps3 };
  Transition pt0(0, 0, 0, "0");
  Transition pt1(1, 0, 0, "1");
  Transition pt2(2, 1, 3, "0");
  Transition pt3(3, 1, 2, "1");
  Transition pt4(4, 2, 3, "0");
  Transition pt5(5, 2, 3, "1");
  Transition pt6(6, 3, 3, "0");
  Transition pt7(7, 3, 0, "1");
  vector<Transition> predictedTransitions = { pt0, pt1, pt2, pt3, pt4, pt5, pt6, pt7 };
  NFA predictedNfa(true, predictedStates, predictedTransitions);
  string predictedResult = predictedNfa.convertToJSON(true);

  string result = convertNFAtoDFA(nfa).convertToJSON(true);
  bool passed = result == predictedResult;
  overallResult = overallResult && passed;
  printOutcome(passed);

  cout << "- NFA 2: ";
  State s4(4, "q4", false, false);
  states = { s0, s1, s2, s3, s4 };
  nfa.States = states;
  Transition t7(7, 4, 1, "1");
  transitions = { t0, t1, t2, t3, t4, t5, t6, t7 };
  nfa.Transitions = transitions;
  result = convertNFAtoDFA(nfa).convertToJSON(true);
  passed = result == predictedResult;
  overallResult = overallResult && passed;
  printOutcome(passed);

  cout << "- NFA 3: ";
  State s5(4, "e", false, false);
  states = { s0, s1, s2, s3, s5 };
  nfa.States = states;
  Transition t8(7, 0, 4, "ε");
  Transition t10(10, 2, 4, "0");
  transitions = { t0, t1, t2, t3, t4, t5, t6, t8, t10 };
  nfa.Transitions = transitions;
  result = convertNFAtoDFA(nfa).convertToJSON(true);
  passed = result == predictedResult;
  overallResult = overallResult && passed;
  printOutcome(passed);

  return overallResult;
}

bool runDFATest() {
  vector<State> states;
  states.push_back(State(0, "q0", true, false));
  states.push_back(State(1, "q1", false, true));
  states.push_back(State(2, "q2", false, true));
  states.push_back(State(3, "q3", false, false));
  states.push_back(State(4, "q4", false, true));
  states.push_back(State(5, "q5", false, false));
  states.push_back(State(6, "q6", false, false));
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

  set<int> predictedResult = { 5 };
  set<int> result = runDFA(dfa, word);

  return result == predictedResult;
}

bool runNFATest() {
  vector<State> states;
  states.push_back(State(0, "a", true, false));
  states.push_back(State(1, "b", false, false));
  states.push_back(State(2, "c", false, false));
  states.push_back(State(3, "d", false, true));
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
  string word = "1100";

  set<int> predictedResult = { 3 };
  set<int> result = runNFA(nfa, word);

  return result == predictedResult;
}

bool validateNFATest() {
  bool overallPass = true;

  cout << "\n- Duplicate names: ";
  State s0(0, "a", true, true);
  State s1(1, "a", false, false);
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
  State s2(2, "b", true, false);
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
  State ss0(0, "a", true, false);
  State ss1(1, "a", false, false);
  State ss2(2, "c", false, false);
  State ss3(3, "d", false, true);
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
  State s0(0, "a", true, false);
  State s1(1, "b", false, true);
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
  string predictedResult = "{\"structure\":{\"isDfa\":false,\"states\":[{\"id\":0,\"name\":\"q0\",\"isStart\":false,\"isFinal\":true},{\"id\":1,\"name\":\"q1\",\"isStart\":false,\"isFinal\":false},{\"id\":2,\"name\":\"q2\",\"isStart\":false,\"isFinal\":true},{\"id\":3,\"name\":\"q3\",\"isStart\":true,\"isFinal\":false}],\"transitions\":[{\"id\":0,\"from\":0,\"to\":1,\"token\":\"0\"},{\"id\":1,\"from\":2,\"to\":0,\"token\":\"0\"},{\"id\":2,\"from\":2,\"to\":2,\"token\":\"0\"},{\"id\":3,\"from\":3,\"to\":1,\"token\":\"0\"},{\"id\":4,\"from\":3,\"to\":2,\"token\":\"0\"}]},\"type\":\"nfa\"}";
  string result = photoToNFA("test_photo_2.jpg", true);
  return result == predictedResult;
}

// bool textTrainTest() {
//   textTrain();
//   return true;
// }

int main() {
  vector<TestObject> tests;
  tests.push_back(TestObject("mathmaticalDFAConstructor", mathmaticalDFAConstructorTest));
  tests.push_back(TestObject("mathmaticalNFAConstructor", mathmaticalNFAConstructorTest));
  tests.push_back(TestObject("setIntersection", setIntersectionTest));
  tests.push_back(TestObject("setUnion", setUnionTest));
  tests.push_back(TestObject("setDifference", setDifferenceTest));
  tests.push_back(TestObject("simplifyDFA", simplifyDFATest));
  tests.push_back(TestObject("convertNFAtoDFA", convertNFAtoDFATest));
  tests.push_back(TestObject("runNFA", runNFATest));
  tests.push_back(TestObject("runDFA", runDFATest));
  tests.push_back(TestObject("validateNFA", validateNFATest));
  tests.push_back(TestObject("checkIfDFA", checkIfDFATest));
  // tests.push_back(TestObject("photoToDFA", photoToNFATest));
  // tests.push_back(TestObject("textTrain", textTrainTest));
  int numPassed = 0;
  for (TestObject test : tests) {
    cout << whiteColor << test.Name << ":\n";
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