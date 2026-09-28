using MioDolce.Domain.Common;

namespace MioDolce.Domain.Tests.Common;

public sealed class ResultTests
{
    private static readonly Error SomeError = Error.Conflict("Test.Conflict", "conflito");

    [Fact]
    public void ImplicitConversion_FromValue_CreatesSuccess()
    {
        Result<int> result = 42;

        Assert.True(result.IsSuccess);
        Assert.Equal(42, result.Value);
    }

    [Fact]
    public void ImplicitConversion_FromError_CreatesFailure()
    {
        Result<int> result = SomeError;

        Assert.True(result.IsFailure);
        Assert.Equal(SomeError, result.Error);
    }

    [Fact]
    public void Value_OnFailure_Throws()
    {
        Result<int> result = SomeError;

        Assert.Throws<InvalidOperationException>(() => result.Value);
    }
}
