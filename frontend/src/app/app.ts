import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pessoa, PessoaService } from './services/pessoa';
import { Vacina, VacinaService } from './services/vacina';
import { Vacinacao, VacinacaoService } from './services/vacinacao';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  // Dados do BD
  pessoas: Pessoa[] = [];
  vacinas: Vacina[] = [];
  vacinacoesPessoa: Vacinacao[] = [];

  // Modelos de Cadastro Auxiliares
  novaPessoa: Pessoa = { nomePessoa: '', numeroIdentificacao: '' };
  novaVacina: Vacina = { nomeVacina: '' };
  registrarDose = { vacinaId: 0, doseNome: '' };

  pessoaSelecionada?: Pessoa;

  listaDoses: string[] = [
    'Tipo 1ª Dose',
    'Tipo 2ª Dose',
    'Tipo 3ª Dose',
    'Tipo 1º Reforço',
    'Tipo 2º Reforço'
  ];

  constructor(
    private pessoaService: PessoaService,
    private vacinaService: VacinaService,
    private vacinacaoService: VacinacaoService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.pessoaService.getPessoas().subscribe(res => this.pessoas = res);
    this.vacinaService.getVacinas().subscribe(res => this.vacinas = res);
  }

  cadastrarPessoa() {
    if (!this.novaPessoa.nomePessoa || !this.novaPessoa.numeroIdentificacao) return;
    
    this.novaPessoa.idPessoa = Math.floor(Math.random() * 1000000) + 1; 
    
    this.pessoaService.cadastrarPessoa(this.novaPessoa).subscribe(() => {
      this.novaPessoa = { nomePessoa: '', numeroIdentificacao: '' };
      this.carregarDados();
    });
  }

  cadastrarVacina() {
    if (!this.novaVacina.nomeVacina) return;

    this.novaVacina.idVacina = Math.floor(Math.random() * 1000000) + 1;

    this.vacinaService.cadastrarVacina(this.novaVacina).subscribe(() => {
      this.novaVacina = { nomeVacina: '' };
      this.carregarDados();
    });
  }

  selecionarPessoa(pessoa: Pessoa) {
    this.pessoaSelecionada = pessoa;
    this.carregarCartao(pessoa.idPessoa || 0);
  }

  carregarCartao(pessoaId: number) {
    this.vacinacaoService.consultarCartao(pessoaId).subscribe(res => this.vacinacoesPessoa = res);
  }

  obterStatusDose(vacinaNome: string, doseNome: string): { aplicado: boolean; idLog?: number } {
    // Ignoro maiúsculas/minúsculas e espaços
    const registro = this.vacinacoesPessoa.find(v => 
      v.vacinaNome?.toLowerCase().trim() === vacinaNome.toLowerCase().trim() &&
      v.dose.toLowerCase().trim() === doseNome.toLowerCase().trim()
    );

    if (registro) {
      return { aplicado: true, idLog: registro.id };
    }
    return { aplicado: false };
  }

  adicionarDoseNaGrade(vacinaId: number, doseNome: string) {
    if (!this.pessoaSelecionada) return;
    
    const DTO: Vacinacao = {
      pessoaId: this.pessoaSelecionada.idPessoa || 0,
      vacinaId: vacinaId,
      dose: doseNome
    };

    this.vacinacaoService.registrarVacinacao(DTO).subscribe({
      next: () => this.carregarCartao(this.pessoaSelecionada!.idPessoa || 0),
      error: (err) => alert(err.error || 'Erro ao aplicar dose.')
    });
  }

  removerDoseNaGrade(idLog: number) {
    if (confirm('Deseja remover o registro desta dose?')) {
      this.vacinacaoService.excluirRegistro(idLog).subscribe(() => {
        this.carregarCartao(this.pessoaSelecionada!.idPessoa || 0);
      });
    }
  }
}