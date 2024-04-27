import NFA from './NFA';

type Structure = {
  structure: NFA | undefined;
  type: string;
};

// Allows for the structure to be duplicated into a differently referenced object, so that the original one is safe
export const copyStructure = (structure: Structure) => {
  switch (structure.type) {
    case 'nfa':
      const nfa = structure.structure as NFA;
      const states = nfa.states.map(state => ({ ...state })); // Get a different reference to each state
      const transitions = nfa.transitions.map(transition => ({ ...transition })); // Get a different reference to each transition
      return {
        structure: {
          isDfa: nfa.isDfa,
          states: states,
          transitions: transitions,
        },
        type: 'nfa',
      };
    default:
      return { structure: undefined, type: '' };
  }
};

export default Structure;
