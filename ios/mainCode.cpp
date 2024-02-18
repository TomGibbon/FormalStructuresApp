#include "mainCode.hpp"
#include <iostream>

namespace mainCode {
  // ==================================
  // ======== ** Classes ** ===========
  // ==================================

  // State
  State::State(int id, std::string name, bool isStart, bool isFinal, int locX, int locY):
    Id(id), Name(name), IsStart(isStart), IsFinal(isFinal), LocX(locX), LocY(locY) {}

  std::string State::convertToJSON(bool testing) {
    if (testing) {
      return "\n\t\t\t{ \"id\":" + std::to_string(Id) + ", \"name\":\"" + Name + "\", \"isStart\":" + boolToString(IsStart) + ", \"isFinal\":" + boolToString(IsFinal) + ", \"locX\":" + std::to_string(LocX) + ", \"locY\":" + std::to_string(LocY) + " }";
    } else {
      return "{\"id\":" + std::to_string(Id) + ",\"name\":\"" + Name + "\",\"isStart\":" + boolToString(IsStart) + ",\"isFinal\":" + boolToString(IsFinal) + ",\"locX\":" + std::to_string(LocX) + ",\"locY\":" + std::to_string(LocY) + "}";
    }
  }

  // Transition
  Transition::Transition(int from, int to, std::string token):
    From(from), To(to), Token(token) {}

  std::string Transition::convertToJSON(bool testing) {
    if (testing) {
      return "\n\t\t\t{ \"from\":" + std::to_string(From) + ", \"to\":" + std::to_string(To) + ", \"token\":\"" + Token + "\" }";
    } else {
      return "{\"from\":" + std::to_string(From) + ",\"to\":" + std::to_string(To) + ",\"token\":\"" + Token + "\"}";
    }
  }

  // NFA
  NFA::NFA(bool isDfa, std::vector<State> states, std::vector<Transition> transitions):
    IsDfa(isDfa), States(states), Transitions(transitions) {}

  std::string NFA::convertToJSON(bool testing) {
    std::string statesJSON = "";
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

    std::string transitionsJSON = "";
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
  MathmaticalDFA::MathmaticalDFA(std::set<int> states, std::set<std::string> alphabet, std::map<int, std::map<std::string, int>> transitionTable, int startState, std::set<int> finalStates):
    States(states), Alphabet(alphabet), TransitionTable(transitionTable), StartState(startState), FinalStates(finalStates) {}

  MathmaticalDFA::MathmaticalDFA(NFA dfa): 
    States(getStates(dfa.States)), Alphabet(getAlphabet(dfa.Transitions)), TransitionTable(), StartState(getStartState(dfa.States)), FinalStates(getFinalStates(dfa.States)) {
      std::map<int, std::map<std::string, int>> transitionTable; // No need to declare cells as dfa is assumed to have all possible transitions mapped
      for (Transition transition : dfa.Transitions) {
        int from = transition.From;
        int to = transition.To;
        std::string token = transition.Token;

        std::map<std::string, int> fromTable = transitionTable[from];
        fromTable[token] = to;
        transitionTable[from] = fromTable;
      }
      TransitionTable = transitionTable;
    }

  MathmaticalNFA::MathmaticalNFA(std::set<int> states, std::set<std::string> alphabet, std::map<int, std::map<std::string, std::set<int>>> transitionTable, int startState, std::set<int> finalStates):
    States(states), Alphabet(alphabet), TransitionTable(transitionTable), StartState(startState), FinalStates(finalStates) {}

  MathmaticalNFA::MathmaticalNFA(NFA nfa):
        States(getStates(nfa.States)), Alphabet(getAlphabet(nfa.Transitions)), StartState(getStartState(nfa.States)), FinalStates(getFinalStates(nfa.States)) {
          Alphabet.insert("ε");
          std::map<int, std::map<std::string, std::set<int>>> transitionTable;

          // Declare each cell in map
          for (State state : nfa.States) {
            for (std::string token : Alphabet) {
              transitionTable[state.Id][token] = {};
            }
          }

          // Start by adding all single transitions
          for (Transition transition : nfa.Transitions) {
            transitionTable[transition.From][transition.Token].insert(transition.To);
          }

          // Update with epsilon transitions
          for (State state : nfa.States) {
            std::set<int> epsilonTransitions = transitionTable[state.Id]["ε"]; // Get epsilon closure of state
            epsilonTransitions.insert(state.Id); // Make sure itself is added

            // Continue checking epsilon closure of states until no new ones are detected
            std::set<int> remaining = epsilonTransitions; // Contains all states that need to have their epsilon closure checked
            while (!remaining.empty()) {
              // Pop front
              auto iterator = remaining.begin();
              int current = *iterator; // Contains the next state that needs to be checked
              remaining.erase(iterator);

              std::set<int> newStates = transitionTable[current]["ε"]; // Get epsilon closure of current
              for (int newState : newStates) { // Check if any of the resulting states are new
                if (epsilonTransitions.find(newState) == epsilonTransitions.end()) {
                  epsilonTransitions.insert(newState);
                  remaining.insert(newState); // New state so must be checked later
                }
              }
            }

            // Update the current row in the table using the epsilon closure
            for (std::string token : Alphabet) {
              std::set<int> currentTransitions = transitionTable[state.Id][token];

              // Update the transition table with the transitions from this epsilon closure
              if (token == "ε") {
                transitionTable[state.Id]["ε"] = setUnion(transitionTable[state.Id]["ε"], epsilonTransitions);
              } else {
                for (int epsilonTransition : epsilonTransitions) {
                  std::set<int> resultingTransitions = transitionTable[epsilonTransition][token];
                  transitionTable[state.Id][token] = setUnion(transitionTable[state.Id][token], resultingTransitions);
                }
              }
            }
          }
          TransitionTable = transitionTable;
        }

  // Helpers

  void printVector(std::string name, std::vector<int> list) {
    std::cout << name << ": {";
    for (int i : list) {
      std::cout << std::to_string(i) << " ";
    }
    std::cout << "}\n";
  }

  void printSet(std::string name, std::set<int> set) {
    std::cout << name << ": {";
    for (int i : set) {
      std::cout << std::to_string(i) << " ";
    }
    std::cout << "}\n";
  }

  std::string boolToString(bool x) {
    return x ? "true" : "false";
  }

  template <typename T>
  std::set<T> setIntersection(std::set<T> set1, std::set<T> set2) {
    std::set<T> result;
    for (T item : set1) {
      if (set2.find(item) != set2.end()) {
        result.insert(item);
      }
    }
    return result;
  }

  template <typename T>
  std::set<T> setUnion(std::set<T> set1, std::set<T> set2) {
    set1.insert(set2.begin(), set2.end());
    return set1;
  }

  template <typename T>
  std::set<T> setDifference(std::set<T> set1, std::set<T> set2) {
    std::set<T> result;
    for (T item : set1) {
      if (set2.find(item) == set2.end()) {
        result.insert(item);
      }
    }
    return result;
  }
  
  std::string base64Decode(const std::string &base64data) {
    // Create BIO object to handle base64 decoding
    BIO *bio = BIO_new_mem_buf(base64data.c_str(), base64data.length());
    BIO *b64 = BIO_new(BIO_f_base64());
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    bio = BIO_push(b64, bio);

    // Create buffer to store decoded data
    char buffer[4096];
    std::string decodedData;

    // Decode base64 data
    int len = 0;
    while ((len = BIO_read(bio, buffer, sizeof(buffer))) > 0) {
      decodedData.append(buffer, len);
    }

    // Free resources
    BIO_free_all(bio);

    return decodedData;

    // std::vector<uchar> imageData = std::vector<uchar>(decodedData.begin(), decodedData.end());
    // cv::Mat image = cv::imdecode(cv::Mat(imageData), 1);
    
    // return image;
  }

  // DFA / NFA functions

  std::set<int> getStates(std::vector<State> states) {
    std::set<int> result;
    for (State state : states) {
      result.insert(state.Id);
    }
    return result;
  }

  std::set<std::string> getAlphabet(std::vector<Transition> transitions) {
    std::set<std::string> alphabet;
    for (Transition transition : transitions) {
      alphabet.insert(transition.Token);
    }
    return alphabet;
  }

  int getStartState(std::vector<State> states) {
    for (State state : states) {
      if (state.IsStart) {
        return state.Id;
      }
    }
    throw std::out_of_range("Start state not found");
  }

  std::set<int> getFinalStates(std::vector<State> states) {
    std::set<int> finalStates;
    for (State state : states) {
      if (state.IsFinal) {
        finalStates.insert(state.Id);
      }
    }
    return finalStates;
  }

  // Exported

  std::string photoToNFA(cv::Mat img, std::string path, bool imgPreMade, bool testing) {
    std::string result;
    if (!imgPreMade) {
      img = cv::imread(path, cv::IMREAD_COLOR);
      if (!img.data) {
        result += "could not open file\n";
        return result;
        throw std::runtime_error("Could not open file");
      }
    }
    cv::Mat gray;
    cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);
    cv::GaussianBlur(gray, gray, cv::Size(15, 15), 2);
    std::vector<cv::Vec3f> circles;
    cv::HoughCircles(gray, circles, cv::HOUGH_GRADIENT, 2, gray.rows / 4, 200, 100);

    result += "Width: " + std::to_string(img.cols) + "\n";
    result += "Height: " + std::to_string(img.rows) + "\n";

    std::vector<State> states;
    for (int id = 0; id < circles.size(); id++) {
      cv::Vec3f circle = circles[id];
      result += "X: " + std::to_string(circle[0]) + "\n";
      result += "Y: " + std::to_string(circle[1]) + "\n";
      result += "Radius: " + std::to_string(circle[2]) + "\n\n";
      int locX = circle[0] - img.cols / 2; // Still need to scale
      int locY = circle[1] - img.rows / 2;
      states.push_back(State(id, "q" + std::to_string(id), false, false, locX, locY));
    }
    std::vector<Transition> transitions;
    result += NFA(false, states, transitions).convertToJSON(false);

    if (testing) {
      for(size_t i = 0; i < circles.size(); i++) {
        cv::Point center(cvRound(circles[i][0]), cvRound(circles[i][1]));
        int radius = cvRound(circles[i][2]);
        // draw the circle center
        circle(img, center, 3, cv::Scalar(0, 255, 0), cv::FILLED);
        // draw the circle outline
        circle(img, center, radius, cv::Scalar(0, 0, 255), 3);
      }
      cv::namedWindow("gray", cv::WINDOW_AUTOSIZE);
      cv::imshow("gray", gray);
      cv::namedWindow("circles", cv::WINDOW_AUTOSIZE);
      cv::imshow("circles", img);
      cv::waitKey(0);
    }

    return result;
  }

  NFA simplifyDFA(NFA oldDfa) {
    MathmaticalDFA dfa(oldDfa);

    // Removing unreachable states
    std::set<int> reachableStates = { dfa.StartState };
    std::set<int> newStates = { dfa.StartState };

    while (!newStates.empty()) {
      std::set<int> temp;
      for (int newState : newStates) {
        for (std::string token : dfa.Alphabet) {
          temp.insert(dfa.TransitionTable[newState][token]);
        }
      }

      newStates = setDifference(temp, reachableStates);
      reachableStates = setUnion(reachableStates, newStates);
    }
    
    // Split into final and non-final states
    std::set<int> nonFinalStates;
    for (int stateId : reachableStates) {
      if (dfa.FinalStates.find(stateId) == dfa.FinalStates.end()) {
        nonFinalStates.insert(stateId);
      }
    }
    std::set<std::set<int>> p = { dfa.FinalStates, nonFinalStates };
    std::set<std::set<int>> w = { dfa.FinalStates, nonFinalStates };

    // Hopcrofts algorithm
    while (!w.empty()) {

      // Pop a from w
      auto iterator = w.begin();
      std::set<int> a = *iterator;
      w.erase(iterator);

      for (std::string token : dfa.Alphabet) {
        // Get x
        std::set<int> x;
        for (int state : dfa.States) {
          if (a.find(dfa.TransitionTable[state][token]) != a.end()) {
            x.insert(state);
          }
        }

        std::set<std::set<int>> newP = p;
        for (std::set<int> y : p) {
          std::set<int> intersection = setIntersection(x, y);
          std::set<int> difference = setDifference(y, x);
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
    std::vector<State> states;
    int id = 0;
    for (std::set<int> partition : p) {
      bool isStart = partition.find(dfa.StartState) != partition.end();
      bool isFinal = !setIntersection(partition, dfa.FinalStates).empty();
      states.push_back(State(id, "q" + std::to_string(id), isStart, isFinal, -1, -1));
      id++;
    }

    // Generate new DFA transitions
    std::vector<Transition> transitions;
    for (int fromState : reachableStates) {
      for (std::string token : dfa.Alphabet) {
        int fromId = 0;
        for (std::set<int> partition : p) {
          if (partition.find(fromState) != partition.end()) {
            break;
          }
          fromId++;
        }
        int toState = dfa.TransitionTable[fromState][token];
        int toId = 0;
        for (std::set<int> partition : p) {
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
          transitions.push_back(Transition(fromId, toId, token));
        }
      }
    }

    return NFA(true, states, transitions);
  }

  NFA convertNFAtoDFA(NFA oldNfa) {
    MathmaticalNFA nfa(oldNfa);

    // Initiate stateSubsets
    std::set<std::set<int>> stateSubsets = {{}}; // Contains each possible subset of states
    for (int stateId : nfa.States) {
      std::set<std::set<int>> newStateSubsets = stateSubsets;
      for (std::set<int> currentSubset : stateSubsets) {
        std::set<int> newSubset = currentSubset;
        newSubset.insert(stateId);
        newStateSubsets.insert(newSubset);
      }
      stateSubsets = newStateSubsets;
    }

    std::vector<State> newStates;
    std::vector<Transition> newTransitions;

    int newId = 0;
    for (std::set<int> subset : stateSubsets) {

      // Detemine if corresponding state is start or final
      bool isStart = nfa.TransitionTable[nfa.StartState]["ε"] == subset;
      bool isFinal = !setIntersection(nfa.FinalStates, subset).empty();
      newStates.push_back(State(newId, "q" + std::to_string(newId), isStart, isFinal, -1, -1));

      // Make subsets corresponding transitions
      for (std::string token : nfa.Alphabet) {
        // Ignore all epsilon transitions
        if (token == "ε") {
          continue;
        }

        // Get the set of states that the NFA can be in after consuming token
        std::set<int> allResultingStates;
        for (int i : subset) {
          allResultingStates = setUnion(allResultingStates, nfa.TransitionTable[i][token]);
        }        
        int resultingId = std::distance(stateSubsets.begin(), stateSubsets.find(allResultingStates));
        newTransitions.push_back(Transition(newId, resultingId, token));
      }
      newId++;
    }

    return simplifyDFA(NFA(true, newStates, newTransitions));
  }

  bool runDFA(NFA oldDfa, std::string word) {
    MathmaticalDFA dfa(oldDfa);
    int currentState = dfa.StartState;
    for (char character : word) {
      std::string characterString(1, character);
      currentState = dfa.TransitionTable[currentState][characterString];
    }
    return dfa.FinalStates.find(currentState) != dfa.FinalStates.end();
  }

  bool runNFA(NFA oldNfa, std::string word) {
    MathmaticalNFA nfa(oldNfa);

    std::set<int> currentStates = { nfa.StartState };
    for (char character : word) {
      std::string characterString(1, character);
      std::set<int> newStates = {};
      for (int currentState : currentStates) {
        std::set<int> epsilonClosure = nfa.TransitionTable[currentState]["ε"];
        for (int epsilonState : epsilonClosure) {
          newStates = setUnion(newStates, nfa.TransitionTable[epsilonState][characterString]);
        }
      }
      currentStates = newStates;
    }
    for (int resultingState : currentStates) {
      if (nfa.FinalStates.find(resultingState) != nfa.FinalStates.end()) {
        return true;
      }
    }
    return false;
  }
}
