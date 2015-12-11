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
    ICodeCellViewModel, IMarkdownCellViewModel
} from './CellViewModel';

import {
    InputAreaWidget, IInputAreaViewModel
} from 'jupyter-js-input-area';

import {
    OutputAreaWidget, IOutputAreaViewModel
} from 'jupyter-js-output-area';

import * as marked from 'marked';

/**
 * A widget for a code cell.
 */
export
class CodeCellWidget extends Panel {

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
    this.children.assign([this.input, this.output]);

    this.output = new OutputAreaWidget(model.output);
    this.children.assign([this.input, this.output]);
    model.stateChanged.connect(this.modelStateChanged, this);
  }

  /**
   * Update the input area, creating a new input area
   * widget and detaching the old one.
   */
  updateInputArea(input: IInputAreaViewModel) {
    this.input = new InputAreaWidget(input);
    this.children.set(0, this.input);
  }
  
  /**
   * Update the output area, creating a new output area
   * widget and detaching the old one.
   */
  updateOutputArea(output: IOutputAreaViewModel) {
    this.output = new OutputAreaWidget(output);
    this.children.set(1, this.output);
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
  private _model: ICodeCellViewModel;
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
class MarkdownCellWidget extends Panel {

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
    this.children.assign([this.input]);
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
    this.children.set(0, this.rendered);
  }
  
  /**
   * Edit the Markdown source.
   * 
   * #### Notes
   * This will remove the rendered widget.  
   * Call [[renderInput]] to render the source.
   */
  editInput() {
    this.children.set(0, this.input);
  }

  /**
   * Update the input area, creating a new input area
   * widget and detaching the old one.
   */
  updateInputArea(input: IInputAreaViewModel) {
    this.input = new InputAreaWidget(input);
    if (this._model.rendered) {
      this.renderInput();
    } else {
      this.children.set(0, this.input);
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
  private _model: IMarkdownCellViewModel;
}
