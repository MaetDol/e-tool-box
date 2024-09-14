import { useRef, useState } from "react";
import { ForwardedNodeRef } from "../components/ConnectableNode";
import { useOnDrag } from "./useOnDrag";
import { Node } from "../types";
import { hasCollision } from "../utils";

export const useTryConnect = (
  nodes: Node[],
  nodeMapRef: React.RefObject<Map<number, ForwardedNodeRef>>,
  connect: (outputNodeId: number, inputNodeId: number | null) => void
) => {
  const draggingNodeRef = useRef<{ node: Node; isInput: boolean }>();
  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [endPos, setEndPos] = useState<[number, number]>([0, 0]);

  const endDragging = () => {
    draggingNodeRef.current = undefined;
    setStartPos([0, 0]);
    setEndPos([0, 0]);
  };

  const { startDrag: startConnectToOutput } = useOnDrag(
    ({ position: [x, y] }) => {
      setEndPos([x, y]);
    },
    (position) => {
      if (nodeMapRef.current && draggingNodeRef.current) {
        const target = nodes.find((it) => {
          if (it.id === draggingNodeRef.current?.node.id) return false;

          const nodeRef = nodeMapRef.current?.get?.(it.id)?.containerRef;
          if (!nodeRef) return false;

          return hasCollision(position, it, nodeRef);
        });

        if (draggingNodeRef.current.isInput && target) {
          connect(target.id, draggingNodeRef.current.node.id);
        } else {
          if (target) {
            connect(draggingNodeRef.current.node.id, target.id);
          } else {
            connect(draggingNodeRef.current.node.id, null);
          }
        }
      }
      endDragging();
    }
  );

  const setStartDragging = (
    pos: [number, number],
    node: Node,
    isInput: boolean
  ) => {
    draggingNodeRef.current = { node, isInput };
    setStartPos(pos);
    setEndPos(pos);
  };

  const startDrag = (e: React.MouseEvent, node: Node, isInput: boolean) => {
    startConnectToOutput();
    setStartDragging([e.clientX, e.clientY], node, isInput);
  };

  return {
    startPos,
    endPos,
    startDrag: startDrag,
  };
};
