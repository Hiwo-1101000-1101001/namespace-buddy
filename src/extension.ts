import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  // Trigger when a text document is opened
  vscode.workspace.onDidOpenTextDocument((document) => {
    // Automatically insert namespace for empty PHP files
    if (document.languageId === "php" && document.getText().length === 0) {
      insertNamespace(document);
    }
  });

  // Trigger when a text document is saved
  vscode.workspace.onDidSaveTextDocument((document) => {
    // Insert namespace if it is a PHP file without an existing namespace declaration
    if (
      document.languageId === "php" &&
      !document.getText().includes("namespace")
    ) {
      insertNamespace(document);
    }
  });
}

// Function to insert a namespace declaration at the top of the document
async function insertNamespace(document: vscode.TextDocument) {
  const filePath = document.fileName;

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    return; // Exit if the workspace folder is not found
  }

  const workspacePath = workspaceFolder.uri.fsPath;
  let namespacePath = path.relative(workspacePath, path.dirname(filePath));

  // Format the namespace path for PHP
  namespacePath = namespacePath.replace(new RegExp("\\" + path.sep, "g"), "\\");

  // Adjust the namespace path if it starts with 'src\'
  if (namespacePath.startsWith("src\\")) {
    namespacePath = namespacePath.substring(4);
  }

  const namespaceDeclaration = `<?php\n\nnamespace ${namespacePath};\n\n`;

  const edit = new vscode.WorkspaceEdit();
  const position = new vscode.Position(0, 0); // Position to insert the namespace at the top
  edit.insert(document.uri, position, namespaceDeclaration);
  await vscode.workspace.applyEdit(edit);
}

export function deactivate() {}
