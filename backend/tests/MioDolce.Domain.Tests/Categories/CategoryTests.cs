using MioDolce.Domain.Categories;

namespace MioDolce.Domain.Tests.Categories;

public sealed class CategoryTests
{
    [Fact]
    public void Create_TrimsValuesAndTurnsBlankDescriptionIntoNull()
    {
        var category = Category.Create("  Chocolates  ", "   ");

        Assert.Equal("Chocolates", category.Name);
        Assert.Null(category.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankName_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() => Category.Create(name, null));
    }

    [Fact]
    public void Create_WithNameAboveLimit_Throws()
    {
        var tooLong = new string('a', Category.NameMaxLength + 1);

        Assert.Throws<ArgumentOutOfRangeException>(() => Category.Create(tooLong, null));
    }
}
