import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { CodeSmellDefinition } from '../model/code-smell-definition/code-smell-definition.model';
import { Heuristic } from '../model/heuristic/heuristic.model';


@Injectable({
  providedIn: 'root'
})
export class AnnotationSchemaService {
  
  private codeSmellPath: string = 'annotation-schema/code-smells/';

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAllCodeSmellDefinitions(): Observable<CodeSmellDefinition[]> {
    return this.serverCommunicationService.getRequest(this.codeSmellPath);
  }

  public getCodeSmellDefinition(id: number) {
    return this.serverCommunicationService.getRequest(this.codeSmellPath + id);
  }

  public createCodeSmellDefinition(codeSmellDefinition: CodeSmellDefinition): Observable<CodeSmellDefinition> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.codeSmellPath, codeSmellDefinition, headers);
  }

  public updateCodeSmellDefinition(id: number, codeSmellDefinition: CodeSmellDefinition) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.codeSmellPath + id, codeSmellDefinition, headers);
  }

  public deleteCodeSmellDefinition(id: number) {
    return this.serverCommunicationService.deleteRequest(this.codeSmellPath + id);
  }

  public addHeuristicToCodeSmell(id: number, heuristic: Heuristic) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.codeSmellPath + id + '/heuristics', heuristic, headers);
  }

  public getHeuristicsForCodeSmell(id: number) {
    return this.serverCommunicationService.getRequest(this.codeSmellPath + id + '/heuristics');
  }
  
  public removeHeuristicFromCodeSmell(id: number, heuristicId: number) {
    return this.serverCommunicationService.deleteRequest(this.codeSmellPath + id + '/heuristics/' + heuristicId);
  }

  public updateHeuristicInCodeSmell(smellId: number, heuristic: Heuristic) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.codeSmellPath + smellId + '/heuristics/', heuristic, headers);
  }

  public getHeuristicsForEachCodeSmell(): Observable<Map<string, Heuristic[]>> {
    return this.serverCommunicationService.getRequest(this.codeSmellPath + 'heuristics');
  }
}
