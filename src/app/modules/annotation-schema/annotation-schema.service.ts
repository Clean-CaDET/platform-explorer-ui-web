import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { CodeSmellDefinition } from './model/code-smell-definition/code-smell-definition.model';
import { Heuristic } from './model/heuristic/heuristic.model';


@Injectable({
  providedIn: 'root'
})
export class AnnotationSchemaService {
  
  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAllCodeSmellDefinitions(): Observable<CodeSmellDefinition[]> {
    return this.serverCommunicationService.getRequest('annotation-schema/code-smell-definition');
  }

  public createCodeSmellDefinition(codeSmellDefinition: CodeSmellDefinition): Observable<CodeSmellDefinition> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest('annotation-schema/code-smell-definition', codeSmellDefinition, headers);
  }

  public updateCodeSmellDefinition(id: number, codeSmellDefinition: CodeSmellDefinition) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest('annotation-schema/code-smell-definition/' + id, codeSmellDefinition, headers);
  }

  public addHeuristicsToCodeSmell(id: number, heuristics: Heuristic[]) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest('annotation-schema/code-smell-definition/' + id + '/heuristic', heuristics, headers);
  }

  public getHeuristicsForCodeSmell(id: number) {
    return this.serverCommunicationService.getRequest('annotation-schema/code-smell-definition/' + id + '/heuristic');
  }
  
  public removeHeuristicFromCodeSmell(id: number, heuristicId: number) {
    return this.serverCommunicationService.deleteRequest('annotation-schema/code-smell-definition/' + id + '/heuristic/' + heuristicId);
  }

  public deleteCodeSmellDefinition(id: number) {
    return this.serverCommunicationService.deleteRequest('annotation-schema/code-smell-definition/' + id);
  }

  public getAllHeuristics(): Observable<Heuristic[]> {
    return this.serverCommunicationService.getRequest('annotation-schema/heuristic');
  }

  public deleteHeuristic(id: number) {
    return this.serverCommunicationService.deleteRequest('annotation-schema/heuristic/' + id);
  }

  public createHeuristic(heuristic: Heuristic): Observable<Heuristic> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest('annotation-schema/heuristic', heuristic, headers);
  }

  public updateHeuristic(id: number, heuristic: Heuristic) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest('annotation-schema/heuristic/' + id, heuristic, headers);
  }
}
