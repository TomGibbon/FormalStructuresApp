#include "mainCode.hpp"
#include <iostream>
#include <chrono>

using namespace std;
using namespace cv;
using namespace mainCode;

class TestObject {
  public:
    string Name;
    bool (*Function)();
    bool MultipleTests;

    TestObject(string name, bool (*function)(), bool multipleTests) : Name(name), Function(function), MultipleTests(multipleTests) {}
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
  set<int> set1 = { 0, 4, 2, 1, 5 };
  set<int> set2 = { 3, 7, 6 };
  set<int> predictedResult = {};
  set<int> result = setIntersection(set1, set2);
  bool passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- Common values: ";
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

  cout << "- No common values: ";
  set<int> set1 = { 0, 4, 2, 1, 5 };
  set<int> set2 = { 3, 7, 6 };
  set<int> predictedResult = { 0, 1, 2, 3, 4, 5, 6, 7 };
  set<int> result = setUnion(set1, set2);
  bool passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- Common values: ";
  set2 = { 1, 3, 7, 6, 5, 2 };
  result = setUnion(set1, set2);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  return overralResult;
}

bool setDifferenceTest() {
  bool overallPass = true;

  cout << "- No common values: ";
  set<int> set1 = { 0, 4, 2, 1, 5 };
  set<int> set2 = { 3, 7, 6 };
  set<int> predictedResult1 = { 0, 4, 2, 1, 5 };
  set<int> result = setDifference(set1, set2);
  bool passed = result == predictedResult1;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- Common values: ";
  set2 = { 1, 3, 7, 6, 5, 2 };
  predictedResult1 = { 0, 4 };
  result = setDifference(set1, set2);
  passed = result == predictedResult1;
  overallPass = overallPass && passed;
  printOutcome(passed);

  return overallPass;
}

bool getStatesTest() {
  State s0(0, "q0", true, false);
  State s1(1, "q1", false, false);
  State s2(2, "q2", false, true);
  vector<State> states = { s0, s1, s2 };
  set<int> predictedResult = { 0, 1, 2 };
  set<int> result = getStates(states);
  return result == predictedResult;
}

bool getAlphabetTest() {
  Transition t0(0, 0, 1, "0");
  Transition t1(1, 1, 4, "0");
  Transition t2(2, 2, 3, "1");
  Transition t3(3, 3, 1, "a");
  Transition t4(4, 2, 2, "ε");
  vector<Transition> transitions = { t0, t1, t2, t3, t4 };
  set<string> predictedResult = { "0", "1", "a", "ε" };
  set<string> result = getAlphabet(transitions);
  return result == predictedResult;
}

bool getStartStateTest() {
  State s0(0, "q0", true, false);
  State s1(1, "q1", false, false);
  State s2(2, "q2", false, true);
  vector<State> states = { s0, s1, s2 };
  int predictedResult = 0;
  int result = getStartState(states);
  return result == predictedResult;
}

bool getFinalStatesTest() {
  State s0(0, "q0", true, false);
  State s1(1, "q1", false, false);
  State s2(2, "q2", false, true);
  vector<State> states = { s0, s1, s2 };
  set<int> predictedResult = { 2 };
  set<int> result = getFinalStates(states);
  return result == predictedResult;
}

bool simplifyDFATest() {
  bool overralResult = true;

  cout << "- DFA that can be simplified: ";
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
  NFA predictedDfa(true, predictedStates, predictedTransitions);
  string predictedResult = predictedDfa.convertToJSON(true);
  string result = simplifyDFA(dfa).convertToJSON(true);
  bool passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- DFA with unreachable states: ";
  dfa.States = { s0, s3, s1, s2 };
  Transition t14(14, 0, 3, "0");
  Transition t15(15, 0, 1, "1");
  Transition t16(16, 3, 1, "0");
  Transition t17(17, 3, 1, "1");
  Transition t18(18, 1, 1, "0");
  Transition t19(19, 1, 1, "1");
  Transition t20(20, 2, 0, "0");
  Transition t21(21, 2, 0, "1");
  dfa.Transitions = { t14, t15, t16, t17, t18, t19, t20, t21 };
  result = simplifyDFA(dfa).convertToJSON(true);
  Transition pt6(0, 0, 2, "0");
  Transition pt7(1, 0, 1, "1");
  Transition pt8(2, 1, 1, "0");
  Transition pt9(3, 1, 1, "1");
  Transition pt10(4, 2, 1, "0");
  Transition pt11(5, 2, 1, "1");
  predictedTransitions = { pt6, pt7, pt8, pt9, pt10, pt11 };
  predictedDfa.Transitions = predictedTransitions;
  predictedResult = predictedDfa.convertToJSON(true);
  result = simplifyDFA(dfa).convertToJSON(true);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- DFA with no final states: ";
  State s7(1, "q1", false, false);
  dfa.States = { s0, s3, s7 };
  dfa.Transitions = { t14, t15, t16, t17, t18, t19 };
  predictedStates = { s0 };
  Transition pt12(0, 0, 0, "0");
  Transition pt13(1, 0, 0, "1");
  predictedTransitions = { pt12, pt13 };
  predictedDfa.States = predictedStates;
  predictedDfa.Transitions = predictedTransitions;
  predictedResult = predictedDfa.convertToJSON(true);
  result = simplifyDFA(dfa).convertToJSON(true);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- DFA with only final states: ";
  State s8(0, "q0", true, true);
  State s9(1, "q1", false, true);
  State s10(2, "q2", false, true);
  dfa.States = { s8, s9, s10 };
  Transition t22(0, 0, 1, "0");
  Transition t23(1, 0, 2, "1");
  Transition t24(2, 1, 2, "0");
  Transition t25(3, 1, 2, "1");
  Transition t26(4, 2, 2, "0");
  Transition t27(5, 2, 2, "1");
  dfa.Transitions = { t22, t23, t24, t25, t26, t27 };
  predictedStates = { s8 };
  predictedDfa.States = predictedStates;
  predictedResult = predictedDfa.convertToJSON(true);
  result = simplifyDFA(dfa).convertToJSON(true);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- DFA that cannot be simplified: ";
  State s11(1, "q1", false, false);
  State s12(2, "q2", false, true);
  dfa.States = { s0, s11, s12 };
  predictedDfa = dfa;
  predictedResult = predictedDfa.convertToJSON(true);
  result = simplifyDFA(dfa).convertToJSON(true);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  return overralResult;
}

bool convertNFAtoDFATest() {
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

  cout << "- NFA with unreachable state: ";
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

  cout << "- NFA with reachable state that cannot lead to final state: ";
  State s5(4, "q4", false, false);
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
  bool overralResult = true;

  cout << "- Normal word: ";
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
  Transition t7(7, 3, 1, "1");
  vector<Transition> transitions = { t0, t1, t2, t3, t4, t5, t6, t7 };
  NFA nfa(false, states, transitions);
  string word = "1100";
  set<int> predictedResult = { 3 };
  set<int> result = runNFA(nfa, word);
  bool passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- Word that ends on no states: ";
  transitions = { t0, t1, t2, t3, t4, t5, t6 };
  nfa.Transitions = transitions;
  word = "01";
  predictedResult = {};
  result = runNFA(nfa, word);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- Word that reaches no states before end: ";
  word = "011";
  predictedResult = {};
  result = runNFA(nfa, word);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  cout << "- Word that ends on a state with epsilon transitions: ";
  Transition t8(8, 1, 2, "ε");
  transitions = { t0, t3, t4, t6, t7, t8 };
  nfa.Transitions = transitions;
  word = "1";
  predictedResult = { 1, 2 };
  result = runNFA(nfa, word);
  passed = result == predictedResult;
  overralResult = overralResult && passed;
  printOutcome(passed);

  return overralResult;
}

bool validateNFATest() {
  bool overallPass = true;

  cout << "- Structure with duplicate names: ";
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

  cout << "- Structure with no starting state: ";
  states = { s1 };
  nfa.States = states;
  predictedResult = 2;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- Structure with two starting states: ";
  State s2(2, "b", true, false);
  states = { s0, s2 };
  nfa.States = states;
  predictedResult = 2;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- Structure with duplicate transitions: ";
  states = { s1, s2 };
  Transition t0(0, 1, 2, "0");
  Transition t1(1, 1, 2, "0");
  transitions = { t0, t1 };
  nfa.States = states;
  nfa.Transitions = transitions;
  predictedResult = 3;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- Valid NFA: ";
  transitions = { t1 };
  nfa.Transitions = transitions;
  predictedResult = 0;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);
  
  cout << "- Valid DFA: ";
  Transition t2(2, 1, 1, "1");
  Transition t3(3, 2, 2, "0");
  Transition t4(4, 2, 1, "1");
  transitions = { t0, t2, t3, t4 };
  nfa.Transitions = transitions;
  predictedResult = 0;
  result = validateNFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  return overallPass;
}

bool checkIfDFATest() {
  bool overallPass = true;

  cout << "- NFA with missing transition: ";
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

  cout << "- NFA with epsilon transition to itself: ";
  Transition t5(5, 0, 0, "ε");
  transitions = { t0, t1, t2, t3, t5 };
  nfa.Transitions = transitions;
  predictedResult = false;
  result = checkIfDFA(nfa);
  passed = result == predictedResult;
  overallPass = overallPass && passed;
  printOutcome(passed);

  cout << "- NFA with epsilon transition to other state: ";
  Transition t6(5, 0, 1, "ε");
  transitions = { t0, t1, t2, t3, t6 };
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
  vector<long> times;
  vector<string> results;
  string result;
  for (int i = 30; i < 31; i++) {
    std::cout << "Running test " << to_string(i) << "\n";
    auto start = chrono::high_resolution_clock::now();
    result = photoToNFA("test_photos/test_photo_" + to_string(i) + ".jpg", true);
    auto end = chrono::high_resolution_clock::now();
    std::cout << "\n";
    if (result != "Could not open file" &&
        result != "More than 1 start state" &&
        result != "No start state") {
          results.push_back("PASSED");
    } else {
      results.push_back(result);
    }
    times.push_back(chrono::duration_cast<std::chrono::milliseconds>(end - start).count());
  }

  cout << "TIMES:\n";
  for (double i : times) {
    cout << "\t" << to_string(i) << "\n";
  }
  cout << "RESULTS:\n";
  for (string i : results) {
    cout << "\t" << i << "\n";
  }
  
  return true;
}

// bool textTrainTest() {
//   textTrain();
//   return true;
// }

int main() {
  vector<TestObject> tests;
  // tests.push_back(TestObject("mathmaticalDFAConstructor", mathmaticalDFAConstructorTest, true));
  // tests.push_back(TestObject("mathmaticalNFAConstructor", mathmaticalNFAConstructorTest, true));
  // tests.push_back(TestObject("setIntersection", setIntersectionTest, true));
  // tests.push_back(TestObject("setUnion", setUnionTest, true));
  // tests.push_back(TestObject("setDifference", setDifferenceTest, true));
  // tests.push_back(TestObject("getStates", getStatesTest, false));
  // tests.push_back(TestObject("getAlphabet", getAlphabetTest, false));
  // tests.push_back(TestObject("getStartState", getStartStateTest, false));
  // tests.push_back(TestObject("getFinalStates", getFinalStatesTest, false));
  // tests.push_back(TestObject("simplifyDFA", simplifyDFATest, true));
  // tests.push_back(TestObject("convertNFAtoDFA", convertNFAtoDFATest, true));
  // tests.push_back(TestObject("runDFA", runDFATest, false));
  // tests.push_back(TestObject("runNFA", runNFATest, true));
  // tests.push_back(TestObject("validateNFA", validateNFATest, true));
  // tests.push_back(TestObject("checkIfDFA", checkIfDFATest, true));
  tests.push_back(TestObject("photoToDFA", photoToNFATest, false));
  // tests.push_back(TestObject("textTrain", textTrainTest));
  int numPassed = 0;
  for (TestObject test : tests) {
    cout << whiteColor << test.Name << ": ";
    if (test.MultipleTests) {
      cout << "\n";
    }
    try {
      if (test.Function()) {
        cout << greenColor << "Passed!";
        numPassed++;
      } else {
        cout << redColor << "Failed";
      }
      cout << "\n\n";
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