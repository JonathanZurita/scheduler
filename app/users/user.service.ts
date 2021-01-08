import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {User} from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers$(): Observable<User[]> {
    return this.http.get<User[]>(
      './assets/data.json');
  }
  // postUser$(data: object): Observable<ArrayBuffer> {
  //   return this.http.post<any>('https://jonathanvikas-schedule-project-api.apps.pcfepg3mi.gm.com/users', data);
  // }
}
