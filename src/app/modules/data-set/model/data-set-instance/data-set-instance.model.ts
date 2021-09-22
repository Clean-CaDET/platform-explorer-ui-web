import { UtilService } from "src/app/util/util.service";
import { DataSetAnnotation } from "../data-set-annotation/data-set-annotation.model"; 
import { InstanceType } from "../enums/enums.model";

export class DataSetInstance {
    id: number = 0;
    codeSnippetId: string = '';
    link: string = '';
    projectLink: string = '';
    type: InstanceType = InstanceType.Method;
    annotations: DataSetAnnotation[] = [];
    metricFeatures: Map<string, number> = new Map();
    hasAnnotationFromLoggedUser: boolean = false;
    annotationFromLoggedUser: DataSetAnnotation | null = null;

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
        }
    }

    private setMetricFeatures(metricFeatures: Map<string, number>): void {
        for (let keyValue of Object.entries(metricFeatures)) {
            this.metricFeatures.set(keyValue[0], keyValue[1]);
        }
    }

    private setAnnotationFromLoggedUser(annotatorId: number = UtilService.getAnnotatorId()): void {
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
