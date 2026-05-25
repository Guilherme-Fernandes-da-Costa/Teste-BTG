using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoaController : ControllerBase
{
    private readonly AppDbContext _context;
    public PessoaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pessoa>>> GetPessoas()
    {
        return await _context.Pessoas.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Pessoa>> CadastrarPessoa(Pessoa pessoa)
    {
        var jaExistente = await _context.Pessoas.AnyAsync(p => p.Id == pessoa.Id);
        if (jaExistente)
        {
            return BadRequest("Pessoa já cadastrada");
        }

        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPessoas), new { id = pessoa.Id }, pessoa);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoverPessoa(int id)
    {
        var pessoa = await _context.Pessoas.Include(p => p.Vacinassoes).FirstOrDefaultAsync(p => p.Id == id);
        if (pessoa == null)
        {
            return NotFound("Pessoa não encontrada");
        }
        _context.Vacinassoes.RemoveRange(pessoa.Vacinassoes);
        _context.Pessoas.Remove(pessoa);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}