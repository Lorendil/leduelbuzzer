import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // service global
})
export class TestService {
  private apiUrl = 'http://localhost:8080/hello'; // ton backend Spring Boot

  constructor(private http: HttpClient) {}

  sayHello(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
