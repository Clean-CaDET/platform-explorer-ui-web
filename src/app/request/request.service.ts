import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  public sendRequest(method: string, path: string, body?: any, headers?: HttpHeaders): Observable<any> {
    return this.http.request<any>(method, environment.apiHost + path, {
      headers : headers,
      body: body,
    });
  }

  public async sendRequestAsync(method: string, path: string, body?: any, headers?: HttpHeaders) {
    return await this.sendRequest(method, path, body, headers).toPromise();
  }
}
