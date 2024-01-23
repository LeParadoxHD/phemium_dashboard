import { IView } from 'src/app/interfaces';

export interface IViewState {
  tabs: IView[];
  selectedTabIndex: number;
}
