using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Pessoa
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string NomePessoa { get; set; }
}