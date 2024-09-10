import styled from 'styled-components';

interface Props {
  startPoint: [number, number];
  endPoint: [number, number];
}

export const Line = ({ endPoint, startPoint }: Props) => {
  return (
    <Svg
      style={{ position: 'absolute' }}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <line
        x1={startPoint[0]}
        y1={startPoint[1]}
        x2={endPoint[0]}
        y2={endPoint[1]}
        stroke="black"
      />
    </Svg>
  );
};

const Svg = styled.svg`
  position: absolute;
  -webkit-user-drag: none;
`;
