// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';


import {
  IInputAreaViewModel
} from 'jupyter-js-input-area';
import {
  IOutputAreaViewModel
} from 'jupyter-js-output-area';

import {
  IObservableList
} from 'phosphor-observablelist';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';

//import './index.css';


/**
 * An enum which describes the type of cell.
 */
export
enum CellType {
  /**
   * The cell contains code input.
   */
  Code,

  /**
   * The cell contains markdown.
   */
  Markdown,

  /**
   * The cell contains raw text.
   */
  Raw
}


/**
 * An object which is serializable.
 */
export
interface ISerializable {
  toJSON(): any;
  fromJSON(data: any): void;
}


/**
 * The definition of a model object for a base cell.
 */
export
interface IBaseCellViewModel {

  /**
   * The type of cell.
   */
  type: CellType;

  /**
   * Tags applied to the cell.
   */
  tags?: IObservableList<string>;

  /**
   * A signal emitted when state of the cell changes.
   */
  stateChanged: ISignal<IBaseCellViewModel, IChangedArgs<any>>;

  /**
   * Get namespaced metadata about the cell.
   */
  //getMetadata(namespace: string) : IObservableMap<string, ISerializable>;

  /**
   * The input area of the cell.
   */
  input: IInputAreaViewModel;

  /**
   * Whether a cell is deletable.
   */
  //deleteable: boolean;

  /**
   * Whether a cell is mergable.
   */
  //mergeable: boolean;

  /**
   * Whether a cell is splittable.
   */
  //splittable: boolean;

  /**
   * Whether the cell is marked for applying commands
   */
  //marked: boolean;

  /**
   * Run the cell.
   * 
   * This basically means: do the right thing with the input.
   * Perhaps this should be in a subclass ExecutableCell.  Do we want to have a run() method on raw cells?
   */
  run(): void;


}


/**
 * The definition of a code cell.
 */
export
interface ICodeCellViewModel extends IBaseCellViewModel {
  output: IOutputAreaViewModel;
}


/**
 * The definition of a raw cell.
 */
export
interface IRawCellViewModel extends IBaseCellViewModel {

  /**
   * The raw cell format.
   */
  format?: string;
}


/**
 * The definition of a markdown cell.
 */
export
interface IMarkdownCellViewModel extends IBaseCellViewModel {
  /**
   * Whether a cell is rendered.
   */
  rendered: boolean;
}



/**
 * A model consisting of any valid cell type.
 */
export
type ICellViewModel =  (
  IRawCellViewModel | IMarkdownCellViewModel | ICodeCellViewModel
);


/**
 * An implemention of the base cell viewmodel.
 */
export
class BaseCellViewModel implements IBaseCellViewModel {

  /**
   * A signal emitted when the state of the model changes.
   *
   * **See also:** [[stateChanged]]
   */
  static stateChangedSignal = new Signal<IBaseCellViewModel, IChangedArgs<any>>();


  /**
   * A signal emitted when the state of the model changes.
   *
   * #### Notes
   * This is a pure delegate to the [[stateChangedSignal]].
   */
  get stateChanged(): ISignal<IBaseCellViewModel, IChangedArgs<any>> {
    return BaseCellViewModel.stateChangedSignal.bind(this);
  }

  /**
   * A property descriptor for the input area view model.
   *
   * **See also:** [[input]]
   */
  static inputProperty = new Property<IBaseCellViewModel, IInputAreaViewModel>({
    name: 'input',
    notify: BaseCellViewModel.stateChangedSignal,
  });

  /**
   * Get the input area view model.
   *
   * #### Notes
   * This is a pure delegate to the [[inputProperty]].
   */
  get input() {
    return BaseCellViewModel.inputProperty.get(this);
  }
  
  /**
   * Set the input area view model.
   *
   * #### Notes
   * This is a pure delegate to the [[inputProperty]].
   */
  set input(value: IInputAreaViewModel) {
    BaseCellViewModel.inputProperty.set(this, value);
  }

  /**
   * Run the cell
   */
  run(): void {
  }

  /**
   * The type of cell.
   */
  type: CellType;
}


/**
 * An implementation of a code cell viewmodel.
 */
export
class CodeCellViewModel extends BaseCellViewModel implements ICodeCellViewModel {

  /**
   * A signal emitted when the state of the model changes.
   *
   * **See also:** [[stateChanged]]
   */
  static executeRequestSignal = new Signal<ICodeCellViewModel, string>();


  /**
   * A signal emitted when the cell is requesting execution.
   * 
   * TODO: Do we need this execute signal?
   *
   * #### Notes
   * This is a pure delegate to the [[stateChangedSignal]].
   */
  get executeRequest() {
    return CodeCellViewModel.executeRequestSignal.bind(this);
  }

  /**
  * A property descriptor holding the output area view model.
  * 
  * TODO: Do we need this execute signal?
  * **See also:** [[output]]
  */
  static outputProperty = new Property<CodeCellViewModel, IOutputAreaViewModel>({
      name: 'output',
      notify: CodeCellViewModel.stateChangedSignal,
  });


  /**
   * Get the output area view model.
   *
   * #### Notes
   * This is a pure delegate to the [[outputProperty]].
   */
  get output() { 
      return CodeCellViewModel.outputProperty.get(this); 
  }
  
  /**
   * Set the output area view model.
   *
   * #### Notes
   * This is a pure delegate to the [[outputProperty]].
   */
  set output(value: IOutputAreaViewModel) {
      CodeCellViewModel.outputProperty.set(this, value);
  }

  /**
   * Run the cell
   */
  run(): void {
    this.executeRequest.emit(this.input.textEditor.text);
  }
  
  type: CellType = CellType.Code;
}


/**
 * An implementation of a Markdown cell viewmodel.
 */
export
class MarkdownCellViewModel extends BaseCellViewModel implements IMarkdownCellViewModel {

  /**
   * A property descriptor which determines whether the input area should be rendered.
   *
   * **See also:** [[rendered]]
   */
  static renderedProperty = new Property<MarkdownCellViewModel, boolean>({
    name: 'rendered',
    notify: MarkdownCellViewModel.stateChangedSignal,
  });

  /**
   * Get whether we should display a rendered representation.
   *
   * #### Notes
   * This is a pure delegate to the [[renderedProperty]].
   */
  get rendered() {
    return MarkdownCellViewModel.renderedProperty.get(this);
  }

  /**
   * Get whether we should display a rendered representation.
   *
   * #### Notes
   * This is a pure delegate to the [[renderedProperty]].
   */
  set rendered(value: boolean) {
    MarkdownCellViewModel.renderedProperty.set(this, value);
  }
  
  /**
   * A convenience method to render the cell.
   */
  run(): void {
    this.rendered = true;
  }
  
  type: CellType = CellType.Markdown;
}