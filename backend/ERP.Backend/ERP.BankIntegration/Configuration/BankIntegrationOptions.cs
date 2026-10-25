namespace ERP.BankIntegration.Configuration;

public sealed class BankIntegrationOptions
{
    public const string SectionName = "BankIntegration";
    public bool Enabled { get; set; } = true;
    public string Mode { get; set; } = "Mock";
    public string SandboxBaseUrl { get; set; } = "";
    public string SandboxApiKey { get; set; } = "";
    public string CallbackKey { get; set; } = "";
    public int TimeoutSeconds { get; set; } = 15;
}
