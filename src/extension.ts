/*
 * @Author: gyg nicheface@outlook.com
 * @Date: 2023-09-15 14:29:41
 * @LastEditors: gyg nicheface@outlook.com
 * @LastEditTime: 2023-09-15 22:52:26
 * @FilePath: \\variable-print\\src\\extension.ts
 */
import * as vscode from 'vscode';

function getCustomPrintStatement(languageId: string): string {
    const config = vscode.workspace.getConfiguration('variable-print');
    const customPrintStatements = config.get('customPrintStatements') as Record<string, string>;
	for (const key of Object.keys(customPrintStatements)) {
        const languages = key.split('|'); // 拆分用户定义的语言类型
        if (languages.includes(languageId)) {
            return customPrintStatements[key];
        }
    }

    return '';
}
function getLastSelectedLineNumber(editor: vscode.TextEditor): number | undefined {
    const {selections} = editor;
    if (selections.length > 0) {
        const lastSelection = selections[selections.length - 1];
        return lastSelection.end.line;
    }
    return undefined; // 没有选中的范围
}
function insertCustomPrintStatement(editor: vscode.TextEditor, selectedText: string) {
    const currentLineNumber = editor.selection.active.line;
    const currentLine = editor.document.lineAt(currentLineNumber);
    const currentIndentation = currentLine.text.match(/^\s*/)?.[0] || '';
    //const newPosition = new vscode.Position(currentLineNumber + 1, 0);
	const currentPosition = editor.selection.active; // 获取当前光标位置
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage('No active text editor found.');
        return;
    }

    const {languageId} = activeEditor.document;
    const customPrintStatement = getCustomPrintStatement(languageId); // 获取用户自定义的打印语句

    if (!customPrintStatement) {
        vscode.window.showErrorMessage(`No custom print statement found for language ${languageId}`);
        return;
    }
    // 根据分隔符拆分用户选择的变量，仅匹配有效的变量
    const selectedVariables = selectedText.split(/[;,]+|\s+/).filter(variable => variable.trim() !== '');
	if (selectedVariables.length === 0) {
        vscode.window.showWarningMessage('No variables selected.');
        return;
    }
	const lastlinenumber=getLastSelectedLineNumber(editor);
    console.log(selectedVariables);
    console.log(lastlinenumber);
	if(lastlinenumber!==undefined){
        const insertLines: string[] = [];

        // 遍历用户选择的变量，并替换到打印语句中
        for (const selectedVariable of selectedVariables) {
            // 使用正则表达式进行全局替换
            const printStatement = `${currentIndentation}${customPrintStatement
                .replace(/\$v/g, selectedVariable) // 插入用户选择的变量
                .replace(/\$row/g, (lastlinenumber + 1).toString()) // 插入当前行号
                .replace(/\$col/g, (currentPosition.character + 1).toString())}\n`;
        
            insertLines.push(printStatement);
        }
    
        editor.edit((editBuilder) => {
            const newPosition = new vscode.Position(lastlinenumber + 1, 0);
            if (lastlinenumber === editor.document.lineCount - 1) {
                // 如果当前行是文件的最后一行，则插入一个空行后再插入多个打印语句
                editBuilder.insert(newPosition, '\n' + insertLines.join(''));
            } else {
                // 否则，直接插入多个打印语句
                editBuilder.insert(newPosition, insertLines.join(''));
            }
        });
	}

}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.printVariable', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectedText = editor.document.getText(editor.selection);
            if (selectedText) {
                insertCustomPrintStatement(editor, selectedText);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}


