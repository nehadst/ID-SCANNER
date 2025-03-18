@startuml
actor User
participant "Scan Page" as ScanPage
participant "ID Scanner Component" as IDScanner
participant "/api/scan-id/extract" as ExtractAPI
participant "GPT-4o API" as GPT4o
participant "/api/minimal-save-form" as SaveAPI
participant "UsersAPI" as UsersAPI
participant Database
participant Dashboard

title ID Scanner Application - Sequence Diagram

== Initialization ==
User -> ScanPage : Navigate to Scan Page
ScanPage -> User : Display scan options (Camera/Manual)

== ID Information Input ==
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
else File Upload
    User -> ScanPage : Open ID Scanner
    ScanPage -> IDScanner : Display scanner options
    User -> IDScanner : Choose "Upload Document"
    User -> IDScanner : Select ID document file
    IDScanner -> User : Display selected image
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

note right of User
  Regardless of input method,
  the user now has form fields filled
  either by AI extraction or manually
end note

== Form Submission and Validation ==
User -> ScanPage : Click "SAVE INFORMATION"
ScanPage -> ScanPage : Validate required fields

alt Validation Failed
    ScanPage -> User : Display alert with error message
    User -> ScanPage : Correct form data
    User -> ScanPage : Attempt to save again
else Validation Passed
    ScanPage -> SaveAPI : Redirect to SaveAPI with form data as URL params
    
    SaveAPI -> Database : Check for duplicate ID
    
    alt Duplicate ID Found
        Database -> SaveAPI : Return existing record
        SaveAPI -> User : Display duplicate ID error page
        User -> ScanPage : Return to form to modify ID
    else No Duplicate Found
        SaveAPI -> Database : Save new record
        Database -> SaveAPI : Confirm save
        SaveAPI -> Database : Fetch recent records
        Database -> SaveAPI : Return recent records
        SaveAPI -> User : Display success page with data and recent records
    end
end

== Dashboard View ==
User -> Dashboard : Navigate to Dashboard
Dashboard -> UsersAPI : Request all records
UsersAPI -> Database : Fetch all records
Database -> UsersAPI : Return records
UsersAPI -> Dashboard : Return JSON data
Dashboard -> User : Display records table

@enduml 