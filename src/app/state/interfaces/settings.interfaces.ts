export interface ISettingsState {
  /* Select environment Name in the side menu */
  selected_environment?: string;
  /* Used to store multiple XHR results, not used yet */
  results_history?: boolean;
  dark_theme?: boolean;
}
