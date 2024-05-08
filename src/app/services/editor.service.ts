import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { editor } from 'monaco-editor';
import { Observable, lastValueFrom, map, take } from 'rxjs';
import { SettingsState } from '../state/store';
import { IApiEntity, IApiEntityProperty } from '../interfaces';
import { JsonSchema } from '../interfaces/json.schema';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import monaco from 'monaco-editor';

export type MonacoEditor = ReturnType<typeof editor.create>;
export type MonacoModelError = editor.IMarker;

export type MonacoEditorOptions = editor.IEditorOptions;

export enum SchemaSource {
  Static = 'static',
  ApiEntity = 'api_entity',
  External = 'external'
}

interface EditorType {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object' | 'null' | string;
  isArray: boolean;
  isReference: boolean;
}

export interface EntitySchema {
  name: string;
  schema: JsonSchema;
}

export interface SetMonacoModelOptions {
  source: SchemaSource;
  name: string;
  uri?: string;
  staticSchema?: JsonSchema;
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  constructor(private _store: Store, private commonService: CommonService, private http: HttpClient) {}

  getMonaco() {
    return (<any>window).monaco as typeof monaco;
  }

  getEditorOptions(options: MonacoEditorOptions = {}): Observable<MonacoEditorOptions> {
    return this._store.select<boolean>(SettingsState.GetProperty('dark_theme')).pipe(
      map((darkTheme) => {
        return {
          theme: darkTheme ? 'vs-dark' : 'vs-light',
          language: 'json',
          lineNumbers: 'off',
          readOnly: true,
          cursorBlinking: 'smooth',
          renderWhitespace: 'none',
          fontFamily: 'Roboto Mono',
          fontWeight: 500,
          minimap: {
            enabled: false
          },
          guides: {
            indentation: true
          },
          ...options
        } as MonacoEditorOptions;
      })
    );
  }

  async setMonacoEditorSchemas(options: SetMonacoModelOptions) {
    if (!options.source) {
      throw new Error('Source is required');
    }
    if (!options.name) {
      throw new Error('Name is required');
    }
    const monaco = this.getMonaco();
    if (monaco) {
      let schema = null;
      switch (options.source) {
        case SchemaSource.Static:
          throw new Error('Not implemented');
          break;
        case SchemaSource.ApiEntity:
          const jsonSchemas = await lastValueFrom(
            this.commonService.currentApi$.pipe(
              take(1),
              map((api) => api.jsonSchemas)
            )
          );
          const schemas = [...jsonSchemas];
          const schemaName = getSchemaName(options.source, options.name);
          const modelUri = monaco.Uri.parse(schemaName);
          const mainSchemaIndex = schemas.findIndex((schema) => schema.name === options.name);
          const mainSchema = schemas[mainSchemaIndex];
          schemas.splice(mainSchemaIndex, 1);
          schema = {
            validate: true,
            schemas: [
              {
                uri: getSchemaName(options.source, mainSchema.name),
                fileMatch: [modelUri.toString()],
                schema: mainSchema.schema
              },
              ...getUnknownSchemas(options.source),
              ...schemas.map((schema) => ({
                uri: getSchemaName(options.source, schema.name),
                schema: schema.schema
              }))
            ]
          };
          break;
        case SchemaSource.External:
          if (!options.uri) {
            throw new Error('Schema URI is required');
          }
          const jsonSchema = await lastValueFrom(this.http.get<JsonSchema>(options.uri));
          const uriParse = monaco.Uri.parse(getSchemaName(options.source, options.name));
          schema = {
            validate: true,
            schemas: [
              {
                uri: options.uri,
                fileMatch: [uriParse.toString()],
                schema: jsonSchema
              }
            ]
          };
          break;
      }

      if (schema) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(schema);
      }
    } else {
      throw new Error('Monaco not loaded');
    }
  }

  buildJsonSchemas(entities: IApiEntity[], server: string): EntitySchema[] {
    return entities.map((entity) => {
      const properties = entity.properties.map((prop) => ({
        key: prop.name,
        types: extractTypes(prop.type)
      }));
      const propertiesMap = properties.reduce((map, prop) => {
        if (prop.types.length > 0) {
          if (prop.types.length === 1) {
            map[prop.key] = typeToEditor(prop.types[0]);
          } else {
            map[prop.key] = {
              anyOf: typesToEditor(prop.types)
            };
          }
        }
        return map;
      }, {});
      return {
        name: entity.name,
        schema: {
          type: 'object',
          properties: propertiesMap,
          additionalProperties: false
        }
      } as EntitySchema;
    });
  }
}

function extractTypes(type: IApiEntityProperty['type']): EditorType[] {
  type = type.toString();
  const types = type.split('|') as string[];
  return types.map((type) => {
    let isArray = false;
    let isReference = false;
    if (type.endsWith('[]')) {
      isArray = true;
      type = type.slice(0, -2);
    }
    let newType = convertType(type);
    if (!newType) {
      // Unable to classify, must be a reference type
      newType = type;
      isReference = true;
    }
    return {
      type: newType,
      isArray,
      isReference
    };
  });
}

function convertType(type: string): EditorType['type'] {
  switch (type) {
    case 'int':
    case 'integer':
    case 'number':
      return 'integer';
    case 'string':
      return 'string';
    case 'null':
      return 'null';
    case 'bool':
    case 'boolean':
      return 'boolean';
    default:
      return null;
  }
}

function typeToEditor(type: EditorType): JsonSchema {
  if (type.isArray) {
    return {
      type: 'array',
      items: {
        type: type.type as JsonSchema['type']
      }
    };
  } else if (type.isReference) {
    return {
      $ref: getSchemaName(SchemaSource.ApiEntity, type.type)
    };
  } else {
    if (type.type === 'object') {
      return {
        type: type.type,
        additionalProperties: false
      };
    }
    // Primitives accept variables as string
    if (['integer', 'int', 'number', 'boolean', 'bool'].includes(type.type)) {
      return {
        oneOf: [
          {
            type: type.type as JsonSchema['type']
          },
          {
            type: 'string',
            pattern: `^{.+}$`,
            errorMessage: 'Invalid variable format'
          }
        ]
      };
    } else {
      return {
        type: type.type as JsonSchema['type']
      };
    }
  }
}

function typesToEditor(types: EditorType[]) {
  return types.map((type) => typeToEditor(type));
}

export function getSchemaName(schemaSource: SchemaSource, name: string) {
  switch (schemaSource) {
    case SchemaSource.ApiEntity:
      return `internal://api_entities/${name}`;
    case SchemaSource.External:
      return `external://${name}`;
    case SchemaSource.Static:
      return `internal://static/${name}`;
  }
}

export function InferSchemaSource(model: any): { source: SchemaSource; name: string } {
  switch (typeof model) {
    case 'string':
      if (model.startsWith('api_entity:') || model.split(':').length === 1) {
        return {
          source: SchemaSource.ApiEntity,
          name: model.replace('api_entity:', '')
        };
      }
      if (model.startsWith('external:')) {
        return {
          source: SchemaSource.External,
          name: model.replace('external:', '')
        };
      }
      break;
    case 'object':
      return {
        source: SchemaSource.Static,
        name: model
      };
    default:
      throw new Error('Cannot infer schema source for model: ' + model.toString());
  }
}

function getUnknownSchemas(source: SchemaSource): any[] {
  const forObjects = [
    'stdClass',
    'card_library_field_close_form_on_save',
    'card_library_field_medication',
    'consultation_item_card_changes_interpreted_result[int]'
  ];
  return [
    {
      uri: getSchemaName(source, 'mixed'),
      schema: {
        type: ['string', 'integer']
      } as JsonSchema
    },
    {
      uri: getSchemaName(source, 'array'),
      schema: {
        type: 'array'
      } as JsonSchema
    },
    {
      uri: getSchemaName(source, 'float'),
      schema: {
        type: 'number'
      } as JsonSchema
    },
    {
      uri: getSchemaName(source, 'boolean[int]'),
      schema: {
        type: 'boolean'
      } as JsonSchema
    },
    {
      uri: getSchemaName(source, 'card_library_field_enduser_can_view_historic'),
      schema: {
        type: 'boolean'
      } as JsonSchema
    },
    {
      uri: getSchemaName(source, 'consultation_item_card_changes_title[int]'),
      schema: {
        type: 'string'
      } as JsonSchema
    },
    ...forObjects.map((name) => ({
      uri: getSchemaName(source, name),
      schema: {
        type: 'object'
      } as JsonSchema
    }))
  ];
}
