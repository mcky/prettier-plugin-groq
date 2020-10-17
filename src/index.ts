import { parse } from "groq-js";
import { SyntaxNode } from "groq-js/src/nodeTypes";
import { doc, Parser, Printer, SupportLanguage } from "prettier";
import { inspect } from "util";

const {
  concat,
  group,
  line,
  hardline,
  softline,
  join,
  indent,
  dedent,
  ifBreak,
} = doc.builders;

const log = (s, n = Infinity) =>
  console.log("%s", inspect(s, { colors: true, depth: n }));

type PrinterFunc = Printer["print"];

const printGroq: PrinterFunc = (path, options, print) => {
  const node: SyntaxNode = path.getValue();

  options.printWidth = 20;

  // Print root node
  // if (path.getName() === null) {
  // log(node);
  // }

  switch (node.type) {
    case "Projection":
      return group(
        concat([
          path.call(print, "base"),
          " ",
          group(path.call(print, "query")),
        ])
      );

    case "Filter":
      return concat([
        node.base ? path.call(print, "base") : "",
        "[",
        node.query ? path.call(print, "query") : "",
        "]",
      ]);

    case "Slice":
      return concat([
        path.call(print, "base"),
        "[",
        path.call(print, "left"),
        node.isExclusive ? "..." : "..",
        path.call(print, "right"),
        "]",
      ]);

    case "OpCall":
      return concat([
        path.call(print, "left"),
        " ",
        node.op,
        " ",
        path.call(print, "right"),
      ]);

    case "And":
      return concat([
        path.call(print, "left"),
        " ",
        "&&",
        " ",
        path.call(print, "right"),
      ]);

    case "Not":
      return concat(["!", path.call(print, "base")]);

    case "Or":
      return concat([
        path.call(print, "left"),
        " ",
        "||",
        " ",
        path.call(print, "right"),
      ]);

    case "Parenthesis":
      return concat(["(", path.call(print, "base"), ")"]);

    case "FuncCall":
      // Workaround for better fromatting of select(Pairs), can be improved
      if (node.name == "select") {
        return concat([
          node.name,
          "(",
          indent(
            concat([
              softline,
              join(concat([",", line]), path.map(print, "args")),
            ])
          ),
          softline,
          ")",
        ]);
      }
      return concat([node.name, "(", join(", ", path.map(print, "args")), ")"]);

    case "Pair":
      return concat([
        path.call(print, "left"),
        " => ",
        path.call(print, "right"),
      ]);

    case "PipeFuncCall":
      return concat([
        path.call(print, "base"),
        " | ",
        node.name,
        "(",
        join(", ", path.map(print, "args")),
        ")",
      ]);

    case "Desc":
      return concat([path.call(print, "base"), " desc"]);

    case "Asc":
      return concat([path.call(print, "base"), " asc"]);

    case "Parameter":
      return concat(["$", node.name]);

    case "Attribute":
      if (node?.base?.type === "Deref") {
        return concat([path.call(print, "base"), node.name]);
      }

      // Render @["1"] instead of @.1. Fix feels hacky/overly-specific
      if (node?.base?.type === "This") {
        return concat([path.call(print, "base"), '["', node.name, '"]']);
      }

      return concat([path.call(print, "base"), ".", node.name]);

    case "Mapper":
      return concat([path.call(print, "base"), "[]"]);

    case "Deref":
      return concat([path.call(print, "base"), "->"]);

    // If splat w. no value, type is `This`
    // @TODO check about other contexts of This (@^?)
    case "ObjectSplat":
      return concat(["...", path.call(print, "value")]);

    case "Object":
      return group(
        concat([
          "{",
          indent(
            concat([
              options.bracketSpacing ? line : softline,
              join(concat([",", line]), path.map(print, "attributes")),
            ])
          ),
          options.bracketSpacing ? line : softline,
          "}",
        ])
      );

    case "Array":
      return concat([
        "[",
        indent(
          concat([
            softline,
            join(concat([",", line]), path.map(print, "elements")),
          ])
        ),
        softline,
        "]",
      ]);

    case "ObjectAttribute":
      const val = path.call(print, "value");

      // Lol. Must be a smarter way.
      const keyAndValueMatch =
        node.key.value === node.value?.name ||
        node.key.value === node.value?.base?.name ||
        node.key.value === node.value?.base?.base?.name ||
        node.key.value === node.value?.base?.base?.base?.name;

      return keyAndValueMatch
        ? path.call(print, "value")
        : concat([path.call(print, "key"), ": ", val]);

    case "ObjectConditionalSplat":
      return concat([
        path.call(print, "condition"),
        " ",
        "=>",
        " ",
        path.call(print, "value"),
      ]);

    case "Element":
      return concat([
        path.call(print, "base"),
        "[",
        path.call(print, "index"),
        "]",
      ]);

    case "ArrayElement":
      // @TODO: isSplat?
      return concat([path.call(print, "value")]);

    case "Value":
      if (typeof node.value === "number" || typeof node.value === "boolean") {
        return String(node.value);
      } else if (typeof node.value === "string") {
        return concat([`"`, `${node.value}`, `"`]);
      } else {
        log(node);
        throw new Error("unhandled");
      }

    case "Identifier":
      return node.name;

    case "Parent":
      return "^";

    case "Star":
      return "*";

    case "This":
      // Don't add `...@`, the `@` is inferred
      if (path.getParentNode().type === "ObjectSplat") {
        return "";
      }
      return "@";

    // case "Neg":
    // case "Pos":
    // case "Range":
    default:
      console.log("node fall through:", node.type);
      log(node);
      return "";
  }
};

const languages: SupportLanguage[] = [
  {
    name: "GROQ",
    extensions: [".groq"],
    parsers: ["groq-parse"],
  },
];

const parsers: Record<string, Parser> = {
  "groq-parse": {
    parse: (text: string) => parse(text),
    astFormat: "groq-ast",
  },
};

const printers: Record<string, Printer> = {
  "groq-ast": {
    print: printGroq,
  },
};

export { languages, parsers, printers };
