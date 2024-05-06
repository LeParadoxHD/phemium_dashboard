export interface JsonSchema {
  /** Type of data */
  type: 'string' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  /** Maximum number of items in Array */
  maxItems?: number;
  /** Minimum number of items in Array */
  minItems?: number;
  /** Maximum number */
  minimum?: number;
  /** Minimum number */
  maximum?: number;
  /** Include maximum number, by default is False */
  exclusiveMinimum?: boolean;
  /** Include minimum number, by default is False */
  exclusiveMaximum?: boolean;
  /** Properties to define when type is object */
  properties?: Record<string, JsonSchema>;
  /** Any item in array must satisfy this schema */
  anyOf?: JsonSchema[];
  /** All items in array must satisfy this schema */
  allOf?: JsonSchema[];
  /** At least one item in array must satisfy this schema */
  oneOf?: JsonSchema[];
  /** Schema must not satisfy this */
  not?: JsonSchema;
  /** Value must be multiple of this, when type is integer */
  multipleOf?: boolean;
  /** Specify required properties within type object */
  required?: string[];
  /** Schema of array items */
  items?: JsonSchema;
  /** Whether or not array items must be unique */
  uniqueItems?: boolean;
  /** Regex pattern of string types */
  pattern?: string;
}
