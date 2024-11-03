import styled, { css } from "styled-components";

interface Props {
  /** 인풋 필드 상단 텍스트 */
  label?: string;
  placeholder?: string;

  /** 인풋 필드 아래 텍스트 */
  helpText?: string;

  size?: "large" | "small";

  isInvalid?: boolean;
  disabled?: boolean;

  value?: string;
  onChange?: (value: string) => void;
  onClickClose?: () => void;
}

const TextField = ({
  label,
  placeholder,
  helpText,
  disabled = false,
  isInvalid = false,
  onChange = () => {},
  onClickClose,
  value,
  size = "large",
}: Props) => {
  return (
    <Container $isLarge={size === "large"}>
      {label}
      <InputWrapper>
        <Input
          $isLarge={size === "large"}
          $isInvalid={isInvalid}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          value={value}
        />
        <CloseButton onClick={onClickClose}>X</CloseButton>
      </InputWrapper>
      {helpText && <HelpText $isInvalid={isInvalid}>{helpText}</HelpText>}
    </Container>
  );
};

export default TextField;

const large = {
  input: css`
    padding: 13px calc(15px + 24px) 13px 15px;
    ${({ theme }) => theme.typography.Body3(400)};
  `,

  label: css`
    ${({ theme }) => theme.typography.Detail1(500)};
  `,
};

const small = {
  input: css`
    padding: 9px calc(15px + 20px) 9px 15px;
    ${({ theme }) => theme.typography.Detail1(400)};
  `,

  label: css`
    ${({ theme }) => theme.typography.Detail3(500)};
  `,
};

const Container = styled.label<{ $isLarge: boolean }>`
  display: flex;
  gap: 4px;
  flex-direction: column;

  color: ${({ theme }) => theme.colors.black};
  ${({ $isLarge }) => ($isLarge ? large.label : small.label)}
`;

const InputWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const Input = styled.input<{ $isInvalid: boolean; $isLarge: boolean }>`
  ${({ $isLarge }) => ($isLarge ? large.input : small.input)}
  background-color: ${({ theme }) => theme.colors.white};
  outline: none;
  border-radius: 4px;
  border: 1px solid transparent;
  border-color: ${({ theme, $isInvalid }) =>
    $isInvalid ? theme.colors.red500 : theme.colors.gray400};
  color: ${({ theme }) => theme.colors.gray900};
  width: 100%;

  &:focus {
    ${({ theme, $isInvalid }) =>
      !$isInvalid &&
      css`
        border-color: ${theme.colors.mint500};
      `};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray500};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray100};
    border-color: ${({ theme }) => theme.colors.gray300};
  }
`;

const CloseButton = styled.button`
  padding: 0;
`;

const CloseIcon = styled.img<{ $isLarge: boolean }>`
  position: absolute;
  width: ${({ $isLarge }) => ($isLarge ? "24px" : "20px")};
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
`;

const HelpText = styled.span<{ $isInvalid: boolean }>`
  margin-left: 16px;
  margin-top: -2px;
  ${({ theme }) => theme.typography.Detail3(400)};
  color: ${({ theme, $isInvalid }) =>
    $isInvalid ? theme.colors.red500 : theme.colors.gray700};
`;
