export class Annotator {
    id: number = 0;
    name: string = '';
    email: string = '';
    yearsOfExperience: number = 0;
    ranking: number = 0;

    constructor(obj?: any) {
        if (obj) {
            this.id = obj.id;
            this.name = obj.name;
            this.email = obj.email;
            this.yearsOfExperience = obj.yearsOfExperience;
            this.ranking = obj.ranking;
        }
    }
}
