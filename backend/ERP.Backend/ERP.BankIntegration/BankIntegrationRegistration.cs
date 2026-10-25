using ERP.BankIntegration.Clients;
using ERP.BankIntegration.Configuration;
using ERP.BankIntegration.Endpoints;
using ERP.BankIntegration.Services;
using ERP.BankIntegration.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ERP.BankIntegration;

public static class BankIntegrationRegistration
{
    public static IServiceCollection AddBankIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<BankIntegrationOptions>().Bind(configuration.GetSection(BankIntegrationOptions.SectionName))
            .Validate(o => o.Mode is "Mock" or "SandboxHttp", "BankIntegration:Mode must be Mock or SandboxHttp.")
            .Validate(o => o.TimeoutSeconds is >= 1 and <= 60, "TimeoutSeconds must be between 1 and 60.")
            .Validate(o => o.Mode != "SandboxHttp" || ValidSandboxUrl(o.SandboxBaseUrl), "SandboxBaseUrl must be HTTPS, or HTTP on localhost, with a trailing slash and no credentials/query/fragment.")
            .ValidateOnStart();
        services.AddSingleton<BankExchangeStore>();
        services.AddScoped<BankExchangeService>();
        services.AddScoped<BankDevelopmentOnlyFilter>();
        services.AddHttpClient<SandboxHttpBankClient>((sp, http) =>
        {
            var options = sp.GetRequiredService<IOptions<BankIntegrationOptions>>().Value;
            http.BaseAddress = new Uri(options.SandboxBaseUrl);
            http.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
            if (!string.IsNullOrWhiteSpace(options.SandboxApiKey)) http.DefaultRequestHeaders.Add("X-Sandbox-Api-Key", options.SandboxApiKey);
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false });
        services.AddScoped<IBankClient>(sp => sp.GetRequiredService<IOptions<BankIntegrationOptions>>().Value.Mode == "Mock"
            ? new MockBankClient() : sp.GetRequiredService<SandboxHttpBankClient>());
        services.AddControllers().AddApplicationPart(typeof(BankPaymentsController).Assembly);
        return services;
    }

    private static bool ValidSandboxUrl(string value) => Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == "https" || (uri.Scheme == "http" && uri.IsLoopback))
        && uri.UserInfo.Length == 0 && uri.Query.Length == 0 && uri.Fragment.Length == 0 && value.EndsWith('/');
}
