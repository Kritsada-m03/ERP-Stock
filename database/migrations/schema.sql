IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Customers] (
        [Id] uniqueidentifier NOT NULL,
        [Code] nvarchar(30) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Phone] nvarchar(30) NULL,
        [Email] nvarchar(254) NULL,
        [Address] nvarchar(1000) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [ProductCategories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_ProductCategories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [UserName] nvarchar(100) NOT NULL,
        [DisplayName] nvarchar(200) NOT NULL,
        [Email] nvarchar(254) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Warehouses] (
        [Id] uniqueidentifier NOT NULL,
        [Code] nvarchar(30) NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Warehouses] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] uniqueidentifier NOT NULL,
        [Sku] nvarchar(50) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Barcode] nvarchar(100) NULL,
        [ProductCategoryId] uniqueidentifier NOT NULL,
        [UnitName] nvarchar(50) NOT NULL,
        [SalePrice] decimal(18,2) NOT NULL,
        [ReorderPoint] decimal(18,3) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Products_ReorderPoint] CHECK ([ReorderPoint] >= 0),
        CONSTRAINT [CK_Products_SalePrice] CHECK ([SalePrice] >= 0),
        CONSTRAINT [FK_Products_ProductCategories_ProductCategoryId] FOREIGN KEY ([ProductCategoryId]) REFERENCES [ProductCategories] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [SalesOrders] (
        [Id] uniqueidentifier NOT NULL,
        [OrderNo] nvarchar(30) NOT NULL,
        [CustomerId] uniqueidentifier NOT NULL,
        [WarehouseId] uniqueidentifier NOT NULL,
        [CreatedByUserId] uniqueidentifier NOT NULL,
        [OrderDate] date NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [CustomerNameSnapshot] nvarchar(200) NOT NULL,
        [DeliveryAddressSnapshot] nvarchar(1000) NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        [DiscountAmount] decimal(18,2) NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [ConfirmedAtUtc] datetime2 NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_SalesOrders] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_SalesOrders_Amounts] CHECK ([Subtotal] >= 0 AND [DiscountAmount] >= 0 AND [DiscountAmount] <= [Subtotal] AND [TotalAmount] = [Subtotal] - [DiscountAmount]),
        CONSTRAINT [CK_SalesOrders_Status] CHECK ([Status] IN ('Draft', 'StockChecked', 'Confirmed', 'AwaitingPayment', 'Paid', 'Receipted', 'Preparing', 'ReadyToShip', 'Shipped', 'Completed', 'Cancelled')),
        CONSTRAINT [FK_SalesOrders_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SalesOrders_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SalesOrders_Warehouses_WarehouseId] FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Stocks] (
        [Id] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [WarehouseId] uniqueidentifier NOT NULL,
        [OnHandQuantity] decimal(18,3) NOT NULL,
        [ReservedQuantity] decimal(18,3) NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Stocks] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Stocks_Quantities] CHECK ([OnHandQuantity] >= 0 AND [ReservedQuantity] >= 0 AND [ReservedQuantity] <= [OnHandQuantity]),
        CONSTRAINT [FK_Stocks_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Stocks_Warehouses_WarehouseId] FOREIGN KEY ([WarehouseId]) REFERENCES [Warehouses] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Deliveries] (
        [Id] uniqueidentifier NOT NULL,
        [DeliveryNo] nvarchar(30) NOT NULL,
        [SalesOrderId] uniqueidentifier NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [RecipientNameSnapshot] nvarchar(200) NOT NULL,
        [AddressSnapshot] nvarchar(1000) NOT NULL,
        [TrackingNo] nvarchar(100) NULL,
        [PreparedAtUtc] datetime2 NULL,
        [DocumentIssuedAtUtc] datetime2 NULL,
        [IssuedByUserId] uniqueidentifier NULL,
        [ShippedAtUtc] datetime2 NULL,
        [ShippedByUserId] uniqueidentifier NULL,
        [StockDeductedAtUtc] datetime2 NULL,
        [SnapshotVersion] int NOT NULL,
        [DocumentSnapshotJson] nvarchar(max) NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Deliveries] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Deliveries_Snapshot] CHECK (([DocumentSnapshotJson] IS NULL OR ISJSON([DocumentSnapshotJson]) = 1) AND [SnapshotVersion] > 0),
        CONSTRAINT [CK_Deliveries_Status] CHECK ([Status] IN ('Preparing', 'ReadyToShip', 'Shipped', 'Completed')),
        CONSTRAINT [FK_Deliveries_SalesOrders_SalesOrderId] FOREIGN KEY ([SalesOrderId]) REFERENCES [SalesOrders] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Deliveries_Users_IssuedByUserId] FOREIGN KEY ([IssuedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Deliveries_Users_ShippedByUserId] FOREIGN KEY ([ShippedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Payments] (
        [Id] uniqueidentifier NOT NULL,
        [SalesOrderId] uniqueidentifier NOT NULL,
        [PaymentNo] nvarchar(30) NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [Status] nvarchar(30) NOT NULL,
        [QrPayload] nvarchar(2000) NULL,
        [RecipientSnapshot] nvarchar(1000) NULL,
        [ProviderReference] nvarchar(200) NULL,
        [BankTransactionReference] nvarchar(200) NULL,
        [EvidenceStorageKey] nvarchar(500) NULL,
        [ExpiresAtUtc] datetime2 NULL,
        [VerifiedAtUtc] datetime2 NULL,
        [VerifiedByUserId] uniqueidentifier NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
        CONSTRAINT [AK_Payments_Id_SalesOrderId] UNIQUE ([Id], [SalesOrderId]),
        CONSTRAINT [CK_Payments_Amount] CHECK ([Amount] > 0),
        CONSTRAINT [CK_Payments_Currency] CHECK ([Currency] = 'THB'),
        CONSTRAINT [CK_Payments_Status] CHECK ([Status] IN ('Pending', 'Verified', 'Rejected', 'Expired', 'Cancelled')),
        CONSTRAINT [FK_Payments_SalesOrders_SalesOrderId] FOREIGN KEY ([SalesOrderId]) REFERENCES [SalesOrders] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Payments_Users_VerifiedByUserId] FOREIGN KEY ([VerifiedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [SalesOrderItems] (
        [Id] uniqueidentifier NOT NULL,
        [SalesOrderId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [LineNo] int NOT NULL,
        [SkuSnapshot] nvarchar(50) NOT NULL,
        [ProductNameSnapshot] nvarchar(200) NOT NULL,
        [UnitNameSnapshot] nvarchar(50) NOT NULL,
        [Quantity] decimal(18,3) NOT NULL,
        [ReservedQuantity] decimal(18,3) NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [DiscountAmount] decimal(18,2) NOT NULL,
        [LineTotal] decimal(18,2) NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_SalesOrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_SalesOrderItems_Amounts] CHECK ([UnitPrice] >= 0 AND [DiscountAmount] >= 0 AND [LineTotal] >= 0),
        CONSTRAINT [CK_SalesOrderItems_LineNo] CHECK ([LineNo] > 0),
        CONSTRAINT [CK_SalesOrderItems_Quantity] CHECK ([Quantity] > 0 AND [ReservedQuantity] >= 0 AND [ReservedQuantity] <= [Quantity]),
        CONSTRAINT [FK_SalesOrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SalesOrderItems_SalesOrders_SalesOrderId] FOREIGN KEY ([SalesOrderId]) REFERENCES [SalesOrders] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [StockTransactions] (
        [Id] uniqueidentifier NOT NULL,
        [StockId] uniqueidentifier NOT NULL,
        [SalesOrderId] uniqueidentifier NULL,
        [DeliveryId] uniqueidentifier NULL,
        [PerformedByUserId] uniqueidentifier NOT NULL,
        [Type] nvarchar(30) NOT NULL,
        [QuantityDelta] decimal(18,3) NOT NULL,
        [Reason] nvarchar(500) NOT NULL,
        [OperationKey] nvarchar(100) NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_StockTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_StockTransactions_QuantityDelta] CHECK ([QuantityDelta] <> 0),
        CONSTRAINT [CK_StockTransactions_Type] CHECK ([Type] IN ('Receive', 'Adjustment', 'Dispatch')),
        CONSTRAINT [FK_StockTransactions_Deliveries_DeliveryId] FOREIGN KEY ([DeliveryId]) REFERENCES [Deliveries] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_StockTransactions_SalesOrders_SalesOrderId] FOREIGN KEY ([SalesOrderId]) REFERENCES [SalesOrders] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_StockTransactions_Stocks_StockId] FOREIGN KEY ([StockId]) REFERENCES [Stocks] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_StockTransactions_Users_PerformedByUserId] FOREIGN KEY ([PerformedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE TABLE [Receipts] (
        [Id] uniqueidentifier NOT NULL,
        [ReceiptNo] nvarchar(30) NOT NULL,
        [SalesOrderId] uniqueidentifier NOT NULL,
        [PaymentId] uniqueidentifier NOT NULL,
        [IssuedByUserId] uniqueidentifier NOT NULL,
        [IssuedDate] date NOT NULL,
        [IssuedAtUtc] datetime2 NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [SnapshotVersion] int NOT NULL,
        [DocumentSnapshotJson] nvarchar(max) NOT NULL,
        [CreatedAtUtc] datetime2 NOT NULL,
        [UpdatedAtUtc] datetime2 NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Receipts] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Receipts_Snapshot] CHECK (ISJSON([DocumentSnapshotJson]) = 1 AND [SnapshotVersion] > 0),
        CONSTRAINT [CK_Receipts_TotalAmount] CHECK ([TotalAmount] > 0),
        CONSTRAINT [FK_Receipts_Payments_PaymentId_SalesOrderId] FOREIGN KEY ([PaymentId], [SalesOrderId]) REFERENCES [Payments] ([Id], [SalesOrderId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Receipts_SalesOrders_SalesOrderId] FOREIGN KEY ([SalesOrderId]) REFERENCES [SalesOrders] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Receipts_Users_IssuedByUserId] FOREIGN KEY ([IssuedByUserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Customers_Code] ON [Customers] ([Code]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Deliveries_DeliveryNo] ON [Deliveries] ([DeliveryNo]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Deliveries_IssuedByUserId] ON [Deliveries] ([IssuedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Deliveries_SalesOrderId] ON [Deliveries] ([SalesOrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Deliveries_ShippedByUserId] ON [Deliveries] ([ShippedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Payments_BankTransactionReference] ON [Payments] ([BankTransactionReference]) WHERE [BankTransactionReference] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Payments_PaymentNo] ON [Payments] ([PaymentNo]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Payments_SalesOrderId] ON [Payments] ([SalesOrderId]) WHERE [Status] = ''Verified''');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Payments_VerifiedByUserId] ON [Payments] ([VerifiedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_ProductCategoryId] ON [Products] ([ProductCategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Products_Sku] ON [Products] ([Sku]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Receipts_IssuedByUserId] ON [Receipts] ([IssuedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Receipts_PaymentId] ON [Receipts] ([PaymentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Receipts_PaymentId_SalesOrderId] ON [Receipts] ([PaymentId], [SalesOrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Receipts_ReceiptNo] ON [Receipts] ([ReceiptNo]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Receipts_SalesOrderId] ON [Receipts] ([SalesOrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SalesOrderItems_ProductId] ON [SalesOrderItems] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SalesOrderItems_SalesOrderId_LineNo] ON [SalesOrderItems] ([SalesOrderId], [LineNo]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SalesOrders_CreatedByUserId] ON [SalesOrders] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SalesOrders_CustomerId] ON [SalesOrders] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SalesOrders_OrderNo] ON [SalesOrders] ([OrderNo]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SalesOrders_Status_CreatedAtUtc] ON [SalesOrders] ([Status], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SalesOrders_WarehouseId] ON [SalesOrders] ([WarehouseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Stocks_ProductId_WarehouseId] ON [Stocks] ([ProductId], [WarehouseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Stocks_WarehouseId] ON [Stocks] ([WarehouseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_StockTransactions_DeliveryId] ON [StockTransactions] ([DeliveryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_StockTransactions_OperationKey] ON [StockTransactions] ([OperationKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_StockTransactions_PerformedByUserId] ON [StockTransactions] ([PerformedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_StockTransactions_SalesOrderId] ON [StockTransactions] ([SalesOrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_StockTransactions_StockId_CreatedAtUtc] ON [StockTransactions] ([StockId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_UserName] ON [Users] ([UserName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Warehouses_Code] ON [Warehouses] ([Code]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925111712_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260925111712_InitialCreate', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927104424_AddCustomerContactDetails'
)
BEGIN
    ALTER TABLE [Customers] ADD [ContactName] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927104424_AddCustomerContactDetails'
)
BEGIN
    ALTER TABLE [Customers] ADD [Notes] nvarchar(1000) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927104424_AddCustomerContactDetails'
)
BEGIN
    ALTER TABLE [Customers] ADD [TaxId] nvarchar(13) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927104424_AddCustomerContactDetails'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260927104424_AddCustomerContactDetails', N'10.0.11');
END;

COMMIT;
GO

