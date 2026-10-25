using ERP.API.Extensions;
using ERP.BankIntegration;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddErpServices(builder.Configuration);
builder.Services.AddBankIntegration(builder.Configuration);

var app = builder.Build();
app.UseExceptionHandler();
app.MapControllers();
// Schema changes are applied explicitly through EF migrations, never on startup.
app.Run();

