import { useEffect, useRef, useState } from 'react';
import { Line } from './components/Line';
import { Node } from './components/Node';

function App() {
  const drag = useDrag();
  const dragCard = useDrag([500, 500]);
  const nodeRef = useRef<any>(null);

  const [nodes, setNodes] = useState<any[]>([
    {
      id: 1,
      position: [500, 500],
    },
    {
      id: 2,
      position: [Math.random() * 500, Math.random() * 500],
    },
  ]);

  const targetBasePoint = useRef<any>(null);

  const { startDrag } = useOnDrag(
    ([x, y]) => {
      if (!targetBasePoint.current) return;

      const newNode = {
        ...targetBasePoint.current,
        position: [
          targetBasePoint.current.position[0] + x,
          targetBasePoint.current.position[1] + y,
        ],
      };
      setNodes(nodes.map((node) => (node.id === newNode.id ? newNode : node)));
      targetBasePoint.current = newNode;
    },
    ([x, y]) => {
      const conflictedConnector = getNearByConnector(
        [x, y],
        nodeMapRef.current
      );
      if (!conflictedConnector) {
        return;
      }
      if (conflictedConnector.node.id === targetBasePoint.current.id) {
        return;
      }

      // 새 라인을 만든다
    }
  );

  const nodeMapRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const handleMouseDown = (e: React.MouseEvent) => {
    const { clientX: x, clientY: y } = e;
    const draggingNode = nodes.find((node) =>
      hasCollision([x, y], node, nodeMapRef.current.get(node.id))
    );
    if (!draggingNode) return;

    startDrag();
    targetBasePoint.current = draggingNode;
  };

  return (
    <>
      {nodes.map((node) => (
        <Node
          key={node.id}
          position={node.position}
          onMouseDownCard={handleMouseDown}
          ref={(ref) => {
            if (ref?.containerRef) {
              nodeMapRef.current.set(node.id, ref.containerRef);
            } else {
              nodeMapRef.current.delete(node.id);
            }
          }}
        />
      ))}
      ;
      <Line
        startPoint={[
          dragCard.posRef.current[0] +
            (nodeRef.current?.inputRelativePosition[0] || 0),
          dragCard.posRef.current[1] +
            (nodeRef.current?.inputRelativePosition[1] || 0),
        ]}
        endPoint={drag.end}
      />
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

const useOnDrag = (onDrag, onDragEnd) => {
  const [isDragging, setIsDragging] = useState(false);

  const callbackRef = useRef({ onDrag, onDragEnd });
  callbackRef.current = { onDrag, onDragEnd };

  const lastMousePosition = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!isDragging) return;

    const onMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      callbackRef.current.onDragEnd([
        lastMousePosition.current?.[0],
        lastMousePosition.current?.[1],
      ]);
    };

    lastMousePosition.current = null;
    const onMouseMove = (e: MouseEvent) => {
      if (!lastMousePosition.current) {
        lastMousePosition.current = [e.clientX, e.clientY];
        return;
      }

      const [x, y] = lastMousePosition.current;
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
