import NFA from './NFA';

type Structure = {
  structure: NFA | undefined;
  type: string;
};

export const copyStructure = (structure: Structure) => {
  switch (structure.type) {
    case 'nfa':
      const nfa = structure.structure as NFA;
      const states = nfa.states.map(state => ({ ...state }));
      const transitions = nfa.transitions.map(transition => ({
        ...transition,
      }));
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
