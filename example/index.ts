'use-strict';

import {
  Widget
} from 'phosphor-widget';

import {InputAreaViewModel} from 'jupyter-js-input-area';
import {
  OutputAreaViewModel, OutputAreaWidget, IOutputAreaViewModel,
  OutputType, StreamName
} from 'jupyter-js-output-area';
import {TextEditorViewModel} from 'jupyter-js-input-area';


import {
  CodeCellWidget, CodeCellViewModel, 
  MarkdownCellViewModel, MarkdownCellWidget
} from '../lib/index';

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
  let mdText = new TextEditorViewModel();
  mdText.text = initialMD;
  let mdInputArea = new InputAreaViewModel();
  mdInputArea.textEditor = mdText;
  let mdCell = new MarkdownCellViewModel();
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

  let codeText = new TextEditorViewModel();
  codeText.text = initialCode;
  codeText.mimetype = 'text/x-python';
  let codeInput = new InputAreaViewModel();
  codeInput.textEditor = codeText;
  let codeOutput = new OutputAreaViewModel();
  let codeCell = new CodeCellViewModel();
  codeCell.input = codeInput;
  codeCell.output = codeOutput;  
  let codeWidget = new CodeCellWidget(codeCell);
  codeWidget.attach(document.body);
  
  // Populate the output of the code cell
  System.import('example/data/data.json').then((data: any[]) => {
    data.forEach((msg) => {
      consumeMessage(msg, codeOutput);
    })
  })
}

main();

/**
  * A function to update an output area viewmodel to reflect a stream of messages 
  */
export
function consumeMessage(msg: any, outputArea: IOutputAreaViewModel): void {
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
