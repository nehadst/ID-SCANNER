@startuml
actor User
participant "Scan Page" as ScanPage
participant "ID Scanner Component" as IDScanner
participant "/api/scan-id/extract" as ExtractAPI
participant "GPT-4o API" as GPT4o
participant "/api/minimal-save-form" as SaveAPI
participant Database
participant Dashboard

' User initiates ID scanning
User -> ScanPage : Navigate to Scan Page
ScanPage -> User : Display scan options (Camera/Manual)

alt Camera Scanning
    User -> ScanPage : Select "Camera Scan"
    ScanPage -> IDScanner : Activate camera
    IDScanner -> User : Display camera view
    User -> IDScanner : Position ID document
    User -> IDScanner : Click "Capture ID"
    IDScanner -> IDScanner : Capture image
    IDScanner -> User : Display captured image
    User -> IDScanner : Click "Process ID"
    IDScanner -> ExtractAPI : Send image data via POST
    ExtractAPI -> GPT4o : Send image for text extraction
    GPT4o -> ExtractAPI : Return extracted text and structured data
    ExtractAPI -> IDScanner : Return extracted data
    IDScanner -> ScanPage : Update form with extracted data
else Manual Entry
    User -> ScanPage : Select "Manual Entry"
    User -> ScanPage : Fill form fields manually
end

' Form submission and data saving
User -> ScanPage : Click "SAVE INFORMATION"
ScanPage -> ScanPage : Validate required fields

alt Validation Failed
    ScanPage -> User : Display alert with error message
else Validation Passed
    ScanPage -> SaveAPI : Redirect to SaveAPI with form data as URL params
    
    SaveAPI -> Database : Check for duplicate ID
    
    alt Duplicate ID Found
        Database -> SaveAPI : Return existing record
        SaveAPI -> User : Display duplicate ID error page
    else No Duplicate Found
        SaveAPI -> Database : Save new record
        Database -> SaveAPI : Confirm save
        SaveAPI -> Database : Fetch recent records
        Database -> SaveAPI : Return recent records
        SaveAPI -> User : Display success page with data and recent records
    end
end

' Viewing dashboard
User -> Dashboard : Navigate to Dashboard
Dashboard -> UsersAPI : Request all records
UsersAPI -> Database : Fetch all records
Database -> UsersAPI : Return records
UsersAPI -> Dashboard : Return JSON data
Dashboard -> User : Display records table

@enduml 