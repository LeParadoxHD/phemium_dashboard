import { AfterViewInit, Component, ElementRef, ViewContainerRef } from '@angular/core';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements AfterViewInit {
  constructor(private elementRef: ElementRef, private editorService: EditorService) {}

  ngAfterViewInit() {
    const monaco = this.editorService.getMonaco();
    var jsonCode = '[]';
    var modelUri = monaco.Uri.parse('external://workflow-rules'); // a made up unique URI for our model
    var model = monaco.editor.getModel(modelUri) || monaco.editor.createModel(jsonCode, 'json', modelUri);
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://myserver/foo-schema.json', // id of the first schema
          fileMatch: [modelUri.toString()], // associate with our model
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'array',
            items: [
              {
                type: 'object',
                properties: {
                  description: {
                    type: 'string'
                  },
                  action: {
                    type: 'string',
                    pattern: '^((\\w+)__(\\w+)|[a-zA-Z0-9_]+(?:\\.[a-zA-Z0-9_]+)+)$'
                  },
                  load: {
                    type: 'object',
                    additionalProperties: {
                      type: 'string',
                      properties: {
                        api: {
                          type: 'string'
                        },
                        method: {
                          type: 'string'
                        },
                        parameters: {
                          type: 'array',
                          anyOf: [
                            {
                              type: 'string'
                            },
                            {
                              type: 'integer'
                            },
                            {
                              type: 'boolean'
                            }
                          ]
                        }
                      },
                      required: ['api', 'method']
                    }
                  },
                  set: {
                    type: 'object',
                    additionalProperties: {
                      type: 'string',
                      anyOf: [
                        {
                          type: 'integer'
                        },
                        {
                          type: 'string'
                        },
                        {
                          type: 'boolean'
                        }
                      ]
                    }
                  },
                  where: {
                    type: 'object',
                    additionalProperties: {
                      type: 'string',
                      anyOf: [
                        {
                          type: 'integer'
                        },
                        {
                          type: 'string'
                        },
                        {
                          type: 'boolean'
                        }
                      ]
                    }
                  },
                  do: {
                    type: 'array',
                    items: [
                      {
                        type: 'object',
                        properties: {
                          api: {
                            type: 'string'
                          },
                          method: {
                            type: 'string'
                          },
                          parameters: {
                            type: 'array',
                            items: [
                              {
                                type: 'string'
                              },
                              {
                                type: 'object'
                              },
                              {
                                type: 'integer'
                              }
                            ]
                          }
                        },
                        required: ['api', 'method'],
                        additionalItems: false
                      }
                    ]
                  }
                },
                required: ['action'],
                additionalProperties: false
              }
            ]
          }
        }
      ]
    });
    const _editor = monaco.editor.create(this.elementRef.nativeElement, {
      model
    });
    _editor.layout({ width: 800, height: 1000 });
  }
}
