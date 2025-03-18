# ID Scanner Class Diagram

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam classFontStyle bold
skinparam classBackgroundColor #f0f8ff
skinparam classBorderColor #2c3e50
skinparam arrowColor #2c3e50

package "Frontend Components" {
    class Navigation {
        - isMobileMenuOpen: boolean
        - pathname: string
        + isActive(path: string): boolean
        + render(): ReactNode
    }

    class IDScanner {
        - webcamRef: Ref<Webcam>
        - isCapturing: boolean
        - capturedImage: string
        - isProcessing: boolean
        - error: string
        - scanMethod: 'camera' | 'upload' | null
        - selectedFileName: string | null
        + captureImage(): void
        + handleFileUpload(event): void
        + resetState(): void
        + retakeImage(): void
        + processImage(): void
        + render(): ReactNode
    }

    class ScanPage {
        - formData: FormData
        - isScanning: boolean
        - isSubmitting: boolean
        - errorMessage: string
        + handleDataExtracted(data): void
        + handleInputChange(event): void
        + render(): ReactNode
    }

    class DashboardPage {
        - users: User[]
        - loading: boolean
        - error: string
        + fetchUsers(): void
        + render(): ReactNode
    }
}

package "API Routes" {
    class ExtractAPI {
        + POST(request): Response
        - processImage(image): ExtractedData
        - callGPT4oAPI(image): Promise<AIResponse>
        - parseAIResponse(response): ExtractedData
        - formatResponse(data): Response
    }

    class SaveAPI {
        + GET(request): Response
        - validateFields(data): boolean
        - checkDuplicateID(id): Promise<User | null>
        - createUser(data): Promise<User>
        - getRecentRecords(): Promise<User[]>
        - generateSuccessResponse(user, records): Response
        - generateErrorResponse(error): Response
    }

    class UsersAPI {
        + GET(request): Response
        - getAllUsers(): Promise<User[]>
    }
}

package "External Services" {
    class GPT4oAPI {
        + analyzeImage(imageData): Promise<AIResponse>
    }
    
    class AIResponse {
        + extractedText: string
        + structuredData: object
    }
}

package "Data Models" {
    class User {
        + id: string
        + fullName: string
        + idNumber: string
        + dateOfBirth: string
        + expiryDate: string | null
        + address: string | null
        + photoUrl: string | null
        + createdAt: Date
    }

    class FormData {
        + fullName: string
        + idNumber: string
        + dateOfBirth: string
        + expiryDate: string
        + address: string
    }

    class ExtractedData {
        + fullName: string
        + idNumber: string
        + dateOfBirth: string
        + expiryDate: string
        + address: string
    }
}

' Relationships
IDScanner "1" --> "1" ExtractAPI : sends image to >
IDScanner "1" --> "1" ScanPage : updates form in >
ScanPage "1" --> "1" SaveAPI : submits form to >
ScanPage "1" *-- "1" FormData : contains >
DashboardPage "1" --> "1" UsersAPI : requests data from >
SaveAPI "1" --> "*" User : creates/reads >
UsersAPI "1" --> "*" User : retrieves >
ExtractAPI "1" ..> ExtractedData : produces >
ExtractAPI "1" --> "1" GPT4oAPI : calls >
GPT4oAPI ..> AIResponse : produces >
SaveAPI "1" ..> FormData : processes >

@enduml
```

## Class Descriptions

### Frontend Components

1. **Navigation**
   - Manages the application navigation menu
   - Handles responsive behavior for mobile devices
   - Tracks current page state for highlighting active links

2. **IDScanner**
   - Manages camera access and image capture
   - Handles file uploads as alternative to camera
   - Processes captured images and extracts data
   - Communicates with the Extract API

3. **ScanPage**
   - Provides UI for ID document scanning and manual data entry
   - Manages form state and validation
   - Toggles between camera scanning and manual entry
   - Submits data to Save API

4. **DashboardPage**
   - Displays table of all saved records
   - Manages data fetching and loading states
   - Handles error conditions for database connection

### API Routes

1. **ExtractAPI**
   - Processes image data from ID Scanner
   - Communicates with GPT-4o API for text extraction
   - Parses AI response into structured data
   - Returns extracted information to the frontend

2. **SaveAPI**
   - Validates incoming form data
   - Checks for duplicate ID numbers
   - Persists data to database through Prisma
   - Generates appropriate HTML responses for success/error

3. **UsersAPI**
   - Retrieves user records from database
   - Sorts and formats data for dashboard display
   - Returns JSON data for frontend consumption

### External Services

1. **GPT4oAPI**
   - Analyzes image data and extracts text and structured data
   - Returns processed information to the Extract API

### Data Models

1. **User**
   - Represents the database model for stored ID information
   - Contains all fields required for ID records
   - Used for persistence and retrieval operations

2. **FormData**
   - Represents the structure of form input on the Scan page
   - Contains fields that match the User model
   - Used for temporary state in the UI before submission

3. **ExtractedData**
   - Represents structured data extracted from ID images
   - Maps to form fields for automatic population
   - Intermediate format between image processing and form display 