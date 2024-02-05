import { CodeSmell } from "src/app/modules/data-set/model/code-smell/code-smell.model";
import { CodeSmellDefinition } from "../code-smell-definition/code-smell-definition.model";

export enum SnippetType {
    Class = 'Class',
    Function = 'Function'
}

export function numberToSnippetType(codeSmell: any): any {
    if (codeSmell.snippetType == '0') codeSmell.snippetType = SnippetType.Class;
    else if (codeSmell.snippetType == '1') codeSmell.snippetType = SnippetType.Function;
    return codeSmell;
}
