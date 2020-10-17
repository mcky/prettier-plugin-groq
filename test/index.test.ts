import { oneLineTrim, stripIndent } from "common-tags";
import groq from "groq";
import path from "path";
import prettier from "prettier";
import * as fixtures from "./fixtures";

const format = (str: string) =>
  prettier.format(str, {
    plugins: [path.resolve(__dirname, "../")],
    // @ts-ignore
    parser: "groq-parse",
  });

describe("prettier-plugin-groq", () => {
  describe("Projections", () => {
    it("Does not duplicate ObjectAttributes with matching key & value", () => {
      // we want { id } not { "id": id }
      const query = groq`*[] { id }`;
      expect(format(query)).toEqual(query);
    });
  });

  describe("Line breaks", () => {
    it("simple one line", () => {
      const query = groq`*[foo == bar] { one, two }`;
      expect(format(query)).toEqual(query);
    });

    it("simple one line, array in filter", () => {
      const query = groq`*[foo in [bar]] { one, two }`;
      expect(format(query)).toEqual(query);
    });

    it("simple multi line", () => {
      const query = stripIndent(groq`
        *[foo == bar] {
          one,
          two,
          three,
          four,
          five
        }
      `);

      const formatted = format(query);
      expect(formatted).toEqual(query);
    });

    it("simple multiline nested", () => {
      const query = stripIndent(groq`
      *[foo == bar] {
        one,
        two,
        three { four },
        five
      }
    `);

      const formatted = format(query);
      expect(formatted).toEqual(query);
    });
  });

  describe.only("fixtures", () => {
    describe.each([
      ["Constraints", fixtures.constraints],
      ["Slice operations", fixtures.sliceOps],
      ["Ordering", fixtures.ordering],
      ["Joins", fixtures.joins],
      ["Object projections", fixtures.objectProjections],
      ["Special variables", fixtures.specialVars],
      ["Conditionals", fixtures.conditionals],
      ["Functions", fixtures.functions],
      ["Arithmetic and concatenation", fixtures.arithmeticAndConcatenation],
    ])("%s", (category, queries) => {
      const strippedAndDesired = queries.map((q) => [
        oneLineTrim(q),
        stripIndent(q),
      ]);

      describe.each(strippedAndDesired)("%s", (input, expected) => {
        it("Correctly serializes the AST back to GROQ", () => {
          const expectedNoWhitespace = expected.replace(/\s/g, "");
          const outputNoWhitespace = format(input).replace(/\s/g, "");
          expect(outputNoWhitespace).toEqual(expectedNoWhitespace);
        });

        it("Formats the GROQ", () => {
          expect(format(input)).toEqual(expected);
        });
      });
    });
  });
});
