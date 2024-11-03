import styled from "styled-components";
import HorizontalCard from "./HorizontalCard";
import TextField from "../designSystem/TextField";

export type Item = {
  id: string;
  isSelected: boolean;
  label: string;
  exclusive?: boolean;
  textInput?: {
    value: string;
    placeholder: string;
  };
};

interface Props {
  onChange: (newItems: Item[]) => void;
  values: Item[];
}

const SelectSurvey = ({ onChange, values }: Props) => {
  const replaceItem = (items: Item[], newItem: Item) => {
    return items.map((item) => (item.id === newItem.id ? newItem : item));
  };

  const onChangeText = (option: Item, value: string) => {
    if (!option.textInput) return;

    const newItem = {
      ...option,
      isSelected: true,
      textInput: {
        ...option.textInput,
        value,
      },
    };

    onChange(replaceItem(values, newItem));
  };

  const onToggle = (option: Item) => {
    const newItem: Item = { ...option, isSelected: !option.isSelected };
    // 단일 선택
    if (newItem.exclusive && newItem.isSelected) {
      const items = values.map((item) => ({ ...item, isSelected: false }));
      onChange(replaceItem(items, newItem));
      return;
    }

    // 다른 아이템 선택시 단일 선택 해제
    const turnOffExclusive = values.find((it) => it.exclusive && it.isSelected);
    let items = replaceItem(values, newItem);
    if (turnOffExclusive) {
      items = replaceItem(items, { ...turnOffExclusive, isSelected: false });
    }

    onChange(items);
  };

  return (
    <List>
      {values.map((option) => (
        <Item key={option.id}>
          <HorizontalCard
            onClick={() => onToggle(option)}
            isActive={option.isSelected}
            text={option.label}
          />
          {option.isSelected && option.textInput && (
            <TextField
              value={option.textInput.value}
              onChange={(text) => onChangeText(option, text)}
              onClickClose={() => onChangeText(option, "")}
              placeholder={option.textInput.placeholder}
              size="small"
            />
          )}
        </Item>
      ))}
    </List>
  );
};

export default SelectSurvey;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
