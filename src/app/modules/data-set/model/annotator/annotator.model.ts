export class Annotator {
    id: number = 0;
    yearsOfExperience: number = 0;
    ranking: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.yearsOfExperience = obj.yearsOfExperience;
            this.ranking = obj.ranking;
        }
    }
}
