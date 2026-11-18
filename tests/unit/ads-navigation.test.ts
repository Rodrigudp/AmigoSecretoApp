import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// Components and shared shell rendered on the monetized page must use full navigation.
const files = [
  "app/p/g/[groupId]/page.tsx",
  "app/p/layout.tsx",
  "app/layout.tsx",
  "app/_components/ParticipantArea.tsx",
  "app/_components/ParticipantHeader.tsx",
  "app/_components/WishList.tsx",
  "app/_components/WishItem.tsx",
  "app/_components/Footer.tsx",
];
function unsafe(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const errors: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === "next/link"
    )
      errors.push(`${file}: next/link`);
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ["push", "replace"].includes(node.expression.name.text) &&
      node.expression.expression.getText(source) === "router"
    )
      errors.push(`${file}: router navigation`);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return errors;
}
describe("monetized navigation", () => {
  it("does not use Next Link or router navigation in the page and shell", () =>
    expect(files.flatMap(unsafe)).toEqual([]));
});
