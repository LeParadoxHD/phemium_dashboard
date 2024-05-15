import { Injectable, signal } from '@angular/core';

export interface ISetting {
  name: string;
  description: string;
  group: string;
  category: string;
  type: 'boolean' | 'integer' | 'string';
  handler: any;
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  settings = signal<ISetting[]>([
    {
      name: 'Enable IntelliSense',
      description:
        'Allows to enable or disable IntelliSense for all Code editors.<br>IntelliSense is a feature powered by the Phemium API that allows to provide objects completion and validation.',
      group: 'CodeEditor',
      category: 'intellisense',
      type: 'boolean',
      handler: null
    }
  ]);
}
