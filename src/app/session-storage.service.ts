import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    public getLoggedInAnnotator() {
        return sessionStorage.getItem('annotatorId');
    }

    public setLoggedInAnnotator(annotatorId: string) {
        sessionStorage.setItem('annotatorId', annotatorId);
    }

    public clearSessionStorage() {
        sessionStorage.clear();
    }
}