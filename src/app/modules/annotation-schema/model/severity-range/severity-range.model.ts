export class SeverityRange {
    id: number = 0;
    minValue: number = 0;
    maxValue: number = 0;
    step: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.minValue = obj.minValue;
            this.maxValue = obj.maxValue;
            this.step = obj.step;
        }
    }
}
