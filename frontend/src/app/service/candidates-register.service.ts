import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGenericResponse } from '../interface/generic/IGenericResponse.interface';
import { environment } from '../environment/environment';
import { Candidate } from '../interface/pages/candidate/candidate.interface';

@Injectable({ providedIn: 'root' })

export class CandidatesRegisterService {

  constructor(private http: HttpClient) {}

  public getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${environment.apiUrl}candidates`);
  }
}