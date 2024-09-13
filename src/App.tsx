import { useEffect, useRef, useState } from 'react';
import { Line } from './components/Line';
import { ForwardedNodeRef, Node } from './components/Node';

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

  const targetBasePoint = useRef<Node | null>(null);

  const { startDrag: startCardDrag } = useOnDrag(([x, y]) => {
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
          />
          {node.output && (
            <Line
              startPoint={[
                node.position[0] +
                  (nodeMapRef.current.get(node.id)?.inputRelativePosition[0] ??
                    0),
                node.position[1] +
                  (nodeMapRef.current.get(node.id)?.inputRelativePosition[1] ??
                    0),
              ]}
              endPoint={[
                (nodes.find((n) => n.id === node.output)?.position[0] ?? 0) +
                  (nodeMapRef.current.get(node.id)?.outputRelativePosition[0] ??
                    0),
                (nodes.find((n) => n.id === node.output)?.position[1] ?? 0) +
                  (nodeMapRef.current.get(node.id)?.outputRelativePosition[1] ??
                    0),
              ]}
            />
          )}
        </div>
      ))}
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

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
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
  onDrag: (position: [number, number]) => void,
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
      callbackRef.current.onDrag([e.clientX - x, e.clientY - y]);
      lastMousePosition.current = [e.clientX, e.clientY];
    };

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
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
