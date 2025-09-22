import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Candidate } from '../interface/pages/candidate/candidate.interface';
import { IGenericResponse } from '../interface/generic/IGenericResponse.interface';
@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private readonly apiUrl: string = environment.apiUrl;
  private readonly http: HttpClient = inject(HttpClient);

  public newCandidate(candidate: Candidate): Observable<IGenericResponse> {
    return this.http.post<IGenericResponse>(`${this.apiUrl}`, candidate);
  }
}