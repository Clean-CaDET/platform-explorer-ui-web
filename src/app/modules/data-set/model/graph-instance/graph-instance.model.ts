import { GraphRelatedInstance } from "../graph-related-instance/graph-related-instance.model";


export class GraphInstance {
    id: number = 0;
    codeSnippetId: string = '';
    relatedInstances: GraphRelatedInstance[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            if (obj.relatedInstances)this.relatedInstances = obj.relatedInstances.map((i: any) => new GraphRelatedInstance(i))
        }
    }
}
