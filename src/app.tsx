import * as React from "react";
import { MathRenderer, MathEditor, FontDataContext } from "@math-blocks/react";
import * as Typesetter from "@math-blocks/typesetter";
import * as Editor from "@math-blocks/editor";
import { getFontData, parse } from "@math-blocks/opentype";

import type { FontData } from "@math-blocks/opentype";

import MyEditor from "./my-editor";
// @ts-expect-error: TypeScript doesn't know about this path
import stixPath from "../assets/STIX2Math.otf";

const stixFontLoader = async (): Promise<FontData> => {
  console.log(stixPath);
  const res = await fetch(stixPath);
  const blob = await res.blob();
  const font = await parse(blob);
  return getFontData(font, "STIX2");
};

type MRWProps = {
  row: Editor.types.CharRow;
};

const MathRendererWrapper: React.FC<MRWProps> = ({ row }) => {
  const [fontData, setFontData] = React.useState<FontData | null>(null);

  React.useEffect(() => {
    stixFontLoader().then(setFontData);
  }, []);

  if (!fontData) {
    return null;
  }

  const fontSize = 22;
  const context: Typesetter.Context = {
    fontData: fontData,
    baseFontSize: fontSize,
    mathStyle: Typesetter.MathStyle.Display,
    renderMode: Typesetter.RenderMode.Static,
    cramped: false,
  };

  const scene = Typesetter.typeset(row, context);
  return <MathRenderer scene={scene} />;
};

const MathEditorWrapper: React.FC<MRWProps> = ({ row }) => {
  const [fontData, setFontData] = React.useState<FontData | null>(null);

  React.useEffect(() => {
    stixFontLoader().then(setFontData);
  }, []);

  if (!fontData) {
    return null;
  }

  const fontSize = 22;
  const context: Typesetter.Context = {
    fontData: fontData,
    baseFontSize: fontSize,
    mathStyle: Typesetter.MathStyle.Display,
    renderMode: Typesetter.RenderMode.Static,
    cramped: false,
  };

  const zipper = Editor.rowToZipper(row, []);
  if (!zipper) {
    throw new Error("Couldn't convert row to zipper");
  }
  return (
    <FontDataContext.Provider value={fontData}>
      <MathEditor zipper={zipper} readonly={false} fontSize={fontSize} />
    </FontDataContext.Provider>
  );
};

const App: React.FC = () => {
  const row = Editor.util.row("y=mx+b");
  return (
    <div>
      <h1>slate.js demo</h1>
      <MyEditor />
      <br />
      <br />
      <br />
      <br />
      <p>The components that will eventually replace the input fields in the slate.js demo above.</p>
      <h2>Renderer</h2>
      <MathRendererWrapper row={row} />
      <h2>Editor</h2>
      <p>NOTE: You can click on this one to focus it and start editing</p>
      <MathEditorWrapper row={row} />
    </div>
  );
};

export default App;
