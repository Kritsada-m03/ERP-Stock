using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace ERP.Application.Validators;

// Keep in sync with shared/validators/customer-validation.ts in the frontend.
[AttributeUsage(AttributeTargets.Property)]
public sealed class CustomerFieldAttribute(string field) : ValidationAttribute
{
    private static readonly Dictionary<string, (string Label, int Max, bool Required)> Rules = new()
    {
        ["code"] = ("รหัสลูกค้า", 30, true), ["name"] = ("ชื่อลูกค้า / บริษัท", 200, true),
        ["contactName"] = ("ชื่อผู้ติดต่อ", 200, false), ["phone"] = ("เบอร์โทรศัพท์", 30, false),
        ["email"] = ("อีเมล", 254, false), ["taxId"] = ("เลขประจำตัวผู้เสียภาษี", 13, false),
        ["address"] = ("ที่อยู่", 1000, true), ["notes"] = ("หมายเหตุ", 1000, false)
    };
    private const string EmailPattern = @"\A[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}\z";

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var text = (value as string ?? "").Trim();
        var rule = Rules[field];
        string? error = null;
        if (text.Length == 0) error = rule.Required ? $"กรุณากรอก{rule.Label}" : null;
        else if (text.Length > rule.Max) error = $"{rule.Label}ต้องไม่เกิน {rule.Max} ตัวอักษร";
        else if (field == "code" && !Matches(text, @"\A[A-Za-z0-9_-]+\z"))
            error = "รหัสลูกค้าใช้ A–Z, 0–9, ขีดกลาง (-) และขีดล่าง (_) เท่านั้น";
        else if (field == "phone")
        {
            var compact = text.Replace(" ", "").Replace("-", "");
            var domestic = compact.StartsWith("+66", StringComparison.Ordinal) ? "0" + compact[3..] : compact;
            if (!Matches(text, @"\A[+0-9 -]+\z") || !Matches(domestic, @"\A(?:0[23457][0-9]{7}|0[689][0-9]{8})\z"))
                error = "กรอกเบอร์ไทย 9–10 หลัก เช่น 02-123-4567, 081-234-5678 หรือ +66 81 234 5678";
        }
        else if (field == "email" && (!Matches(text, EmailPattern) || text.Split('@')[0].Length > 64))
            error = "กรอกอีเมลให้ถูกต้อง เช่น name@example.com";
        else if (field == "taxId" && !Matches(text, @"\A[0-9]{13}\z"))
            error = "เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก";
        return error is null ? ValidationResult.Success : new ValidationResult(error, [validationContext.MemberName ?? field]);
    }

    private static bool Matches(string text, string pattern) => Regex.IsMatch(text, pattern, RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(100));
}
