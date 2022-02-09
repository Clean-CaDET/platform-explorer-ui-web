import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    private annotatorId: string = 'annotatorId';
    private smellFilter: string = 'smellFilter';

    public getLoggedInAnnotator() {
        return sessionStorage.getItem(this.annotatorId);
    }

    public setLoggedInAnnotator(annotatorId: string) {
        sessionStorage.setItem(this.annotatorId, annotatorId);
    }

    public getSmellFilter() {
        return sessionStorage.getItem(this.smellFilter);
    }

    public setSmellFilter(smellFilter: string) {
        sessionStorage.setItem(this.smellFilter, smellFilter);
    }

    public clearSmellFilter() {
        sessionStorage.removeItem(this.smellFilter);
    }

    public clearSessionStorage() {
        sessionStorage.clear();
    }
}