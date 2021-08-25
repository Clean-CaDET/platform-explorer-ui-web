import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServerCommunicationService {

  constructor(private http: HttpClient) { }

  public getRequest(path: string): Observable<any> {
    return this.sendRequest('GET', path);
  }

  public async getRequestAsync(path: string): Promise<any> {
    return await this.sendRequestAsync('GET', path);
  }

  public postRequest(path: string, body: any, headers: HttpHeaders): Observable<any> {
    return this.sendRequest('POST', path, body, headers);
  }

  public putRequest(path: string, body: any, headers: HttpHeaders): Observable<any> {
    return this.sendRequest('PUT', path, body, headers);
  }

  private sendRequest(method: string, path: string, body?: any, headers?: HttpHeaders): Observable<any> {
    return this.http.request<any>(method, environment.apiHost + path, {
      headers : headers,
      body: body,
    });
  }

  private async sendRequestAsync(method: string, path: string, body?: any, headers?: HttpHeaders): Promise<any> {
    return await this.sendRequest(method, path, body, headers).toPromise();
  }
}
