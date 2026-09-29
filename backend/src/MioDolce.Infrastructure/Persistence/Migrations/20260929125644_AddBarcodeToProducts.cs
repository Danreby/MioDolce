using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MioDolce.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBarcodeToProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Barcode",
                table: "products",
                type: "varchar(14)",
                maxLength: 14,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_Barcode",
                table: "products",
                column: "Barcode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_products_Barcode",
                table: "products");

            migrationBuilder.DropColumn(
                name: "Barcode",
                table: "products");
        }
    }
}
