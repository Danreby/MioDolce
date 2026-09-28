using System.ComponentModel.DataAnnotations;

namespace MioDolce.Api.Infrastructure;

/// <summary>
/// Configuração da seção "Frontend" do appsettings.
///
/// Observação: o Next.js deste projeto chama a API pelo SERVIDOR (Server Components e
/// Server Actions), então o navegador nunca fala direto com a API e CORS nem entraria em jogo.
/// A política existe para quando você quiser chamar a API de um componente client-side.
/// </summary>
internal sealed class FrontendOptions
{
    public const string SectionName = "Frontend";

    [Required]
    [MinLength(1)]
    public string[] AllowedOrigins { get; init; } = [];
}
