import { useEffect, useRef, useState } from "react";
import { Line } from "./components/Line";
import { ForwardedNodeRef, Node } from "./components/Node";

type Node = {
  id: number;
  position: [number, number];
  input: number | null;
  output: number | null;
};

function App() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 1,
      position: [500, 500],
      input: null,
      output: 2,
    },
    {
      id: 2,
      position: [Math.random() * 500, Math.random() * 500],
      input: 1,
      output: null,
    },
  ]);

  const { startDrag, startPos, endPos } = useTryConnect();

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

  const nodeMapRef = useRef<Map<number, ForwardedNodeRef>>(new Map());
  const handleMouseDown = (e: React.MouseEvent, node: Node) => {
    startCardDrag();
    targetBasePoint.current = node;
  };

  return (
    <>
      {nodes.map((node) => (
        <div key={node.id}>
          <Node
            key={node.id}
            position={node.position}
            onMouseDownCard={(e) => handleMouseDown(e, node)}
            ref={(ref) => {
              if (ref?.containerRef) {
                nodeMapRef.current.set(node.id, ref);
              } else {
                nodeMapRef.current.delete(node.id);
              }
            }}
            onMouseDownInput={(e) => startDrag(e, node)}
            onMouseDownOutput={(e) => startDrag(e, node)}
          />
          {node.output && getNode(node.output, nodes) && (
            <Line
              startPoint={getInputPosition(
                getNode(node.id, nodes),
                nodeMapRef.current.get(node.id)
              )}
              endPoint={getOutputPosition(
                getNode(node.output, nodes),
                nodeMapRef.current.get(node.id)
              )}
            />
          )}
        </div>
      ))}

      <Line startPoint={endPos} endPoint={startPos} />
    </>
  );
}

export default App;

export const useDrag = (basePosition: [number, number] = [0, 0]) => {
  const onDragRef = useRef(false);
  const [start, setStart] = useState<[number, number]>([0, 0]);
  const [end, setEnd] = useState<[number, number]>([0, 0]);
  const posRef = useRef(basePosition);
  const vectorRef = useRef([0, 0]);

  const onMouseDown = (e: React.MouseEvent) => {
    setStart([e.clientX, e.clientY]);
    onDragRef.current = true;
  };

  useEffect(() => {
    const onMouseUp = () => {
      onDragRef.current = false;
      vectorRef.current = [0, 0];
    };

    let prev = [NaN, NaN];
    const onMouseMove = (e: MouseEvent) => {
      if (!onDragRef.current) return;
      if (isNaN(prev[0])) {
        prev = [e.clientX, e.clientY];
        return;
      }
      setEnd([e.clientX, e.clientY]);
      vectorRef.current = [e.clientX - prev[0], e.clientY - prev[1]];
      posRef.current = [
        posRef.current[0] + vectorRef.current[0],
        posRef.current[1] + vectorRef.current[1],
      ];
      prev = [e.clientX, e.clientY];
    };

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [start]);

  return {
    start,
    end,
    onMouseDown,
    posRef,
    vectorRef,
  };
};

const useOnDrag = (
  onDrag: ({
    position,
    vector,
  }: {
    position: [number, number];
    vector: [number, number];
  }) => void,
  onDragEnd?: (position: [number, number]) => void
) => {
  const [isDragging, setIsDragging] = useState(false);

  const callbackRef = useRef({ onDrag, onDragEnd });
  callbackRef.current = { onDrag, onDragEnd };

  const lastMousePosition = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!isDragging) return;

    const onMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      callbackRef.current.onDragEnd?.([
        lastMousePosition.current?.[0] ?? e.clientX,
        lastMousePosition.current?.[1] ?? e.clientY,
      ]);
    };

    lastMousePosition.current = null;
    const onMouseMove = (e: MouseEvent) => {
      if (!lastMousePosition.current) {
        lastMousePosition.current = [e.clientX, e.clientY];
        return;
      }

      const [x, y] = lastMousePosition.current ?? [0, 0];
      callbackRef.current.onDrag({
        position: [e.clientX, e.clientY],
        vector: [e.clientX - x, e.clientY - y],
      });
      lastMousePosition.current = [e.clientX, e.clientY];
    };

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isDragging]);

  return {
    startDrag: () => setIsDragging(true),
    endDrag: () => setIsDragging(false),
  };
};

const hasCollision = (
  [x, y]: [number, number],
  node: any,
  nodeElem: HTMLDivElement
) => {
  if (x < node.position[0]) return false;
  if (y < node.position[1]) return false;

  if (x > node.position[0] + nodeElem.offsetWidth) return false;
  if (y > node.position[1] + nodeElem.offsetHeight) return false;

  return true;
};

function getInputPosition(
  node: Node,
  nodeRef?: ForwardedNodeRef
): [number, number] {
  return [
    node.position[0] + (nodeRef?.inputRelativePosition[0] ?? 0),
    node.position[1] + (nodeRef?.inputRelativePosition[1] ?? 0),
  ];
}

function getOutputPosition(
  node: Node,
  nodeRef?: ForwardedNodeRef
): [number, number] {
  return [
    node.position[0] + (nodeRef?.outputRelativePosition[0] ?? 0),
    node.position[1] + (nodeRef?.outputRelativePosition[1] ?? 0),
  ];
}

function getNode(nodeId: number | null, nodes: Node[]): Node | undefined {
  return nodes.find((node) => node.id === nodeId);
}

const useTryConnect = () => {
  const isDragging = useRef(false);
  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [endPos, setEndPos] = useState<[number, number]>([0, 0]);

  const endDragging = () => {
    isDragging.current = false;
    setStartPos([0, 0]);
    setEndPos([0, 0]);
  };

  const { startDrag: startConnectToOutput } = useOnDrag(
    ({ position: [x, y] }) => {
      setEndPos([x, y]);
    },
    () => {
      endDragging();
    }
  );

  const setStartDragging = (pos: [number, number]) => {
    isDragging.current = true;
    setStartPos(pos);
    setEndPos(pos);
  };

  const startDrag = (e: React.MouseEvent, node: Node) => {
    startConnectToOutput();
    setStartDragging([e.clientX, e.clientY]);
  };

  return {
    startPos,
    endPos,
    startDrag: startDrag,
    handleMouseDownOnOutput: startDrag,
  };
};
