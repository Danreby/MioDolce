using Microsoft.EntityFrameworkCore;
using MioDolce.Domain.Categories;
using MioDolce.Domain.Products;
using MioDolce.Domain.Stock;
using MioDolce.Domain.Suppliers;

namespace MioDolce.Infrastructure.Persistence.Seed;

/// <summary>
/// Dados de exemplo (o almoxarifado de uma confeitaria) para você ter o que explorar na tela.
/// Tudo é criado pelos métodos do DOMÍNIO, inclusive o histórico: o seed respeita as mesmas
/// regras que a API. O Random tem semente fixa, então o resultado é sempre o mesmo.
///
/// É plugado via UseSeeding/UseAsyncSeeding (EF Core 9+) e roda quando as migrations são aplicadas.
/// </summary>
internal static class InventorySeeder
{
    private const int HistoryDays = 21;

    private static readonly string[] ExitNotes =
    [
        "Produção do dia",
        "Encomenda de casamento",
        "Venda no balcão",
        "Produção de bolos de pote",
        "Encomenda corporativa",
    ];

    private static readonly string[] EntryNotes =
    [
        "Compra NF 004817",
        "Reposição semanal",
        "Compra NF 005102",
    ];

    // Cada bloco checa a PRÓPRIA tabela: quando uma migration nova cria uma tabela
    // (ex.: suppliers), bancos que já tinham dados também recebem o exemplo dela.
    public static async Task SeedAsync(DbContext context, TimeProvider timeProvider, CancellationToken cancellationToken)
    {
        if (!await context.Set<Category>().AnyAsync(cancellationToken))
        {
            Add(context, timeProvider);
        }

        if (!await context.Set<Supplier>().AnyAsync(cancellationToken))
        {
            AddSuppliers(context);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    // Versão síncrona: usada pelas ferramentas do EF (dotnet ef database update).
    public static void Seed(DbContext context, TimeProvider timeProvider)
    {
        if (!context.Set<Category>().Any())
        {
            Add(context, timeProvider);
        }

        if (!context.Set<Supplier>().Any())
        {
            AddSuppliers(context);
        }

        context.SaveChanges();
    }

    private static void AddSuppliers(DbContext context) => context.AddRange(
        Supplier.Create("Cacau do Sul Ltda", "12.345.678/0001-90", "vendas@cacaudosul.com.br", "(51) 3222-4810"),
        Supplier.Create("Moinho Santa Clara", "23.456.789/0001-01", "pedidos@moinhosantaclara.com.br", "(41) 3014-7755"),
        Supplier.Create("Laticínios Serra Azul", "34.567.890/0001-12", null, "(35) 3471-2090"),
        Supplier.Create("Embalagens Aurora", "45.678.901/0001-23", "contato@embalagensaurora.com.br", null));

    private static void Add(DbContext context, TimeProvider timeProvider)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var today = now.Date;

        var chocolates = Category.Create("Chocolates e coberturas", "Barras, gotas, coberturas e cacau.");
        var dry = Category.Create("Farinhas e secos", "Farinhas, açúcares e oleaginosas moídas.");
        var dairy = Category.Create("Laticínios e ovos", "Itens refrigerados de alto giro.");
        var fillings = Category.Create("Frutas e recheios", "Polpas, frutas congeladas e pastas.");
        var packaging = Category.Create("Embalagens", "Caixas, forminhas e fitas.");
        var decoration = Category.Create("Decoração", "Confeitos, pós comestíveis e essências.");
        context.AddRange(chocolates, dry, dairy, fillings, packaging, decoration);

        var products = new[]
        {
            P("CHO-BEL-70", "Chocolate belga 70% cacau", chocolates, UnitOfMeasure.Kilogram, 89.90m, 5),
            P("CHO-BRA-CB", "Cobertura de chocolate branco", chocolates, UnitOfMeasure.Kilogram, 54.50m, 4),
            P("CAC-PO-100", "Cacau em pó 100%", chocolates, UnitOfMeasure.Kilogram, 72.00m, 2),
            P("FAR-TRI-T1", "Farinha de trigo tipo 1", dry, UnitOfMeasure.Kilogram, 5.80m, 25),
            P("ACU-REF", "Açúcar refinado", dry, UnitOfMeasure.Kilogram, 4.90m, 20),
            P("ACU-CONF", "Açúcar de confeiteiro", dry, UnitOfMeasure.Kilogram, 9.40m, 5),
            P("AMD-FAR", "Farinha de amêndoas", dry, UnitOfMeasure.Kilogram, 118.00m, 2),
            P("LEI-COND", "Leite condensado 395 g", dairy, UnitOfMeasure.Unit, 7.20m, 36),
            P("CRE-LEI-35", "Creme de leite fresco 35%", dairy, UnitOfMeasure.Liter, 28.00m, 6),
            P("MAN-SEM", "Manteiga sem sal", dairy, UnitOfMeasure.Kilogram, 52.00m, 8),
            P("OVO-GRA-30", "Ovos grandes, bandeja com 30", dairy, UnitOfMeasure.Package, 24.00m, 4),
            P("MOR-CONG", "Morango congelado", fillings, UnitOfMeasure.Kilogram, 26.00m, 5),
            P("DOC-LEI", "Doce de leite pastoso", fillings, UnitOfMeasure.Kilogram, 31.00m, 4),
            P("PIS-PASTA", "Pasta de pistache pura", fillings, UnitOfMeasure.Kilogram, 240.00m, 1),
            P("EMB-FORM-4", "Forminha nº 4, cento", packaging, UnitOfMeasure.Package, 6.50m, 30),
            P("EMB-CX-25", "Caixa para bolo 25 × 25 cm", packaging, UnitOfMeasure.Unit, 3.40m, 50),
            P("EMB-FITA-10", "Fita de cetim 10 mm, rolo", packaging, UnitOfMeasure.Unit, 8.90m, 10),
            P("DEC-GRAN-BE", "Granulado belga", decoration, UnitOfMeasure.Kilogram, 64.00m, 2),
            P("DEC-PO-OURO", "Pó dourado comestível 5 g", decoration, UnitOfMeasure.Unit, 18.00m, 6),
            P("DEC-BAUN", "Extrato de baunilha bourbon", decoration, UnitOfMeasure.Milliliter, 0.95m, 100),
        };
        context.AddRange(products);

        var random = new Random(2026);
        var movements = new List<StockMovement>();

        foreach (var product in products)
        {
            var start = today.AddDays(-HistoryDays).AddHours(8);
            Record(product, MovementType.Entry, Round(product, product.MinimumStock * Between(random, 2.5m, 5m)), "Saldo inicial", start);

            for (var day = HistoryDays - 7; day >= 1; day--)
            {
                var moment = today.AddDays(-day).AddHours(9 + random.Next(0, 9)).AddMinutes(random.Next(0, 60));

                if (random.NextDouble() < 0.55)
                {
                    var quantity = Round(product, product.MinimumStock * Between(random, 0.2m, 0.7m));
                    if (quantity > 0 && quantity <= product.QuantityOnHand)
                    {
                        Record(product, MovementType.Exit, quantity, Pick(random, ExitNotes), moment);
                    }
                }
                else if (random.NextDouble() < 0.25)
                {
                    Record(product, MovementType.Entry, Round(product, product.MinimumStock * Between(random, 1m, 2m)), Pick(random, EntryNotes), moment);
                }
            }

            // Algumas saídas "de hoje", sempre algumas horas antes do momento atual.
            var todayExit = Round(product, product.MinimumStock * Between(random, 0.1m, 0.4m));
            if (random.NextDouble() < 0.4 && todayExit > 0 && todayExit <= product.QuantityOnHand)
            {
                Record(product, MovementType.Exit, todayExit, "Produção do dia", now.AddMinutes(-(120 + random.Next(0, 240))));
            }
        }

        // Alguns cenários fixos para a tela ter produtos zerados e em alerta.
        ForceBalance(products[10], 0, "Quebra no transporte", now.AddMinutes(-95));  // ovos: zerado
        ForceBalance(products[13], 0.4m, "Inventário mensal", now.AddMinutes(-60));   // pistache: baixo
        ForceBalance(products[8], 3m, "Inventário mensal", now.AddMinutes(-58));      // creme: baixo
        ForceBalance(products[15], 0, "Inventário mensal", now.AddMinutes(-55));      // caixas: zerado

        context.AddRange(movements);

        void Record(Product product, MovementType type, decimal quantity, string note, DateTime at)
        {
            var result = product.RegisterMovement(type, quantity, note, at);
            if (result.IsSuccess)
            {
                movements.Add(result.Value);
            }
        }

        void ForceBalance(Product product, decimal counted, string note, DateTime at) =>
            Record(product, MovementType.Adjustment, counted, note, at);
    }

    private static Product P(string sku, string name, Category category, UnitOfMeasure unit, decimal cost, decimal minimum) =>
        Product.Create(sku, name, description: null, category.Id, unit, cost, minimum);

    private static decimal Between(Random random, decimal min, decimal max) =>
        min + ((max - min) * (decimal)random.NextDouble());

    private static string Pick(Random random, string[] options) => options[random.Next(options.Length)];

    // Itens contáveis (unidades, pacotes, ml) não têm fração; pesos e volumes têm 1 casa.
    private static decimal Round(Product product, decimal quantity) => product.Unit switch
    {
        UnitOfMeasure.Kilogram or UnitOfMeasure.Liter => Math.Round(quantity, 1),
        _ => Math.Round(quantity, 0),
    };
}
