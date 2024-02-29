type State = {
  id: number;
  name: string;
  isStart: boolean;
  isFinal: boolean;
  locX: number;
  locY: number;
};

export type Transition = {
  id: number;
  from: number;
  to: number;
  token: string;
};

type NFA = {
  isDfa: boolean;
  states: Array<State>;
  transitions: Array<Transition>;
};

export default NFA;
