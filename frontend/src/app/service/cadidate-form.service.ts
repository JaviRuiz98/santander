import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IGenericResponse } from '../interface/generic/IGenericResponse.interface';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  constructor(private http: HttpClient) {}

  public newCandidate(formData: FormData): Observable<IGenericResponse> {
    return this.http.post<IGenericResponse>(`${environment.apiUrl}candidates`, formData);
  }
}
