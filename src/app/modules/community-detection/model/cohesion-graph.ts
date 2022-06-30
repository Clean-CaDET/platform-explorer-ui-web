import { CohesionGraphField } from './cohesion-graph-field';

export interface CohesionGraph {
  [propName: string]: CohesionGraphField;
}
