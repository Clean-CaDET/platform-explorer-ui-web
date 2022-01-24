import { AnnotationService } from "../../annotation/annotation.service";
import { Annotation } from "../annotation/annotation.model"; 
import { InstanceType } from "../enums/enums.model";
import { RelatedInstance } from "../related-instance/related-instance.model";

export class Instance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    projectLink: string = '';
    type: InstanceType = InstanceType.Method;
    annotations: Annotation[] = [];
    metricFeatures: Map<string, number> = new Map();
    hasAnnotationFromLoggedUser: boolean = false;
    annotationFromLoggedUser: Annotation | null = null;
    relatedInstances: RelatedInstance[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.codeSnippetId = obj.codeSnippetId;
            this.link = obj.link;
            this.projectLink = obj.projectLink;
            this.annotations = obj.annotations;
            this.setMetricFeatures(obj.metricFeatures);
            this.setType(obj.type);
            this.setAnnotationFromLoggedUser();
            if (obj.relatedInstances)this.relatedInstances = obj.relatedInstances.map((i: any) => new RelatedInstance(i))
        }
    }

    private setMetricFeatures(metricFeatures: Map<string, number>): void {
        for (let keyValue of Object.entries(metricFeatures)) {
            this.metricFeatures.set(keyValue[0], keyValue[1]);
        }
    }

    private setAnnotationFromLoggedUser(annotatorId: number = AnnotationService.getLoggedInAnnotatorId()): void {
        this.annotationFromLoggedUser = this.annotations.filter(a => a.annotator.id == annotatorId)[0];
        if (this.annotationFromLoggedUser) {
            this.hasAnnotationFromLoggedUser = true;
        }
    }

    private setType(type: string): void {
        switch(+type) { 
            case 0: {
                this.type = InstanceType.Class;
                break;
            }
            case 1: { 
                this.type = InstanceType.Method;
                break; 
            } 
            default: {
                this.type = type as InstanceType;
                break;
            }
        }
    }
}
