export class MetricThresholds {
    codeSmell: string = '';
    metric: string = '';
    minValue: string = '';
    maxValue: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.codeSmell = obj.codeSmell;
            this.metric = obj.metric;
            this.minValue = obj.minValue;
            this.maxValue = obj.maxValue;
        }
    }
}
