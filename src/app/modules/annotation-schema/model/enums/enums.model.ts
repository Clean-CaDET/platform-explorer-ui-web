import { CodeSmellDefinition } from "../code-smell-definition/code-smell-definition.model";

export enum SnippetType {
    Class = 'Class',
    Function = 'Function'
}

export function numberToSnippetType(codeSmellDefinition: CodeSmellDefinition): CodeSmellDefinition {
    if (codeSmellDefinition.snippetType == '0') codeSmellDefinition.snippetType = SnippetType.Class;
    else if (codeSmellDefinition.snippetType == '1') codeSmellDefinition.snippetType = SnippetType.Function;
    return codeSmellDefinition;
}
