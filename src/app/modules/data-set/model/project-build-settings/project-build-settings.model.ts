import { NumOfInstancesType } from '../enums/enums.model';

export class ProjectBuildSettings {
    numOfInstances: number = 100;
    numOfInstancesType: NumOfInstancesType = NumOfInstancesType.Percentage;
    randomizeClassSelection: boolean = true;
    randomizeMemberSelection: boolean = true;
    ignoredFolders: string[] = [];

    constructor(obj?: any) {
        if (obj) {
            this.numOfInstances = obj.numOfInstances;
            this.numOfInstancesType = obj.numOfInstancesType;
            this.randomizeClassSelection = obj.randomizeClassSelection;
            this.randomizeMemberSelection = obj.randomizeMemberSelection;
            this.ignoredFolders = obj.ignoredFolders;
        }
    }
}
