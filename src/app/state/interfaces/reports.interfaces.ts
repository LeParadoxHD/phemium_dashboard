import { Environmented } from './common.interfaces';

export interface IDocument {
  content: string;
  external_id: string;
  id: number;
  document_pattern_name: string;
  name: string;
}

export interface IReportsStateData {
  /**
   * Available documents of the current Server and Client
   */
  documents: IDocument[];
  /**
   * Currently selected document
   */
  selected_document?: IDocument['id'];
  /**
   * Whether or not the editor is in Testing Mode
   */
  testing_mode: boolean;
  /**
   * Temporal document to be used in Testing Mode,
   * cloned from the selected document
   */
  testing_document?: IDocument['id'];
  /**
   * Whether or not the App is loading the reports
   */
  loading: boolean;
  /**
   * Whether or not the App is saving the current report
   */
  saving: boolean;
  /**
   * Whether or not the App is saving the current report (permanently)
   */
  saving_document: boolean;
  /**
   * Whether or not the App is loading the preview of the current (termporal) report
   */
  loading_preview: boolean;
}

export type IReportsState = Environmented<IReportsStateData>;
