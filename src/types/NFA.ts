type State = {
  id: number;
  name: string;
  isStart: boolean;
  isFinal: boolean;
};

export type Transition = {
  id: number;
  start: number;
  end: number;
  token: string;
};

type NFA = {
  isDfa: boolean;
  states: State[];
  transitions: Transition[];
};

export default NFA;
