import { useState } from "react";
import styled from "styled-components";
import SelectSurvey, { Item } from "./dynamicSurvey/SelectSurvey";

export const SurveyContainer = () => {
  const [dummy, setDummy] = useState<Item[]>([
    {
      id: "1",
      isSelected: false,
      label: "아이템 1",
    },
    {
      id: "2",
      isSelected: false,
      label: "아이템 2",
      exclusive: true,
      imgSrc: "https://placehold.co/600x400/png",
    },
    {
      id: "3",
      isSelected: false,
      label: "아이템 3",
      textInput: {
        value: "",
        placeholder: "텍스트를 입력하세요",
      },
    },
    {
      id: "4",
      isSelected: false,
      label: "아이템 4",
      exclusive: false,
      imgSrc: "https://placehold.co/600x400/png",
      textInput: {
        value: "예시 텍스트",
        placeholder: "무엇이든 입력하세요",
      },
    },
    {
      id: "5",
      isSelected: false,
      label: "아이템 5",
      imgSrc: "https://placehold.co/600x400/png",
    },
    {
      id: "6",
      isSelected: false,
      label: "아이템 6",
      exclusive: true,
    },
    {
      id: "7",
      isSelected: false,
      label: "아이템 7",
      textInput: {
        value: "마지막 아이템",
        placeholder: "최종 입력",
      },
    },
  ]);

  return (
    <Page>
      <SelectSurvey values={dummy} onChange={setDummy} />
    </Page>
  );
};

const Page = styled.div`
  background-color: white;
  width: 320px;
  height: 570px;
  padding: 48px 16px 40px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
`;
