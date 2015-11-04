// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use-strict';

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
  Widget
} from 'phosphor-widget';

import './index.css';


/**
 * An enum which describes the type of cell.
 */
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
 * An enum which describes which interface property has changed.
 */
export
enum CellProperty {
  CellType,
  Tags,
  Deletable,
  Mergable,
  Splittable,
  Rendered,
  Marked,
  Format
}


/**
 * The arguments object emitted with the `stateChanged` signal.
 */
export
interface ICellChangedArgs<T> {
  which: CellProperty,
  oldValue: T;
  newValue: T;
}


/**
 * The definition of a model object for a base cell.
 */
interface IBaseCellViewModel {

  /**
   * The type of cell.
   */
  cellType: CellType;

  /**
   * Tags applied to the cell.
   */
  tags?: IObservableList<string>;

  /**
   * Get namespaced metadata about the cell.
   */
  getMetadata(namespace: string) : IObservableMap<string, JSONData>;

  /**
   * The input area of the cell.
   */
  input: IInputAreaViewModel;

  /**
   * Whether a cell is deletable.
   */
  deleteable: boolean;

  /**
   * Whether a cell is mergable.
   */
  mergeable: boolean;

  /**
   * Whether a cell is splittable.
   */
  splittable: boolean;

  /**
   * Whether a cell is rendered.
   */
  rendered: boolean;

  /**
   * Whether the cell is marked for applying commands
   */
  marked: boolean;

  /**
   * Run the cell.
   */
  run(): void;
}


/**
 * The definition of a code cell.
 */
export
interface ICodeCellViewModel extends IBaseCellViewModel {

  /**
   * A signal emitted when state of the cell changes.
   */
  stateChanged: ISignal<ICodeCellViewModel, ICellChangedArgs<any>>;

  output: IOutputAreaViewModel;
}


/**
 * The definition of a raw cell.
 */
export 
interface IRawCellViewModel extends IBaseCellViewModel {

  /**
   * A signal emitted when state of the cell changes.
   */
  stateChanged: ISignal<IRawCellViewModel, ICellChangedArgs<any>>;

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
   * A signal emitted when state of the cell changes.
   */
  stateChanged: ISignal<IMarkdownCellViewModel, ICellChangedArgs<any>>;
}



/**
 * A model consisting of any valid cell type.
 */
export 
type ICellViewModel =  (
  IRawCellViewModel | IMarkdownCellViewModel | ICodeCellViewModel
);
