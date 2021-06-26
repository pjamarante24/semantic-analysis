const fs = require("fs");
const path = require("path");
const esprima = require("esprima");
const { Semantic } = require("./semantic");

const start = () => {
  const program = fs.readFileSync(path.resolve(__dirname, "./code.js"), {
    encoding: "utf-8",
  });

  const tree = esprima.parseScript(program);
  const semantic = new Semantic(tree);
  semantic.analyze(tree);

  console.table(semantic.symbolTable);
  console.log(JSON.stringify(tree, null, 2));
};

start();
