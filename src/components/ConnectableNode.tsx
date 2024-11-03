import { forwardRef, useImperativeHandle, useRef } from "react";
import styled from "styled-components";

interface Props {
  className?: string;
  onMouseDownInput?: (e: React.MouseEvent) => void;
  onMouseDownOutput?: (e: React.MouseEvent) => void;
  onMouseDownCard?: (e: React.MouseEvent) => void;
  position: [number, number] | ["unset", "unset"];
  children?: React.ReactNode;
}

export interface ForwardedNodeRef {
  containerRef: HTMLDivElement | null;
  inputRelativePosition: [number, number];
  outputRelativePosition: [number, number];
  getInputPos: () => [number, number];
  getOutputPos: () => [number, number];
}

export const ConnectableNode = forwardRef<ForwardedNodeRef, Props>(
  (
    {
      className,
      onMouseDownInput,
      onMouseDownOutput,
      onMouseDownCard,
      position,
      children,
    },
    ref
  ) => {
    const inputMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      onMouseDownInput?.(e);
    };

    const outputMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      onMouseDownOutput?.(e);
    };

    const cardMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      onMouseDownCard?.(e);
    };
    const containerRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLSpanElement>(null);
    useImperativeHandle(
      ref,
      (): ForwardedNodeRef => {
        const defaultReturn: ForwardedNodeRef = {
          inputRelativePosition: [0, 0],
          outputRelativePosition: [0, 0],
          containerRef: null,
          getInputPos: () => [0, 0],
          getOutputPos: () => [0, 0],
        };
        if (!containerRef.current) return defaultReturn;

        const container = containerRef.current.getBoundingClientRect();

        return {
          inputRelativePosition: [0, container.height / 2],
          outputRelativePosition: [+container.width, container.height / 2],
          containerRef: containerRef.current,
          getInputPos: () => {
            if (!inputRef.current) return [0, 0];
            const { left, top, width, height } =
              inputRef.current.getBoundingClientRect();
            return [left + width / 2, top + height / 2];
          },
          getOutputPos: () => {
            if (!outputRef.current) return [0, 0];
            const { left, top, width, height } =
              outputRef.current.getBoundingClientRect();
            return [left + width / 2, top + height / 2];
          },
        };
      },
      []
    );
    return (
      <Container
        ref={containerRef}
        style={{
          left: position[0],
          top: position[1],
        }}
        className={className}
        onMouseDown={cardMouseDown}
      >
        {children}
        {onMouseDownInput && (
          <Connector ref={inputRef} onMouseDown={inputMouseDown} />
        )}
        {onMouseDownOutput && (
          <OutputConnector ref={outputRef} onMouseDown={outputMouseDown} />
        )}
      </Container>
    );
  }
);

const Container = styled.div`
  background-color: white;
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  z-index: 1;
  -webkit-user-drag: none;
`;

const Connector = styled.span`
  display: inline-block;
  width: 12px;
  aspect-ratio: 1;
  border-radius: 100px;
  background: white;
  border: 4px solid steelblue;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const OutputConnector = styled(Connector)`
  left: initial;
  right: 0;
  transform: translate(50%, -50%);
`;
