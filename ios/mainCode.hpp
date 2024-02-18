#ifndef mainCode_h
#define mainCode_h

#include <string>
#include <vector>
#include <set>
#include <map>

#include <opencv2/opencv.hpp>
#include <openssl/bio.h>
#include <openssl/buffer.h>
#include <openssl/evp.h>

namespace mainCode {

  // Classes

  class State {
    public:
      int Id;
      std::string Name;
      bool IsStart;
      bool IsFinal;
      int LocX;
      int LocY;

      State(int id, std::string name, bool isStart, bool isFinal, int locX, int locY);
      std::string convertToJSON(bool testing);
  };

  class Transition {
    public:
      int From;
      int To;
      std::string Token;

      Transition(int from, int to, std::string token);
      std::string convertToJSON(bool testing);
  };

  class NFA {
    public:
      bool IsDfa;
      std::vector<State> States;
      std::vector<Transition> Transitions;

      NFA(bool isDfa, std::vector<State> states, std::vector<Transition> transitions);
      std::string convertToJSON(bool testing);
  };

  class MathmaticalDFA {
    public:
      std::set<int> States;
      std::set<std::string> Alphabet;
      std::map<int, std::map<std::string, int>> TransitionTable;
      int StartState;
      std::set<int> FinalStates;

      MathmaticalDFA(std::set<int> states, std::set<std::string> alphabet, std::map<int, std::map<std::string, int>> transitionTable, int startState, std::set<int> finalStates);
      MathmaticalDFA(NFA dfa);
  };

  class MathmaticalNFA {
    public:
      std::set<int> States;
      std::set<std::string> Alphabet;
      std::map<int, std::map<std::string, std::set<int>>> TransitionTable;
      int StartState;
      std::set<int> FinalStates;

      MathmaticalNFA(std::set<int> states, std::set<std::string> alphabet, std::map<int, std::map<std::string, std::set<int>>> transitionTable, int startState, std::set<int> finalStates);
      MathmaticalNFA(NFA nfa);
  };

  // Helpers
  void printVector(std::string name, std::vector<int> list);
  void printSet(std::string name, std::set<int> set);
  std::string boolToString(bool x);
  template <typename T>
  std::set<T> setIntersection(std::set<T> set1, std::set<T> set2);
  template <typename T>
  std::set<T> setUnion(std::set<T> set1, std::set<T> set2);
  template <typename T>
  std::set<T> setDifference(std::set<T> set1, std::set<T> set2);
  std::string base64Decode(const std::string &base64data);

  // DFA / NFA functions
  std::set<int> getStates(std::vector<State> states);
  std::set<std::string> getAlphabet(std::vector<Transition> transitions);
  int getStartState(std::vector<State> states);
  std::set<int> getFinalStates(std::vector<State> states);

  // Exported
  NFA simplifyDFA(NFA oldDfa);
  NFA convertNFAtoDFA(NFA oldNfa);
  bool runDFA(NFA oldDfa, std::string word);
  bool runNFA(NFA oldNfa, std::string word);
  std::string photoToNFA(cv::Mat img, std::string path, bool isBase64);
}

#endif
