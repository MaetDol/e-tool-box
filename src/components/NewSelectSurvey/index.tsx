import { useEffect, useState } from "react";
import * as S from "./styles";
import { nanoid } from "nanoid";
import { ConnectableNode } from "../ConnectableNode";
import { Node } from "../../types";

interface Props {
  onChangeSelectSurvey: (question: any) => void;
  id: string;
  addNode: (props: { id: string; position: [number, number] }) => void;
  removeNode: (id: string) => void;
  onDragNextPage: (...args: any[]) => void;
  getNodeById: (id: string) => Node | undefined;
  addNodeRef: (id: string) => any;
}

export const NewSelectSurvey = ({
  onChangeSelectSurvey,
  id,
  addNode,
  removeNode,
  getNodeById,
  onDragNextPage,
  addNodeRef,
}: Props) => {
  const [attr, setAttr] = useState({
    id: id,
    title: "",
    subTitle: "",
    type: "STANDARD",
    choiceType: "SINGLE",
    minSelections: 1,
  });
  const handleAttrChange = (name: string, value: any) => {
    setAttr({ ...attr, [name]: value });
  };

  const [items, setItems] = useState([
    {
      id: nanoid(),
      text: "",
      type: "STANDARD",
      isExclusive: false,
      isOther: false,
      nextPageId: null,
      nextPage: {
        isExists: false,
        node: null,
      },
    },
  ]);

  const removeItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const addNewItem = () => {
    setItems([
      ...items,
      {
        id: nanoid(),
        text: "",
        type: "STANDARD",
        isExclusive: false,
        isOther: false,
        nextPageId: null,
        nextPage: {
          isExists: false,
          node: null,
        },
      },
    ]);
  };

  const handleValueChange = (name: string, id: string, value: any) => {
    setItems(
      items.map((attr) => (attr.id !== id ? attr : { ...attr, [name]: value }))
    );
  };

  useEffect(() => {
    if (!attr.title) return;

    onChangeSelectSurvey({
      ...attr,
      options: items,
    });
  }, [attr, items]);

  return (
    <S.Container>
      <div>
        <input
          value={attr.title}
          placeholder="제목을 입력해주세요"
          onChange={(e) => handleAttrChange("title", e.target.value)}
        />
      </div>
      <div>
        <input
          value={attr.subTitle}
          placeholder="부제목을 입력해주세요"
          onChange={(e) => handleAttrChange("subTitle", e.target.value)}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            onChange={(e) =>
              handleAttrChange(
                "choiceType",
                e.target.checked ? "SINGLE" : "MULTIPLE"
              )
            }
          />
          다중선택
        </label>
      </div>
      <S.Divider />
      <S.Divider />
      <ul>
        {items.map(({ id, isExclusive, text, nextPage }) => (
          <S.GapContainer key={id}>
            <input
              value={text}
              placeholder="텍스트를 입력해주세요"
              onChange={(e) => handleValueChange("text", id, e.target.value)}
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isExclusive}
                  onChange={(e) =>
                    handleValueChange("isExclusive", id, e.target.checked)
                  }
                />
                다른 답변 함께 선택 불가
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      addNode?.({
                        id,
                        position: [-100, -100],
                      });
                    } else {
                      removeNode?.(id);
                    }

                    handleValueChange("nextPage", id, {
                      ...nextPage,
                      isExists: e.target.checked,
                    });
                  }}
                />
                선택시 다른 페이지로 이동
              </label>
              {nextPage.isExists && (
                <>
                  <ConnectableNode
                    position={["unset", "unset"]}
                    onMouseDownOutput={(e) =>
                      onDragNextPage(e, getNodeById(id), false)
                    }
                    ref={addNodeRef(id)}
                  >
                    <span style={{ padding: "8px 16px" }}>연결될 페이지: </span>
                  </ConnectableNode>
                  <div style={{ padding: "24px 8px" }} />
                </>
              )}
            </div>
            <div>
              <button onClick={() => removeItem(id)}>이 아이템 제거</button>
            </div>
            <S.Divider />
          </S.GapContainer>
        ))}
        <li>
          <button onClick={addNewItem}>아이템 추가 +</button>
        </li>
      </ul>
    </S.Container>
  );
};
