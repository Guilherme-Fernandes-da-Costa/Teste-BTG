import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  pessoaSelecionada: any = null;
  historicoVacinacao: any[] = []; // Unificado para gerenciar o cartão e o status visual

  // Modelos de Cadastro Auxiliares
  novaPessoa: Pessoa = { nomePessoa: '', numeroIdentificacao: '' };
  novaVacina: Vacina = { nomeVacina: '' };
  registrarDose = { vacinaId: 0, doseNome: '' };

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
    private vacinacaoService: VacinacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(){
    this.carregarDados();
  }

  carregarDados() {
    this.pessoaService.getPessoas().subscribe(res => this.pessoas = res);
    this.vacinaService.getVacinas().subscribe(res => this.vacinas = res);
  }

  cadastrarPessoa() {
    if (!this.novaPessoa.nomePessoa){
      alert('O nome do paciente é obrigatório.');
      return;
    }

    this.novaPessoa.idPessoa = Math.floor(Math.random() * 1000000) + 1; 
    
    this.pessoaService.cadastrarPessoa(this.novaPessoa).subscribe({
      next: () => {
        this.novaPessoa = { nomePessoa: '', numeroIdentificacao: '' };
        this.carregarDados();
        alert("Paciente cadastrado com sucesso!");
      },
      error: (err) => alert("Erro ao cadastrar pessoa.")
    });
  }

  cadastrarVacina() {
    if (!this.novaVacina.nomeVacina) return;

    this.novaVacina.idVacina = Math.floor(Math.random() * 1000000) + 1;

    this.vacinaService.cadastrarVacina(this.novaVacina).subscribe({
      next: () => {
        this.novaVacina = { nomeVacina: '' };
        this.carregarDados();
        alert("Vacina adicionada ao catálogo com sucesso!");
      },
      error: (err) => alert("Erro ao cadastrar vacina.")
    });
  }

  selecionarPessoa(pessoa: Pessoa) {
    if(!pessoa) return;
    this.pessoaSelecionada = pessoa;
    this.historicoVacinacao = []; // Reseta o histórico anterior para evitar fantasmas visuais
    this.carregarCartao(pessoa.idPessoa || 0);
  }

  carregarCartao(pessoaId: number) {
    if(!pessoaId) return;

    this.vacinacaoService.consultarCartao(pessoaId).subscribe({
      next: (historico) => {
        // Alimenta o array usado globalmente pela tabela matricial
        this.historicoVacinacao = historico || []; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Erro ao carregar cartão:', err);
        this.historicoVacinacao = [];
        this.cdr.detectChanges();
      }
    });
  }

  obterStatusDose(vacinaNome: string, doseNome: string): { aplicado: boolean; idLog?: number } {
    if (!this.historicoVacinacao) return { aplicado: false };

    // Correção: Agora varre a variável correta (historicoVacinacao) que vem preenchida do banco
    const registro = this.historicoVacinacao.find(v => 
      v.nomeVacina?.toLowerCase().trim() === vacinaNome.toLowerCase().trim() &&
      v.dose?.toLowerCase().trim() === doseNome.toLowerCase().trim()
    );

    if (registro) {
      return { aplicado: true, idLog: registro.id };
    }
    return { aplicado: false };
  }

  adicionarDoseNaGrade(vacinaId: number, vacinaNome: string, doseNome: string) {
    if (!this.pessoaSelecionada) {
      alert('Selecione um paciente para registrar a vacinação.');
      return;
    }
    
    const ordemDoses = ['Tipo 1ª Dose', 'Tipo 2ª Dose', 'Tipo 3ª Dose', 'Tipo 1º Reforço', 'Tipo 2º Reforço'];
    const indiceAtual = ordemDoses.indexOf(doseNome);
    
    for (let i = 0; i < indiceAtual; i++) {
      const doseAnterior = ordemDoses[i];
      // Correção: Passando vacinaNome em vez de doseNome para validar corretamente
      const statusAnterior = this.obterStatusDose(vacinaNome, doseAnterior);
      
      if (!statusAnterior || !statusAnterior.aplicado) {
        alert(`🚨 Atenção: Não é possível registrar a "${doseNome}". O paciente precisa receber primeiro a "${doseAnterior}" desta vacina.`);
        return;
      }
    }

    // Correção: Propriedades renomeadas para bater estritamente com os tipos 'int' requeridos pelo C# (idPessoa e idVacina)
    const DTO: any = {
      id: 0,
      idPessoa: Number(this.pessoaSelecionada.idPessoa || 0),
      idVacina: Number(vacinaId),
      dose: doseNome.trim()
    };

    this.vacinacaoService.registrarVacinacao(DTO).subscribe({
      next: () => {
        // Força a atualização do histórico para renderizar o quadrado cinza imediatamente
        this.carregarCartao(this.pessoaSelecionada.idPessoa || 0);
      },
      error: (err) => {
        console.error('Erro retornado pela API C#:', err);
        const mensagemErro = err.error?.title || err.error?.message || JSON.stringify(err.error) || err.message;
        alert('Erro ao aplicar dose: ' + mensagemErro);
      }
    });
  }

  removerDoseNaGrade(idLog: number) {
    if (confirm('Deseja remover o registro desta dose?')) {
      this.vacinacaoService.excluirRegistro(idLog).subscribe({
          next: () => {
            alert("Registro de vacinação removido.");
            this.carregarCartao(this.pessoaSelecionada.idPessoa);
          },
          error: (err) => {
            console.error("Erro ao excluir dose:", err);
            alert("Não foi possível remover este registro.");
          }
        });
    }
  }

  removerPacienteAtual(){
    if (!this.pessoaSelecionada) return;

    if (confirm(`Deseja remover o paciente ${this.pessoaSelecionada.nomePessoa}?`)) {
      this.pessoaService.removerPessoa(this.pessoaSelecionada.idPessoa || 0).subscribe({
        next: () => {
          this.pessoaSelecionada = null;
          this.historicoVacinacao = [];
          this.carregarDados();
          this.cdr.detectChanges();
          alert("Paciente removido com sucesso!");
        },
        error: (err) => alert("Erro ao remover paciente.")
      });
    }
  }
}