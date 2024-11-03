import { useRef, useState } from "react";
import { Line } from "./components/Line";
import {
  ForwardedNodeRef,
  ConnectableNode as NodeBase,
} from "./components/ConnectableNode";
import styled from "styled-components";
import { Node } from "./types";
import { useDragNode, useTryConnect } from "./hooks";
import { NewSelectSurvey } from "./components/NewSelectSurvey";
import { nanoid } from "nanoid";

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);

  const nodeMapRef = useRef<Map<string, ForwardedNodeRef>>(new Map());
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
  const [questionNodes, setQuestionNodes] = useState<Node[]>([]);
  const questions = useRef(new Map());
  const handleChangeQuestion = (question) => {
    questions.current.set(question.id, question);
    setQuestionNodes((prev) =>
      prev.map((it) => (it.id === question.id ? question : it))
    );
  };

  const printLog = () => {
    const result = [...questions.current.values()].map((it) => {
      // option 에 nextPageId 가 있는지
      const question = it.options.map((o) => {
        const node = getNode(o.id, nodes);
        if (node?.output) {
          o.nextPageId = node.output;
        }

        return o;
      });

      const nextPageId = nodes.find((n) => n.id === it.id)?.output;
      return {
        id: it.id,
        nextPageId,
        isLastPage: !nextPageId,
        questions: [question],
      };
    });
    console.log(result);
  };

  const addQuestion = () => {
    const id = nanoid();
    setQuestionNodes((prev) => [
      ...prev,
      {
        id: id,
        position: [Math.random() * 500, Math.random() * 500],
        output: null,
      },
    ]);

    addNode({
      id: id,
      position: [Math.random() * 500, Math.random() * 500],
    });
  };

  const addNode = ({
    id,
    position,
  }: {
    id: string;
    position: [number, number];
  }) => {
    setNodes((prev) => [
      ...prev,
      {
        id,
        position,
        output: null,
      },
    ]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  };

  const addNodeRef = (id: string) => (ref: ForwardedNodeRef) => {
    if (ref?.containerRef) {
      nodeMapRef.current.set(id, ref);
    } else {
      nodeMapRef.current.delete(id);
    }
  };

  return (
    <div>
      <Absolute>
        <button onClick={() => addQuestion()}>노드 추가하기</button>
        <button onClick={() => printLog()}>JSON 출력하기</button>
      </Absolute>

      <Absolute>
        {nodes.map(
          (node) =>
            node.output &&
            getNode(node.output, nodes) && (
              <Line
                key={node.id}
                startPoint={getOutputPosition(nodeMapRef.current.get(node.id))}
                endPoint={getInputPosition(nodeMapRef.current.get(node.output))}
              />
            )
        )}

        <Line startPoint={endPos} endPoint={startPos} />
      </Absolute>
      <Container>
        {nodes
          .filter((it) => questionNodes.some((q) => q.id === it.id))
          .map((node) => (
            <div key={node.id}>
              <NodeBase
                key={node.id}
                position={node.position}
                onMouseDownCard={(e) => handleMouseDown(e, node)}
                ref={addNodeRef(node.id)}
                onMouseDownInput={(e) => startDrag(e, node, true)}
                onMouseDownOutput={(e) => startDrag(e, node, false)}
              >
                <NewSelectSurvey
                  id={node.id}
                  onChangeSelectSurvey={handleChangeQuestion}
                  addNode={addNode}
                  removeNode={removeNode}
                  onDragNextPage={startDrag}
                  getNodeById={(id) => getNode(id, nodes)}
                  addNodeRef={addNodeRef}
                />
              </NodeBase>
            </div>
          ))}
      </Container>
    </div>
  );
}

export default App;

const Container = styled.div`
  position: relative;
`;

const Absolute = styled.div`
  position: absolute;
  z-index: 1111;
`;

function getInputPosition(nodeRef?: ForwardedNodeRef): [number, number] {
  return nodeRef?.getInputPos() ?? [0, 0];
}

function getOutputPosition(nodeRef?: ForwardedNodeRef): [number, number] {
  return nodeRef?.getOutputPos() ?? [0, 0];
}

function getNode(nodeId: string | null, nodes: Node[]): Node | undefined {
  return nodes.find((node) => node.id === nodeId);
}
