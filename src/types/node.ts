import { Position } from "./position";

export type Node = {
  id: number;
  position: Position;
  output: number | null;
};
