import React, { useState, useCallback, useRef } from "react";
import {
  createEditor,
  BaseEditor,
  Descendant,
  Editor,
  Transforms,
} from "slate";
import {
  ReactEditor,
  Slate,
  Editable,
  withReact,
  useSlateStatic,
  useSelected,
  useFocused,
} from "slate-react";

type MathElement = { type: "math"; children: [CustomText]; content: string };

type CustomElement =
  | { type: "paragraph"; children: (CustomText | MathElement)[] }
  | MathElement;
type CustomText = { text: string; bold?: boolean };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
    >
      {props.children}
    </span>
  );
};

type MathElementProps = {
  onChange: (value: string) => unknown;
  value: string;
  attributes: Record<string, any>;
};

const MathElement: React.FC<MathElementProps> = (props) => {
  const focused = useFocused();
  const selected = useSelected();
  const inputRef = useRef();

  const editor = useSlateStatic();

  const style = {
    borderRadius: 4,
    border: "none",
  };

  const selection = editor.selection;

  if (focused && selected && inputRef.current) {
    const input: HTMLInputElement = inputRef.current;
    const focus = JSON.stringify(selection.focus);
    const anchor = JSON.stringify(selection.anchor);
    if (focus === anchor && document.activeElement !== input) {
      setTimeout(() => input.focus(), 0);
    }
  }

  return (
    <span {...props.attributes}>
      <span contentEditable={false}>
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={style}
          ref={inputRef}
        />
      </span>
      {props.children}
    </span>
  );
};

const Element = (props) => {
  const { attributes, children, element } = props;

  const editor = useSlateStatic();

  const handleChange = (value: string) => {
    const path = ReactEditor.findPath(editor, element);
    const newProperties: Partial<CustomElement> = {
      content: value,
    };
    Transforms.setNodes(editor, newProperties, { at: path });
  };

  switch (element.type) {
    case "math":
      return (
        <MathElement
          attributes={attributes}
          children={children}
          value={element.content}
          onChange={handleChange}
        />
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const isMarkActive = (editor: Editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const withMath = (editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) =>
    element.type === "math" ? true : isInline(element);
  editor.isVoid = (element) =>
    element.type === "math" ? true : isVoid(element);

  return editor;
};

const App = () => {
  const [editor] = useState(() => withMath(withReact(createEditor())));

  const [value, setValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [
        { text: "A line of text in a paragraph." },
        { type: "math", children: [{ text: "" }], content: "y = mx + b" },
        { text: "Another line of text in a paragraph." },
      ],
    },
  ]);

  const renderLeaf = useCallback(
    (props) => {
      return <Leaf {...props} />;
    },
    []
  );

  const renderElement = useCallback(
    (props) => {
      return <Element {...props} />;
    },
    []
  );

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={() => toggleMark(editor, "bold")}
      >
        Bold
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={() => {
          console.log(JSON.stringify(value, null, 4));
        }}
      >
        Log model
      </button>
      <button
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={() => {
          const newMath: MathElement = {
            type: "math",
            children: [{ text: "" }],
            content: "y = mx + b",
          };
          Transforms.insertNodes(editor, newMath);
          Transforms.move(editor);
        }}
      >
        Insert math
      </button>
      <div style={{ backgroundColor: "rgba(128, 128, 128, 0.5)", padding: 8 }}>
        <Editable renderLeaf={renderLeaf} renderElement={renderElement} />
      </div>
    </Slate>
  );
};

export default App;
