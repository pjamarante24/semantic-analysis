const { Syntax } = require("esprima");

class Semantic {
  constructor(syntaxTree) {
    this.tree = syntaxTree;
    this.symbolTable = [];
  }

  getIdentifier(statement) {
    return this.symbolTable.find(
      ({ identifier }) => statement.name === identifier
    );
  }

  isIdentifierDeclared(statement) {
    return !!this.getIdentifier(statement);
  }

  addToSymbolTable(statement) {
    statement.declarations.forEach((declaration) => {
      if (this.isIdentifierDeclared(declaration.id)) {
        throw new Error(
          `Variable '${declaration.id.name}' is already defined.`
        );
      }

      this.symbolTable.push({
        identifier: declaration.id.name,
        scope: "program", // TODO:
        kind: statement.kind,
      });

      if (
        [Syntax.BinaryExpression, Syntax.Identifier].includes(
          declaration.init.type
        )
      ) {
        this.scan(declaration.init);
      }
    });
  }

  verifyExpression(statement) {
    if (statement.left) this.scan(statement.left);
    if (statement.right) this.scan(statement.right);

    if (statement.type === Syntax.AssignmentExpression) {
      const identifier = this.getIdentifier(statement.left);
      if (identifier.kind === "const") {
        throw new Error(`Can't re-assing constant ${statement.left.name} `);
      }
    }
  }

  verifyIdentifier(statement) {
    if (!this.isIdentifierDeclared(statement)) {
      throw new Error(`Variable '${statement.name}' not defined.`);
    }
  }

  scan(statement) {
    switch (statement.type) {
      case Syntax.VariableDeclaration:
        this.addToSymbolTable(statement);
        break;

      case Syntax.ExpressionStatement:
        this.verifyExpression(statement.expression);
        break;

      case Syntax.BinaryExpression:
        this.verifyExpression(statement);
        break;

      case Syntax.Identifier:
        this.verifyIdentifier(statement);
        break;

      default:
        break;
    }
  }

  analyze() {
    this.tree.body.forEach((statement) => this.scan(statement));
  }
}

module.exports = { Semantic };
