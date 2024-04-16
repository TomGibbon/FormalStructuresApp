#ifndef mainCode_h
#define mainCode_h

#include <string>
#include <vector>
#include <set>
#include <map>

#include <opencv2/opencv.hpp>

using namespace std;
using namespace cv;

namespace mainCode {

  // Classes

  class State {
    public:
      int Id;
      string Name;
      bool IsStart;
      bool IsFinal;
      // int LocX;
      // int LocY;

      // State(int id, string name, bool isStart, bool isFinal, int locX, int locY);
      State(int id, string name, bool isStart, bool isFinal);
      string convertToJSON(bool testing);
  };

  class Transition {
    public:
      int Id;
      int From;
      int To;
      string Token;

      Transition(int id, int from, int to, string token);
      string convertToJSON(bool testing);
  };

  class NFA {
    public:
      bool IsDfa;
      vector<State> States;
      vector<Transition> Transitions;

      NFA(bool isDfa, vector<State> states, vector<Transition> transitions);
      string convertToJSON(bool testing);
  };

  class MathmaticalDFA {
    public:
      set<int> States;
      set<string> Alphabet;
      map<int, map<string, int>> TransitionTable;
      int StartState;
      set<int> FinalStates;

      MathmaticalDFA(set<int> states, set<string> alphabet, map<int, map<string, int>> transitionTable, int startState, set<int> finalStates);
      MathmaticalDFA(NFA dfa);
  };

  class MathmaticalNFA {
    public:
      set<int> States;
      set<string> Alphabet;
      map<int, map<string, set<int>>> TransitionTable;
      int StartState;
      set<int> FinalStates;

      MathmaticalNFA(set<int> states, set<string> alphabet, map<int, map<string, set<int>>> transitionTable, int startState, set<int> finalStates);
      MathmaticalNFA(NFA nfa);
  };

  class Circle {
    public:
      cv::Point Center;
      float Radius;

      Circle(cv::Point center, float radius);
  };

  // Intermediate stages for NFA generation

  class StateCircle {
    public:
      State CorrespondingState;
      Circle CorrespondingCircle;

      StateCircle(State state, Circle circle);
      StateCircle();
  };

  class Arrow {
    public:
      cv::Point Tip;
      cv::Point Tail;

      Arrow(cv::Point tip, cv::Point tail);
  };

  // Helpers
  void printVector(string name, vector<int> list);
  void printSet(string name, set<int> set);
  string boolToString(bool x);
  template <typename T>
  set<T> setIntersection(set<T> set1, set<T> set2);
  template <typename T>
  set<T> setUnion(set<T> set1, set<T> set2);
  template <typename T>
  set<T> setDifference(set<T> set1, set<T> set2);
  template <typename T>
  vector<T> vectorDifference(vector<T> vec1, vector<T> vec2);

  // DFA / NFA functions
  set<int> getStates(vector<State> states);
  set<string> getAlphabet(vector<Transition> transitions);
  int getStartState(vector<State> states);
  set<int> getFinalStates(vector<State> states);

  // Exported
  NFA simplifyDFA(NFA oldDfa);
  NFA convertNFAtoDFA(NFA oldNfa);
  set<int> runDFA(NFA oldDfa, string word);
  set<int> runNFA(NFA oldNfa, string word);
  int validateNFA(NFA nfa);
  bool checkIfDFA(NFA oldNfa);
  string photoToNFA(string path, bool testing);
  // void arrowDetection(string path);
  // cv::Ptr<ml::KNearest> textTrain();
}

#endif
