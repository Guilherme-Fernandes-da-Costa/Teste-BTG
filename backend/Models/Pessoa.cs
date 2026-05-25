using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Pessoa
{
    [Key]
    public int IdPessoa { get; set; }

    [Required]
    [StringLength(100)]
    public string NomePessoa { get; set; }

    //a representação da classe não tem esse atributo, mas é necessário na aplicacao (ver como explicar melhor o meu pensamento no README)
    public List<Vacinacao> Vacinacoes { get; set; } = new List<Vacinacao>();
}