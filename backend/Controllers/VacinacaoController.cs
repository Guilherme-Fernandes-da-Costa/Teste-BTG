using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VacinacaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public VacinacaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("pessoa/{pessoaId}")]
    public async Task<IActionResult> GetCartao(int pessoaId)
    {
        // Busca as vacinações e já traz os nomes das vacinas projetados
        var historico = await _context.Vacinacoes
            .Where(v => v.IdPessoa == pessoaId)
            .Select(v => new {
                id = v.IdCartao,
                idPessoa = v.IdPessoa,
                idVacina = v.IdVacina,
                vacinaNome = _context.Vacinas.Where(vac => vac.IdVacina == v.IdVacina).Select(vac => vac.NomeVacina).FirstOrDefault(),
                dose = v.Dose,
                dataAplicacao = v.DataAplicacao 
            })
            .ToListAsync();

        return Ok(historico);
    }

    [HttpPost]
    public async Task<ActionResult<Vacinacao>> RegistrarVacinacao(Vacinacao Vacinacao)
    {
        var pessoaExistente = await _context.Pessoas.AnyAsync(p => p.IdPessoa == Vacinacao.IdPessoa);
        if (!pessoaExistente)
        {
            return BadRequest("Pessoa não encontrada");
        }

        var vacinaExistente = await _context.Vacinas.AnyAsync(v => v.IdVacina == Vacinacao.IdVacina);
        if (!vacinaExistente)
        {
            return BadRequest("Vacina não encontrada");
        }

        var doseDuplicada = await _context.Vacinacoes
            .AnyAsync(c => c.IdPessoa == Vacinacao.IdPessoa && c.IdVacina == Vacinacao.IdVacina && c.Dose == Vacinacao.Dose);

        if (doseDuplicada)
        {
            return BadRequest("Dose já registrada para esta pessoa e vacina");
        }

        _context.Vacinacoes.Add(Vacinacao);
        await _context.SaveChangesAsync();

        return Ok(Vacinacao);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> ExcluirRegistro(int id)
    {
        var registro = await _context.Vacinacoes.FindAsync(id);
        if (registro == null)
        {
            return NotFound("Registro de vacinação não encontrado");
        }

        _context.Vacinacoes.Remove(registro);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}