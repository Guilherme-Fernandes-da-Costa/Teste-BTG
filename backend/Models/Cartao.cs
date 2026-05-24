using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Cartao
{
    [Key]
    public int IdCartao { get; set; }
 
    public int IdPessoa { get; set; }
 
    public int IdVacina { get; set; }
 
    public DateTime DataAplicacao { get; set; }
 
    public int Dose { get; set; } // aqui irá precisar se validação
}