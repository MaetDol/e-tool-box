import { useRef } from "react";
import { Node } from "../types";
import { useOnDrag } from "./useOnDrag";

interface Parameters {
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
}

export const useDragNode = ({ nodes, setNodes }: Parameters) => {
  const targetBasePoint = useRef<Node | null>(null);

  const { startDrag: startCardDrag } = useOnDrag(({ vector: [x, y] }) => {
    if (!targetBasePoint.current) return;

    const newNode: Node = {
      ...targetBasePoint.current,
      position: [
        targetBasePoint.current.position[0] + x,
        targetBasePoint.current.position[1] + y,
      ],
    };
    setNodes(nodes.map((node) => (node.id === newNode.id ? newNode : node)));
    targetBasePoint.current = newNode;
  });

  const handleMouseDown = (e: React.MouseEvent, node: Node) => {
    startCardDrag();
    targetBasePoint.current = node;
  };

  return {
    handleMouseDown,
  };
};
