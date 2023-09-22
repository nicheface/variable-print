/*
 * @Author: nicheface nicheface@outlook.com
 * @Date: 2023-09-15 14:29:41
 * @LastEditors: nicheface nicheface@outlook.com
 * @LastEditTime: 2023-09-21 14:46:21
 * @FilePath: \\variable-print\\src\\extension.ts
 */

import * as vscode from 'vscode';


function getCustomPrintStatement(languageId: string,id:number): string {
    const config = vscode.workspace.getConfiguration('variable-print');
    let key='';
    if (id===0){
        key='userCustomPrintStatements';
    }else if(id===1){
        key='customPrintStatements';
    }
    const customPrintStatements = config.get(key) as Record<string, string>;
    for (const key of Object.keys(customPrintStatements)) {
        const languages = key.split('|'); // 拆分用户或者默认定义的语言类型
        if (languages.includes(languageId)) {
            return customPrintStatements[key];
        }
    }
    return '';
}
function customSplit(input: string): string[] {
    const result: string[] = [];

    let currentLine = '';
    for (let i = 0; i < input.length; i++) {
        const char = input.charAt(i);

        if (char === '\n') {
            // 如果是换行符 "\n"，将当前行添加到结果数组中
            if (currentLine.length > 0) {
                result.push(currentLine);
            }
            result.push(char);
            currentLine = '';
        } else if (char === ',' || char === ' ' || char === '\t') {
            // 如果是逗号、空格或制表符，则将当前行添加到结果数组中
            if (currentLine.length > 0) {
                result.push(currentLine);
            }
            currentLine = '';
        } else if (char !== '\r') {
            // 如果不是回车符 "\r"，将字符添加到当前行
            currentLine += char;
        }
    }

    // 如果还有剩余的内容，将其添加到结果数组中
    if (currentLine.length > 0) {
        result.push(currentLine);
    }

    return result;
}

function insertCustomPrintStatement(editor: vscode.TextEditor) {
    const { selections } = editor;
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage('no active editor');
        return;
    }

    const { languageId } = editor.document;
    const userCustomPrintStatement = getCustomPrintStatement(languageId,0);
    let printvariableconfig=userCustomPrintStatement;
    if (!userCustomPrintStatement) {
        const customPrintStatement = getCustomPrintStatement(languageId,1);
        printvariableconfig=customPrintStatement;
        if (!customPrintStatement) {
            vscode.window.showErrorMessage(`No custom print statement found for language ${languageId}`);
            return;
        }
    }
    

    let total = 0;
    let temprow = 0;

    const workspaceEdit = new vscode.WorkspaceEdit();

    const selectionsArray = [...selections]; // 将 Selection 数组转换为普通数组
    const sortedSelections = selectionsArray.sort((a, b) => {
        return a.start.line - b.start.line;
    });
    for (let [i, selection] of sortedSelections.entries()) {
        const startLine = selection.start.line;
        const startCharacter = selection.start.character;
        const endLine = selection.end.line;
        const currentIndentation = editor.document.lineAt(startLine).text.match(/^\s*/)?.[0] || '';

        const selectedVariables = customSplit(editor.document.getText(selection));

        let insertLines: string = '';
        let pre = 0;
        let currentrow = startLine;
        let currentcol = startCharacter;

        let singleselectedrow = 0;
        if (selectedVariables.length === 0) {
            vscode.window.showErrorMessage(`found blank selection at line ${currentrow + total + 1}`);
            continue;
        }
        for (const selectedVariable of selectedVariables) {
            if (selectedVariable === '\n') {
                currentrow += 1;
                currentcol = currentIndentation.length;
                pre = 0;
                continue;
            }
            currentcol += pre;
            pre += selectedVariable.length;
            const printStatement = `${currentIndentation}${printvariableconfig
                .replace(/\$v/g, selectedVariable)
                .replace(/\$row/g, (currentrow + total + 1).toString())
                .replace(/\$col/g, (currentcol + 1).toString())}\n`;

            insertLines += printStatement;
            singleselectedrow += 1;

        }
        if (i !== sortedSelections.length - 1) {
            if (sortedSelections[i + 1].end.line === sortedSelections[i].end.line) {
                temprow += singleselectedrow;
            } else {
                total = total + temprow + singleselectedrow;
                temprow = 0;
            }
        }
        // 将编辑操作添加到 workspaceEdit 中
        const newPosition = new vscode.Position(endLine + 1, 0);
        if (endLine === editor.document.lineCount - 1) {
            workspaceEdit.insert(editor.document.uri, new vscode.Position(endLine + 1, 0), '\r');
        }
        workspaceEdit.insert(editor.document.uri, newPosition, insertLines);
    }
    vscode.workspace.applyEdit(workspaceEdit);
}

export function activate(context: vscode.ExtensionContext) {
    

    const userConfig = vscode.workspace.getConfiguration('variable-print');
    let userCustomPrintStatements = userConfig.get('userCustomPrintStatements') || {};
    if(!userCustomPrintStatements){
        // 更新用户配置
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userConfig.update('userCustomPrintStatements', {"":""}, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('user configuration has been reset.');
    }
    const disposable = vscode.commands.registerCommand('extension.printVariable', () => {
        // vscode.window.showInformationMessage(printtitle);
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectedText = editor.document.getText(editor.selection);
            if (selectedText) {
                insertCustomPrintStatement(editor);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }


