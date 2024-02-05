import { ClassGraphField } from './class-graph-field';

export interface ClassGraph {
  [propName: string]: ClassGraphField;
}
