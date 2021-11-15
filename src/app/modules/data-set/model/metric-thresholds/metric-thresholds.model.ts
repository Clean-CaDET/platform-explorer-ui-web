export class MetricThresholds {
    metric: string = '';
    minValue: string = '';
    maxValue: string = '';

    constructor(obj?: any) {
        if (obj) {
            this.metric = obj.metric;
            this.minValue = obj.minValue;
            this.maxValue = obj.maxValue;
        }
    }
}
