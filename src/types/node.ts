import { Position } from "./position";

export type Node = {
  id: string;
  position: Position;
  output: string | null;
};
