import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ServerCommunicationService } from "src/app/server-communication/server-communication.service";
import { Annotator } from "../model/annotator/annotator.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authPath: string = 'auth/';

    constructor(private serverCommunicationService: ServerCommunicationService) { }

    public registerAnnotator(name: string, email: string, yearsOfExperience: number, ranking: number): Observable<Annotator> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        let data = {'name': name, 'email': email, 'yearsOfExperience': yearsOfExperience, 'ranking': ranking};
        return this.serverCommunicationService.postRequest(this.authPath, data, headers);
    }

    public getAnnotatorByEmail(email: string): Observable<Annotator> {
        return this.serverCommunicationService.getRequest(this.authPath + email);
    }
}