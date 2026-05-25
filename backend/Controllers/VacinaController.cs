using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VacinaController : ControllerBase
{
    private readonly AppDbContext _context;
    public VacinaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Vacina>>> GetVacinas()
    {
        return await _context.Vacinas.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Vacina>> CadastrarVacina(Vacina vacina)
    {
        var jaExistente = await _context.Vacinas.AnyAsync(v => v.IdVacina == vacina.IdVacina);
        if (jaExistente)
        {
            return BadRequest("Vacina já cadastrada");
        }

        _context.Vacinas.Add(vacina);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVacinas), new { id = vacina.IdVacina }, vacina);
    }
}