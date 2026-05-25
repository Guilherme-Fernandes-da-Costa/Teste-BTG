using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Pessoa> Pessoas { get; set; }
    public DbSet<Vacina> Vacinas { get; set; }
    public DbSet<Vacinacao> Vacinacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Pessoa>()
            .HasIndex(p => p.IdPessoa)
            .IsUnique();
    }
}