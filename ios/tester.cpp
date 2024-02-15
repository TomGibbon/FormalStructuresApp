#include "mainCode.hpp"
#include <iostream>

using namespace mainCode;

class TestObject {
  public:
    std::string Name;
    bool (*Function)();

    TestObject(std::string name, bool (*function)()) : Name(name), Function(function) {}
};

const char* greenColor = "\033[32m";
const char* redColor = "\033[31m";
const char* whiteColor = "\033[0m";

bool setIntersectionTest() {
  std::set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  std::set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  std::set<int> predictedResult = { 1, 2, 5 };
  std::set<int> result = setIntersection(set1, set2);
  return result == predictedResult;
}

bool setUnionTest() {
  std::set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  std::set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  std::set<int> predictedResult = { 0, 1, 2, 3, 4, 5, 6, 7 };
  std::set<int> result = setUnion(set1, set2);
  return result == predictedResult;
}

bool setDifferenceTest() {
  std::set<int> set1 = { 0, 4, 2, 1, 1, 5 };
  std::set<int> set2 = { 1, 3, 7, 6, 5, 2 };
  std::set<int> predictedResult = { 0, 4 };
  std::set<int> result = setDifference(set1, set2);
  return result == predictedResult;
}

bool simplifyDFATest() {
  std::vector<State> states;
  states.push_back(State(0, "q0", true, false, -1, -1));
  states.push_back(State(1, "q1", false, true, -1, -1));
  states.push_back(State(2, "q2", false, true, -1, -1));
  states.push_back(State(3, "q3", false, false, -1, -1));
  states.push_back(State(4, "q4", false, true, -1, -1));
  states.push_back(State(5, "q5", false, false, -1, -1));
  states.push_back(State(6, "q6", false, false, -1, -1));
  std::vector<Transition> transitions;
  transitions.push_back(Transition(0, 3, "0"));
  transitions.push_back(Transition(0, 1, "1"));
  transitions.push_back(Transition(1, 2, "0"));
  transitions.push_back(Transition(1, 5, "1"));
  transitions.push_back(Transition(2, 2, "0"));
  transitions.push_back(Transition(2, 5, "1"));
  transitions.push_back(Transition(3, 0, "0"));
  transitions.push_back(Transition(3, 4, "1"));
  transitions.push_back(Transition(4, 2, "0"));
  transitions.push_back(Transition(4, 5, "1"));
  transitions.push_back(Transition(5, 5, "0"));
  transitions.push_back(Transition(5, 5, "1"));
  transitions.push_back(Transition(6, 6, "0"));
  transitions.push_back(Transition(6, 6, "1"));
  NFA dfa(true, states, transitions);

  std::string predictedResult = "{\"structure\":{\"isDfa\":true,\"states\":[{\"id\":0,\"name\":\"q0\",\"isStart\":true,\"isFinal\":false,\"locX\":-1,\"locY\":-1},{\"id\":1,\"name\":\"q1\",\"isStart\":false,\"isFinal\":true,\"locX\":-1,\"locY\":-1},{\"id\":2,\"name\":\"q2\",\"isStart\":false,\"isFinal\":false,\"locX\":-1,\"locY\":-1}],\"transitions\":[{\"from\":0,\"to\":0,\"token\":\"0\"},{\"from\":0,\"to\":1,\"token\":\"1\"},{\"from\":1,\"to\":1,\"token\":\"0\"},{\"from\":1,\"to\":2,\"token\":\"1\"},{\"from\":2,\"to\":2,\"token\":\"0\"},{\"from\":2,\"to\":2,\"token\":\"1\"}]},\"type\":\"nfa\"}";
  std::string result = simplifyDFA(dfa).convertToJSON(false);

  return result == predictedResult;
}

bool convertNFAtoDFATest() {
  std::vector<State> states;
  states.push_back(State(0, "a", true, false, -1, -1));
  states.push_back(State(1, "b", false, false, -1, -1));
  states.push_back(State(2, "c", false, false, -1, -1));
  states.push_back(State(3, "d", false, true, -1, -1));
  std::vector<Transition> transitions;
  transitions.push_back(Transition(0, 1, "1"));
  transitions.push_back(Transition(0, 2, "ε"));
  transitions.push_back(Transition(0, 3, "1"));
  transitions.push_back(Transition(1, 3, "0"));
  transitions.push_back(Transition(1, 3, "1"));
  transitions.push_back(Transition(2, 3, "ε"));
  transitions.push_back(Transition(3, 3, "0"));
  NFA nfa(false, states, transitions);

  std::string predictedResult = "{\"structure\":{\"isDfa\":true,\"states\":[{\"id\":0,\"name\":\"q0\",\"isStart\":false,\"isFinal\":false,\"locX\":-1,\"locY\":-1},{\"id\":1,\"name\":\"q1\",\"isStart\":true,\"isFinal\":true,\"locX\":-1,\"locY\":-1},{\"id\":2,\"name\":\"q2\",\"isStart\":false,\"isFinal\":true,\"locX\":-1,\"locY\":-1},{\"id\":3,\"name\":\"q3\",\"isStart\":false,\"isFinal\":true,\"locX\":-1,\"locY\":-1}],\"transitions\":[{\"from\":0,\"to\":0,\"token\":\"0\"},{\"from\":0,\"to\":0,\"token\":\"1\"},{\"from\":1,\"to\":3,\"token\":\"0\"},{\"from\":1,\"to\":2,\"token\":\"1\"},{\"from\":2,\"to\":3,\"token\":\"0\"},{\"from\":2,\"to\":3,\"token\":\"1\"},{\"from\":3,\"to\":3,\"token\":\"0\"},{\"from\":3,\"to\":0,\"token\":\"1\"}]},\"type\":\"nfa\"}";
  std::string result = convertNFAtoDFA(nfa).convertToJSON(false);

  return result == predictedResult;
}

bool runDFATest() {
  std::vector<State> states;
  states.push_back(State(0, "q0", true, false, -1, -1));
  states.push_back(State(1, "q1", false, true, -1, -1));
  states.push_back(State(2, "q2", false, true, -1, -1));
  states.push_back(State(3, "q3", false, false, -1, -1));
  states.push_back(State(4, "q4", false, true, -1, -1));
  states.push_back(State(5, "q5", false, false, -1, -1));
  states.push_back(State(6, "q6", false, false, -1, -1));
  std::vector<Transition> transitions;
  transitions.push_back(Transition(0, 3, "0"));
  transitions.push_back(Transition(0, 1, "1"));
  transitions.push_back(Transition(1, 2, "0"));
  transitions.push_back(Transition(1, 5, "1"));
  transitions.push_back(Transition(2, 2, "0"));
  transitions.push_back(Transition(2, 5, "1"));
  transitions.push_back(Transition(3, 0, "0"));
  transitions.push_back(Transition(3, 4, "1"));
  transitions.push_back(Transition(4, 2, "0"));
  transitions.push_back(Transition(4, 5, "1"));
  transitions.push_back(Transition(5, 5, "0"));
  transitions.push_back(Transition(5, 5, "1"));
  transitions.push_back(Transition(6, 6, "0"));
  transitions.push_back(Transition(6, 6, "1"));
  NFA dfa(true, states, transitions);
  std::string word = "000010011";

  bool predictedResult = false;
  bool result = runDFA(dfa, word);

  return result == predictedResult;
}

bool runNFATest() {
  std::vector<State> states;
  states.push_back(State(0, "a", true, false, -1, -1));
  states.push_back(State(1, "b", false, false, -1, -1));
  states.push_back(State(2, "c", false, false, -1, -1));
  states.push_back(State(3, "d", false, true, -1, -1));
  std::vector<Transition> transitions;
  transitions.push_back(Transition(0, 1, "1"));
  transitions.push_back(Transition(0, 2, "ε"));
  transitions.push_back(Transition(0, 3, "1"));
  transitions.push_back(Transition(1, 3, "0"));
  transitions.push_back(Transition(1, 3, "1"));
  transitions.push_back(Transition(2, 3, "ε"));
  transitions.push_back(Transition(3, 3, "0"));
  NFA nfa(false, states, transitions);
  std::string word = "1100";

  bool predictedResult = true;
  bool result = runNFA(nfa, word);

  return result == predictedResult;
}

int main() {
  std::vector<TestObject> tests;
  tests.push_back(TestObject("setIntersection", setIntersectionTest));
  tests.push_back(TestObject("setUnion", setUnionTest));
  tests.push_back(TestObject("setDifference", setDifferenceTest));
  tests.push_back(TestObject("simplifyDFA", simplifyDFATest));
  tests.push_back(TestObject("convertNFAtoDFA", convertNFAtoDFATest));
  tests.push_back(TestObject("runNFA", runNFATest));
  tests.push_back(TestObject("runDFA", runDFATest));
  int numPassed = 0;
  for (TestObject test : tests) {
    std::cout << whiteColor << test.Name << ": ";
    if (test.Function()) {
      std::cout << greenColor << "Passed!\n";
      numPassed++;
    } else {
      std::cout << redColor << "Failed\n";
    }
  }
  std::cout << whiteColor << std::to_string(numPassed) << " out of " << std::to_string(tests.size()) << " tests passed\n";
  if (numPassed == tests.size()) {
    std::cout << greenColor << "ALL TESTS PASSED!\n" << whiteColor;
  }
  return 0;
}