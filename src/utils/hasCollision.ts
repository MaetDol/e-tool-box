import { Node } from "../types";

export const hasCollision = (
  [x, y]: [number, number],
  node: Node,
  nodeElem: HTMLDivElement
) => {
  if (x < node.position[0]) return false;
  if (y < node.position[1]) return false;

  if (x > node.position[0] + nodeElem.offsetWidth) return false;
  if (y > node.position[1] + nodeElem.offsetHeight) return false;

  return true;
};
