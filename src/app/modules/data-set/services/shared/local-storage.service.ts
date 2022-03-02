import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private annotatorId: string = 'annotatorId';
    private smellFilter: string = 'smellFilter';
    private autoAnnotationMode: string = 'autoAnnotationMode';
    private annotationCounter: string = 'annotationCounter';

    public getLoggedInAnnotator() {
        return localStorage.getItem(this.annotatorId);
    }

    public setLoggedInAnnotator(annotatorId: string) {
        localStorage.setItem(this.annotatorId, annotatorId);
    }

    public getSmellFilter() {
        return localStorage.getItem(this.smellFilter);
    }

    public setSmellFilter(smellFilter: string) {
        localStorage.setItem(this.smellFilter, smellFilter);
    }

    public clearSmellFilter() {
        localStorage.removeItem(this.smellFilter);
    }
    
    public getAutoAnnotationMode() {
        return localStorage.getItem(this.autoAnnotationMode);
    }

    public setAutoAnnotationMode(autoAnnotationMode: boolean) {
        localStorage.setItem(this.autoAnnotationMode, autoAnnotationMode+'');
    }

    public getAnnotationCounter() {
        return localStorage.getItem(this.annotationCounter);
    }

    public setAnnotationCounter(annotationCounter: boolean) {
        localStorage.setItem(this.annotationCounter, annotationCounter+'');
    }

    public clearAnnotationCounter() {
        localStorage.removeItem(this.annotationCounter);
    }

    public clearAutoAnnotationMode() {
        localStorage.removeItem(this.autoAnnotationMode);
    }

    public clearLocalStorage() {
        localStorage.clear();
    }
}