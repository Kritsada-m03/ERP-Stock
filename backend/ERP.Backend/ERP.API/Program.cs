using ERP.API.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddErpServices(builder.Configuration);

var app = builder.Build();
app.UseExceptionHandler();
app.MapControllers();
// Schema changes are applied explicitly through EF migrations, never on startup.
app.Run();

