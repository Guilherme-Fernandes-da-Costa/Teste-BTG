using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Vacina
{
    [Key]
    public int IdVacina { get; set; }
 
    [Required]
    [StringLength(100)]
    public string NomeVacina { get; set; }
}