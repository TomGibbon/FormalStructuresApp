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
  states: Array<State>;
  transitions: Array<Transition>;
};

export default NFA;
