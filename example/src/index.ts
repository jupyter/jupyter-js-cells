'use-strict';

import {
  Widget
} from 'phosphor-widget';

import {InputAreaModel} from 'jupyter-js-input-area';
import {
  OutputAreaModel, OutputAreaWidget, IOutputAreaModel,
  OutputType, StreamName
} from 'jupyter-js-output-area';
import {EditorModel} from 'jupyter-js-editor';

import {
  CodeCellWidget, CodeCellModel,
  MarkdownCellModel, MarkdownCellWidget
} from '../../lib/index';

import '../index.css';

let initialCode = `def f(n):
    for mdInputArea in range(n):
        print(mdInputArea)
`;

let initialMD = `
# Heading 1
This is some text
## Heading 2
* some
* list
* of
* **bold**, *emphasized* items
`;

function main(): void {
  let mdText = new EditorModel();
  mdText.text = initialMD;
  let mdInputArea = new InputAreaModel();
  mdInputArea.textEditor = mdText;
  let mdCell = new MarkdownCellModel();
  mdCell.input = mdInputArea;
  let mdWidget = new MarkdownCellWidget(mdCell);
  mdWidget.attach(document.body);

  // Hook up markdown cell control buttons
  let mdedit = document.getElementById('editMarkdown');
  let mdrender = document.getElementById('renderMarkdown');
  mdedit.onclick = () => {
    mdWidget.editInput()
  };
  mdrender.onclick = () => {
    mdWidget.renderInput()
  };

  let codeText = new EditorModel();
  codeText.text = initialCode;
  codeText.mimetype = 'text/x-python';
  let codeInput = new InputAreaModel();
  codeInput.textEditor = codeText;
  let codeOutput = new OutputAreaModel();
  let codeCell = new CodeCellModel();
  codeCell.input = codeInput;
  codeCell.output = codeOutput;
  let codeWidget = new CodeCellWidget(codeCell);
  codeWidget.attach(document.body);

  // Populate the output of the code cell
  let data = require('../data/data.json');
  data.forEach((msg: any) => {
    consumeMessage(msg, codeOutput);
  })
}

window.onload = main;

/**
  * A function to update an output area Model to reflect a stream of messages
  */
export
function consumeMessage(msg: any, outputArea: IOutputAreaModel): void {
    let output: any = {};
    let content = msg.content;
    switch (msg.header.msg_type) {
    case 'clear_output':
      outputArea.clear(content.wait)
      break;
    case 'stream':
      output.outputType = OutputType.Stream;
      output.text = content.text;
      switch(content.name) {
      case "stderr":
        output.name = StreamName.StdErr;
        break;
      case "stdout":
        output.name = StreamName.StdOut;
        break;
      default:
        throw new Error(`Unrecognized stream type ${content.name}`);
      }
      outputArea.add(output);
      break;
    case 'display_data':
      output.outputType = OutputType.DisplayData;
      output.data = content.data;
      output.metadata = content.metadata;
      outputArea.add(output);
      break;
    case 'execute_result':
      output.outputType = OutputType.ExecuteResult;
      output.data = content.data;
      output.metadata = content.metadata;
      output.execution_count = content.execution_count;
      outputArea.add(output);
      break;
    case 'error':
      output.outputType = OutputType.Error;
      output.ename = content.ename;
      output.evalue = content.evalue;
      output.traceback = content.traceback.join('\n');
      outputArea.add(output);
      break;
    default:
      console.error('Unhandled message', msg);
    }
}
