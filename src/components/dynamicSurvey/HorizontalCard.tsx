import styled, { css } from "styled-components";

interface Props {
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const HorizontalCard = ({ isActive = false, text, onClick }: Props) => {
  return (
    <Checkbox onClick={onClick} $selected={isActive}>
      {text}
    </Checkbox>
  );
};

export default HorizontalCard;

const focusedStyle = css`
  border: 2px solid ${({ theme }) => theme.colors.mint500};
  background-color: ${({ theme }) => theme.colors.mint150};
  color: ${({ theme }) => theme.colors.mint500};
  ${({ theme }) => theme.typography.Body3(700)}
`;

const Checkbox = styled.button<{ $selected: boolean }>`
  background-color: ${({ theme }) => theme.colors.gray150};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.gray500};
  ${({ theme }) => theme.typography.Body3(500)};
  padding: 18px 14px;
  text-align: left;
  border: 2px solid transparent;

  ${({ $selected }) => $selected && focusedStyle}
`;
