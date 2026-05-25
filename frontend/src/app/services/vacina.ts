import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vacina {
  idVacina?: number;
  nomeVacina: string;
}

@Injectable({
  providedIn: 'root'
})
export class VacinaService {
  private apiUrl = 'http://localhost:5272/api/vacina';

  constructor(private http: HttpClient) { }

  getVacinas(): Observable<Vacina[]> {
    return this.http.get<Vacina[]>(this.apiUrl);
  }

  cadastrarVacina(vacina: Vacina): Observable<Vacina> {
    return this.http.post<Vacina>(this.apiUrl, vacina);
  }
}