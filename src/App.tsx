import { useRef, useState } from "react";
import { Line } from "./components/Line";
import {
  ForwardedNodeRef,
  ConnectableNode as NodeBase,
} from "./components/ConnectableNode";
import styled from "styled-components";
import { Node } from "./types";
import { useDragNode, useOnDrag, useTryConnect } from "./hooks";

function App() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 1,
      position: [500, 500],
      output: 2,
    },
    {
      id: 2,
      position: [Math.random() * 500, Math.random() * 500],
      output: null,
    },
  ]);

  const nodeMapRef = useRef<Map<number, ForwardedNodeRef>>(new Map());
  const { startDrag, startPos, endPos } = useTryConnect(
    nodes,
    nodeMapRef,
    (from, to) => {
      setNodes((prev) =>
        prev.map((node) => {
          const isBaseNode = from === node.id;
          if (isBaseNode) {
            return { ...node, output: to };
          }
          return node;
        })
      );
    }
  );

  const { handleMouseDown } = useDragNode({ nodes, setNodes });

  return (
    <div>
      <button
        onClick={() =>
          setNodes((prev) => [
            ...prev,
            {
              id: Math.max(...prev.map((node) => node.id)) + 1,
              position: [Math.random() * 500, Math.random() * 500],
              output: null,
            },
          ])
        }
      >
        노드 추가하기
      </button>
      <Container>
        {nodes.map((node) => (
          <div key={node.id}>
            <NodeBase
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
              onMouseDownInput={(e) => startDrag(e, node, true)}
              onMouseDownOutput={(e) => startDrag(e, node, false)}
            />
            {node.output && getNode(node.output, nodes) && (
              <Line
                startPoint={getOutputPosition(
                  getNode(node.id, nodes),
                  nodeMapRef.current.get(node.id)
                )}
                endPoint={getInputPosition(
                  getNode(node.output, nodes),
                  nodeMapRef.current.get(node.id)
                )}
              />
            )}
          </div>
        ))}

        <Line startPoint={endPos} endPoint={startPos} />
      </Container>
    </div>
  );
}

export default App;

const Container = styled.div`
  position: relative;
`;

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
