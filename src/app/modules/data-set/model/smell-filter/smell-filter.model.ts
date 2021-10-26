import { CodeSmell } from "../code-smell/code-smell.model";
import { MetricThresholds } from "../metric-thresholds/metric-thresholds.model";

export class SmellFilter {
    codeSmell: CodeSmell | null = null;
    metricsThresholds: MetricThresholds[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.codeSmell = obj.codeSmell;
            this.metricsThresholds = obj.metricsThresholds;
        }
    }
}
