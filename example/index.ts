'use-strict';

import {
  Widget
} from 'phosphor-widget';

import {InputAreaViewModel} from 'jupyter-js-input-area';
import {OutputAreaViewModel, consumeMessage} from 'jupyter-js-output-area';
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
  Widget.attach(mdWidget, document.body);
  
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
  Widget.attach(codeWidget, document.body);
  
  // Populate the output of the code cell
  System.import('example/data/data.json').then((data: any[]) => {
    data.forEach((msg) => {
      consumeMessage(msg, codeOutput);
    })
  })
}

main();
