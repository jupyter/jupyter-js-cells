// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  Widget, Panel
} from 'phosphor-widget';

import {
    ICodeCellViewModel, IMarkdownCellViewModel, ICellViewModel
} from './CellViewModel';

import {
    InputAreaWidget, IInputAreaViewModel
} from 'jupyter-js-input-area';

import {
    OutputAreaWidget, IOutputAreaViewModel
} from 'jupyter-js-output-area';

import * as marked from 'marked';

export
class CellWidget extends Panel {
  constructor() {
    super();
    // we make the cell focusable by setting the tabIndex
    this.node.tabIndex = -1;
  }
  
  protected _model: ICellViewModel;
  
}


/**
 * A widget for a code cell.
 */
export
class CodeCellWidget extends CellWidget {

  /**
   * Construct a code cell widget.
   */
  constructor(model: ICodeCellViewModel) {
    super();
    this.addClass('jp-Cell');
    this.addClass('jp-CodeCell');
    this._model = model;
    this.input = new InputAreaWidget(model.input);
    this.output = new OutputAreaWidget(model.output);
    this.addChild(this.input);
    this.addChild(this.output);
    model.stateChanged.connect(this.modelStateChanged, this);
  }

  /**
   * Update the input area, creating a new input area
   * widget and detaching the old one.
   */
  updateInputArea(input: IInputAreaViewModel) {
    this.input.dispose(); // removes from children
    this.input = new InputAreaWidget(input);
    this.insertChild(0, this.input);
  }
  
  /**
   * Update the output area, creating a new output area
   * widget and detaching the old one.
   */
  updateOutputArea(output: IOutputAreaViewModel) {
    this.output.dispose();
    this.output = new OutputAreaWidget(output);
    this.insertChild(1, this.output);
  }

  /**
   * Change handler for model updates.
   */
  protected modelStateChanged(sender: ICodeCellViewModel, args: IChangedArgs<any>) {
    switch(args.name) {
    case 'input':
      this.updateInputArea(args.newValue);
      break;
    case 'output':
      this.updateOutputArea(args.newValue);
      break;
    }
  }

  protected input: InputAreaWidget;
  protected output: OutputAreaWidget;
  protected _model: ICodeCellViewModel;
}


/**
 * A widget for a Markdown cell.
 * 
 * #### Notes
 * Things get complicated if we want the rendered text to update
 * any time the text changes, the text editor model changes, 
 * or the input area model changes.  We don't support automatically 
 * updating the rendered text in all of these cases.
 */
export
class MarkdownCellWidget extends CellWidget {

  /**
   * Construct a Markdown cell widget.
   */
  constructor(model: IMarkdownCellViewModel) {
    super();
    this.addClass('jp-Cell');
    this.addClass('jp-MarkdownCell');

    this._model = model;
    // Insist on the Github-flavored markdown mode
    model.input.textEditor.mimetype = 'text/x-gfm';
    this.input = new InputAreaWidget(model.input);
    this.rendered = new Widget();
    if (model.rendered) {
      this.renderInput();
    } else {
      this.editInput();
    }
    model.stateChanged.connect(this.modelStateChanged, this);
  }

  /**
   * Process the input and display the rendered Markdown.
   * 
   * #### Notes
   * This will remove the input widget.  
   * Call [[editInput]] to restore the editor.
   */
  renderInput() {
    this.rendered.node.innerHTML = marked(this._model.input.textEditor.text);
    this.input.parent = null;
    this.addChild(this.rendered);
  }
  
  /**
   * Edit the Markdown source.
   * 
   * #### Notes
   * This will remove the rendered widget.  
   * Call [[renderInput]] to render the source.
   */
  editInput() {
    this.rendered.parent = null;
    this.addChild(this.input);
  }

  /**
   * Update the input area, creating a new input area
   * widget and detaching the old one.
   */
  updateInputArea(input: IInputAreaViewModel) {
    this.input.dispose();
    this.input = new InputAreaWidget(input);
    if (this._model.rendered) {
      this.renderInput();
    } else {
      this.editInput();
    }
  }
  
  /**
   * Change handler for model updates.
   */
  protected modelStateChanged(sender: IMarkdownCellViewModel, args: IChangedArgs<any>) {
    switch(args.name) {
    case 'input':
      this.updateInputArea(args.newValue);
      break;
    }
  }

  protected input: InputAreaWidget;
  protected rendered: Widget;
  protected _model: IMarkdownCellViewModel;
}
