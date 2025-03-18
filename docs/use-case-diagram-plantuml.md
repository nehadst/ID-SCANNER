@startuml
left to right direction
skinparam actorStyle awesome

actor "User" as User
actor "GPT-4o API" as GPT4o

rectangle "ID Scanner Application" {
  usecase "Navigate between pages" as UC1
  usecase "Scan ID using camera" as UC2
  usecase "Enter ID information manually" as UC3
  usecase "Save ID information" as UC4
  usecase "View all ID records" as UC5
  usecase "View record details" as UC6
  usecase "Handle duplicate IDs" as UC7
  usecase "Validate input data" as UC8
  usecase "Extract data from ID image" as UC9
  usecase "Process image with AI" as UC10
}

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6

GPT4o --> UC10

UC2 ..> UC9 : includes
UC9 ..> UC10 : includes
UC10 ..> UC3 : extends
UC3 ..> UC8 : includes
UC8 ..> UC4 : includes
UC4 ..> UC7 : may include
@enduml 

## Use Case Descriptions

### Primary Use Cases

1. **Navigate between pages**
   - **Actor**: User
   - **Description**: Users can navigate between the scan page and dashboard using the navigation menu.
   - **Flow**: User clicks on navigation links to move between different sections of the application.

2. **Scan ID using camera**
   - **Actor**: User
   - **Description**: Capture an image of an ID document using the device's camera.
   - **Flow**: User selects "Camera Scan", positions ID document, captures image, then processes it.
   - **Preconditions**: Device has a working camera and appropriate permissions.

3. **Enter ID information manually**
   - **Actor**: User
   - **Description**: Input ID information through form fields.
   - **Flow**: User selects "Manual Entry", fills in required fields (Name, ID Number, DOB) and optional fields.
   - **Alternative Flow**: Form is pre-filled with data extracted from scanned image.

4. **Save ID information**
   - **Actor**: User
   - **Description**: Save completed ID information to the database.
   - **Flow**: User clicks "SAVE INFORMATION" after completing form, system validates data and saves to database.
   - **Postconditions**: Record is saved and success page is shown with record details.

5. **View all ID records**
   - **Actor**: User
   - **Description**: View a list of all saved ID records in a table format.
   - **Flow**: User navigates to Dashboard page to see records sorted by most recent first.

6. **View record details**
   - **Actor**: User
   - **Description**: View detailed information about a specific ID record.
   - **Flow**: From the dashboard, user clicks "View Details" on a specific record to see full information.

### Supporting Use Cases

7. **Handle duplicate IDs**
   - **Description**: System detects and prevents duplicate ID numbers from being saved.
   - **Flow**: When saving, if ID already exists, system shows error page with existing record details.

8. **Validate input data**
   - **Description**: Ensure required fields are completed and data format is correct.
   - **Flow**: System validates form data before submission and displays errors if validation fails.

9. **Extract data from ID image**
   - **Description**: Process captured image to extract ID information.
   - **Flow**: Scanned image is sent to API for processing, extracted data is returned and populated in form.

10. **Process image with AI**
    - **Actor**: GPT-4o API
    - **Description**: Analyze ID document image using artificial intelligence to extract text and structured data.
    - **Flow**: Image is sent to GPT-4o API, which processes the image, extracts relevant text, categorizes information (name, ID number, dates), and returns structured data.
    - **Preconditions**: Clear image of ID document, API connection available. 