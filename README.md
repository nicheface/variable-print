<!--
 * @Author: gyg nicheface@outlook.com
 * @Date: 2023-09-15 14:29:41
 * @LastEditors: gyg nicheface@outlook.com
 * @LastEditTime: 2023-09-15 23:14:05
 * @FilePath: \\variable-print\\README.md
-->
# variable-print README 中文

变量打印，自定义任意语言的变量打印，可以在扩展设置里面自定义修改

## 使用说明

选中要打印的变量，按快捷键或者输入命令

win,mac 快捷键 `ctrl+alt+p`
`ctrl+shift+p`的命令是`Print Selected Variable`

支持一行内多变量(逗号或者空格隔开)打印，支持多行多变量打印，不支持ctrl多选

## 效果

在选中变量下一行生成文件对应配置的打印语句，多个变量就生成多行。

## 配置

打印语句支持修改

```json
//$v代表当前变量(多个变量自动拆分)，$row代表当前行，$col代表当前列,支持多个后缀使用同种配置 h|c|cpp
    "default": {
        "rust": "println!(\"row: $row - col: $col $v -> {}\", &$v);",
        "go": "fmt.Println(\"row: $row - col: $col $v -> {}\", $v);",
        "h|c|cpp":"printf(\"row: $row - col: $col $v -> %s\", $v)"
    }
```

## 更新日志

* 2023-09-15 1.0.0 初始版本
可以自定义打印格式，在扩展设置里修改，支持 c|cpp|h 多个后缀名使用同种打印配置

## github

<https://github.com/nicheface/variable-print.git>

**Enjoy!**

Variable Print, customize variable printing for any programming language with the ability to modify settings in the extension.

english

## Usage Instructions

Select the variables you want to print and press the keyboard shortcut or enter the command:

  - Keyboard Shortcut for Windows and macOS: `ctrl+alt+p`
  - Command in the Command Palette: `Print Selected Variable`

Supports printing multiple variables in a single line (separated by commas or spaces) and printing multiple variables across multiple lines. Note that multi-selection with Ctrl is not supported.

## Effects

Generates printing statements based on the configured format below the selected variables, creating multiple lines for multiple variables.

## Configuration

You can customize the printing statements in the extension settings. Use the following placeholders:

  - `$v` represents the current variable (multiple variables are automatically split).
  - `$row` represents the current line.
  - `$col` represents the current column.
  - Supports multiple file extensions using the same configuration (e.g., h|c|cpp).

Example configuration:

```json

"default": {
    "rust": "println!(\"row: $row - col: $col $v -> {}\", &$v);",
    "go": "fmt.Println(\"row: $row - col: $col $v -> {}\", $v);",
    "h|c|cpp": "printf(\"row: $row - col: $col $v -> %s\", $v)"
}
```

## Changelog

  - 2023-09-15 1.0.0 Initial release
Customize printing formats in extension settings, supporting multiple file extensions such as c|cpp|h with the same printing configuration.

## GitHub

<https://github.com/nicheface/variable-print.git>

Enjoy!