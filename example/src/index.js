'use-strict';
var jupyter_js_input_area_1 = require('jupyter-js-input-area');
var jupyter_js_output_area_1 = require('jupyter-js-output-area');
var jupyter_js_editor_1 = require('jupyter-js-editor');
var index_1 = require('../../lib/index');
require('../index.css');
var initialCode = "def f(n):\n    for mdInputArea in range(n):\n        print(mdInputArea)\n";
var initialMD = "\n# Heading 1\nThis is some text\n## Heading 2\n* some\n* list\n* of\n* **bold**, *emphasized* items\n";
function main() {
    var mdText = new jupyter_js_editor_1.EditorModel();
    mdText.text = initialMD;
    var mdInputArea = new jupyter_js_input_area_1.InputAreaModel();
    mdInputArea.textEditor = mdText;
    var mdCell = new index_1.MarkdownCellModel();
    mdCell.input = mdInputArea;
    var mdWidget = new index_1.MarkdownCellWidget(mdCell);
    mdWidget.attach(document.body);
    // Hook up markdown cell control buttons
    var mdedit = document.getElementById('editMarkdown');
    var mdrender = document.getElementById('renderMarkdown');
    mdedit.onclick = function () {
        mdWidget.editInput();
    };
    mdrender.onclick = function () {
        mdWidget.renderInput();
    };
    var codeText = new jupyter_js_editor_1.EditorModel();
    codeText.text = initialCode;
    codeText.mimetype = 'text/x-python';
    var codeInput = new jupyter_js_input_area_1.InputAreaModel();
    codeInput.textEditor = codeText;
    var codeOutput = new jupyter_js_output_area_1.OutputAreaModel();
    var codeCell = new index_1.CodeCellModel();
    codeCell.input = codeInput;
    codeCell.output = codeOutput;
    var codeWidget = new index_1.CodeCellWidget(codeCell);
    codeWidget.attach(document.body);
    // Populate the output of the code cell
    var data = require('../data/data.json');
    data.forEach(function (msg) {
        consumeMessage(msg, codeOutput);
    });
}
window.onload = main;
/**
  * A function to update an output area Model to reflect a stream of messages
  */
function consumeMessage(msg, outputArea) {
    var output = {};
    var content = msg.content;
    switch (msg.header.msg_type) {
        case 'clear_output':
            outputArea.clear(content.wait);
            break;
        case 'stream':
            output.outputType = jupyter_js_output_area_1.OutputType.Stream;
            output.text = content.text;
            switch (content.name) {
                case "stderr":
                    output.name = jupyter_js_output_area_1.StreamName.StdErr;
                    break;
                case "stdout":
                    output.name = jupyter_js_output_area_1.StreamName.StdOut;
                    break;
                default:
                    throw new Error("Unrecognized stream type " + content.name);
            }
            outputArea.add(output);
            break;
        case 'display_data':
            output.outputType = jupyter_js_output_area_1.OutputType.DisplayData;
            output.data = content.data;
            output.metadata = content.metadata;
            outputArea.add(output);
            break;
        case 'execute_result':
            output.outputType = jupyter_js_output_area_1.OutputType.ExecuteResult;
            output.data = content.data;
            output.metadata = content.metadata;
            output.execution_count = content.execution_count;
            outputArea.add(output);
            break;
        case 'error':
            output.outputType = jupyter_js_output_area_1.OutputType.Error;
            output.ename = content.ename;
            output.evalue = content.evalue;
            output.traceback = content.traceback.join('\n');
            outputArea.add(output);
            break;
        default:
            console.error('Unhandled message', msg);
    }
}
exports.consumeMessage = consumeMessage;
