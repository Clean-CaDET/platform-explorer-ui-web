import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { CodeSmellDefinition } from '../model/code-smell-definition/code-smell-definition.model';
import { Heuristic } from '../model/heuristic/heuristic.model';


@Injectable({
  providedIn: 'root'
})
export class CodeSmellDefinitionService {
  
  private codeSmellPath: string = 'annotation-schema/code-smells/';

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAllCodeSmellDefinitions(): Observable<CodeSmellDefinition[]> {
    return this.serverCommunicationService.getRequest(this.codeSmellPath);
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

  public addHeuristicsToCodeSmell(id: number, heuristics: Heuristic[]) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.codeSmellPath + id + '/heuristics', heuristics, headers);
  }

  public getHeuristicsForCodeSmell(id: number) {
    return this.serverCommunicationService.getRequest(this.codeSmellPath + id + '/heuristics');
  }
  
  public removeHeuristicFromCodeSmell(id: number, heuristicId: number) {
    return this.serverCommunicationService.deleteRequest(this.codeSmellPath + id + '/heuristics/' + heuristicId);
  }
}
