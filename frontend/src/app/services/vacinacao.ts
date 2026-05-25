import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vacinacao {
  id?: number;
  pessoaId: number;
  vacinaId: number;
  dose: string;
  dataAplicacao?: string;
  vacinaNome?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VacinacaoService {
  private apiUrl = 'http://localhost:5272/api/vacinacao';

  constructor(private http: HttpClient) { }

  registrarVacinacao(vacinacao: Vacinacao): Observable<Vacinacao> {
    return this.http.post<Vacinacao>(this.apiUrl, vacinacao);
  }

  consultarCartao(pessoaId: number): Observable<Vacinacao[]> {
    return this.http.get<Vacinacao[]>(`${this.apiUrl}/cartao/${pessoaId}`);
  }

  excluirRegistro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}