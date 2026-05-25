using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//banco de dados em memória
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("CartaoVacunacaoDb"));

// 2. Configura o CORS para permitir que o Angular (Porta 4200) acesse a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // URL padrão do Angular
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Adiciona o suporte para Controllers
builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 4. Ativa a política de CORS criada lá em cima
app.UseCors("AngularApp");

// 5. Mapeia as rotas dos nossos Controllers automaticamente
app.MapControllers();

app.Run();