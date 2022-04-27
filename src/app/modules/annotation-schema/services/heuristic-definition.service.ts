import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerCommunicationService } from 'src/app/server-communication/server-communication.service'; 
import { Heuristic } from '../model/heuristic/heuristic.model';


@Injectable({
  providedIn: 'root'
})
export class HeuristicDefinitionService {
  
  private heuristicPath: string = 'annotation-schema/heuristics/';

  constructor(private serverCommunicationService: ServerCommunicationService) { }

  public getAllHeuristics(): Observable<Heuristic[]> {
    return this.serverCommunicationService.getRequest(this.heuristicPath);
  }

  public deleteHeuristic(id: number) {
    return this.serverCommunicationService.deleteRequest(this.heuristicPath + id);
  }

  public createHeuristic(heuristic: Heuristic): Observable<Heuristic> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.postRequest(this.heuristicPath, heuristic, headers);
  }

  public updateHeuristic(id: number, heuristic: Heuristic) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.serverCommunicationService.putRequest(this.heuristicPath + id, heuristic, headers);
  }
}
