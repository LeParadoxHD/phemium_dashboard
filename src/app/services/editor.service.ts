import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { editor } from 'monaco-editor';
import { Observable, lastValueFrom, map, take } from 'rxjs';
import { SettingsState } from '../state/store';
import { IApiEntity, IApiEntityProperty } from '../interfaces';
import { JsonSchema } from '../interfaces/json.schema';
import { CommonService } from './common.service';

export type MonacoEditorOptions = editor.IEditorOptions;

interface EditorType {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object' | 'null' | string;
  isArray: boolean;
  isReference: boolean;
}

export interface EntitySchema {
  name: string;
  schema: JsonSchema;
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  constructor(private _store: Store, private commonService: CommonService) {}

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

  async setMonacoEditorSchemas(name: string) {
    const monaco = (window as any).monaco;
    if (monaco) {
      const jsonSchemas = await lastValueFrom(
        this.commonService.currentApi$.pipe(
          take(1),
          map((api) => api.jsonSchemas)
        )
      );
      const schemas = [...jsonSchemas];
      const schemaName = getSchemaName(name);
      const modelUri = monaco.Uri.parse(schemaName);
      const mainSchemaIndex = schemas.findIndex((schema) => schema.name === name);
      const mainSchema = schemas[mainSchemaIndex];
      schemas.splice(mainSchemaIndex, 1);
      const jsonDiagnostics = {
        validate: true,
        schemas: [
          {
            uri: getSchemaName(mainSchema.name),
            fileMatch: [modelUri.toString()],
            schema: mainSchema.schema
          },
          ...schemas.map((schema) => ({
            uri: getSchemaName(schema.name),
            schema: schema.schema
          }))
        ]
      };
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
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
          properties: propertiesMap
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

function typeToEditor(type: EditorType) {
  if (type.isArray) {
    return {
      type: 'array',
      items: {
        type: type.type
      }
    };
  } else if (type.isReference) {
    return {
      $ref: getSchemaName(type.type)
    };
  } else {
    return {
      type: type.type
    };
  }
}

function typesToEditor(types: EditorType[]) {
  return types.map((type) => typeToEditor(type));
}

export function getSchemaName(name: string) {
  return `internal://api_entities/${name}`;
}
