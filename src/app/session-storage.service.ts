import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    private annotatorId: string = 'annotatorId';
    private smellFilter: string = 'smellFilter';
    private autoAnnotationMode: string = 'autoAnnotationMode';

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
    
    public getAutoAnnotationMode() {
        return sessionStorage.getItem(this.autoAnnotationMode);
    }

    public setAutoAnnotationMode(autoAnnotationMode: boolean) {
        sessionStorage.setItem(this.autoAnnotationMode, autoAnnotationMode+'');
    }

    public clearAutoAnnotationMode() {
        sessionStorage.removeItem(this.autoAnnotationMode);
    }

    public clearSessionStorage() {
        sessionStorage.clear();
    }
}