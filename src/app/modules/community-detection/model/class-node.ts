import { ClassNodeType } from './class-node-type';

export interface ClassNode {
  id: string;
  fullName: string;
  type: ClassNodeType;
  group: number;
}
