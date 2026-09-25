namespace ERP.Domain.Enums;

public enum SalesOrderStatus
{
    Draft = 0,
    StockChecked = 1,
    Confirmed = 2,
    AwaitingPayment = 3,
    Paid = 4,
    Receipted = 5,
    Preparing = 6,
    ReadyToShip = 7,
    Shipped = 8,
    Completed = 9,
    Cancelled = 10
}

