export enum eAssetStatus {
    Active = 10,
    InMaintenance = 20,
    Inactive = 30,
    Decommissioned = 40,
    Reserved = 50,
    Damaged = 60,
    OnLoan = 70,
    InStorage = 80,
}

export enum eAssetType {
    Vehicle = 10,
    Equipment = 20,
    Machinery = 30,
    Building = 40,
    Furniture = 50,
    ITHardware = 60,
    Software = 70,
}

export enum eEquipmentStatus {
    InService = 10,
    Active = 20,
    Inactive = 30,
    OutOfService = 40,
    PendingRepair = 50,
}

export enum eEquipmentType {
    GPSDevice = 10,
    DashCamera = 20,
    TelematicsUnit = 30,
    FuelSensor = 40,
    BatteryMonitor = 50,
    Tablet = 60,
    Radio = 70,
    Other = 100,
}

export enum eExpenseFrequency {
    SingleExpense = 1,
    RecurringExpense = 2,
}

export enum eExpenseType {
    Fuel = 10,
    Maintenance = 20,
    Insurance = 30,
    Registration = 40,
    Depreciation = 50,
    LoanPayments = 60,
    Taxes = 70,
    Licensing = 80,
    Repairs = 90,
    Tolls = 100,
    Leasing = 110,
    FinesOrPenalties = 120,
    AccessoriesOrUpgrades = 130,
    Cleaning = 140,
    Storage = 150,
    Miscellaneous = 160,
}

export enum eFuelType {
    Petrol = 10,
    Diesel = 20,
    Electric = 30,
    Hybrid = 40,
    CNG = 50,
    LPG = 60,
    Biofuel = 70,
    Hydrogen = 80,
    FlexFuel = 90,
}

export enum ePriority {
    Low = 10,
    Medium = 20,
    High = 30,
    NoPriority = 40,
}

export enum eRenewalType {
    Registration = 10,
    Inspection = 20,
    Insurance = 30,
    Warranty = 40,
    Permit = 50,
}

export enum eRole {
    SuperAdmin = 10,
    CompanyAdmin = 20,
    CFO = 30,
    RegionalManager = 40,
    LocalManager = 50,
    Employee = 60,
}

export enum eServiceStatus {
    Upcoming = 10,
    DueSoon = 20,
    Overdue = 30,
}

export enum eTaskStatus {
    NotStarted = 10,
    InProgress = 20,
    Completed = 30,
    OnHold = 40,
    Canceled = 50,
}

export enum eTicketStatus {
    Open = 10,
    InProgress = 20,
    OnHold = 30,
    Resolved = 40,
    Closed = 50,
    Reopened = 60,
}

export enum eVehicleType {
    Sedan = 10,
    SUV = 20,
    PickupTruck = 30,
    Van = 40,
    Motorcycle = 50,
    ElectricCar = 60,
    HybridCar = 70,
    Bus = 80,
    Truck = 90,
    Convertible = 100,
    Coupe = 110
}

export enum FinancialType {
    None = 10,
    Loan = 20,
    Lease = 30,
}

export enum RenewalStatus {
    Upcoming = 10,
    DueSoon = 20,
    Overdue = 30,
}