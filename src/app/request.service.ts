import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  public sendRequest(method: string, url: string, body?: any, headers?: HttpHeaders): Observable<any> {
    return this.http.request<any>(method, url, {
      headers : headers,
      body: body,
    });
  }

  public async sendRequestAsync(method: string, url: string, body?: any, headers?: HttpHeaders) {
    return this.sendRequest(method, url, body, headers).toPromise();
  }
}
