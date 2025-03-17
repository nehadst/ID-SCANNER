# ID Scanner Application

A web application that scans ID documents using a camera or file upload, automatically extracts information using OpenAI GPT-4o Vision, and stores the data in a PostgreSQL database.

## Features

- **Multiple Input Methods**: Capture ID via webcam or upload document images
- **AI-Powered Extraction**: Uses OpenAI GPT-4o Vision to extract information from IDs
- **Database Storage**: Stores extracted information in SQLite (local) or PostgreSQL (cloud)
- **Dashboard**: View all scanned IDs in a convenient dashboard
- **Modern UI**: Built with Next.js and Tailwind CSS for a responsive experience

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite (local dev) or PostgreSQL (production)
- **AI/ML**: OpenAI GPT-4o Vision for intelligent document analysis
- **ORM**: Prisma for database access

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Environment Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY="your-openai-api-key"
   ```
   
   By default, the app uses SQLite for local development. To use PostgreSQL on GCP, see [GCP_SETUP.md](./GCP_SETUP.md).

### Running the Application

Development mode:
```
cd take-home-assignment
npm run dev
```

Production build:
```
npm run build
npm start
```

## Database Options

### Local Development with SQLite

The application uses SQLite by default for ease of setup. No additional configuration is needed.

### Production with PostgreSQL on GCP

For production, we recommend using PostgreSQL on Google Cloud Platform:

1. Set up a PostgreSQL instance on GCP (see [GCP_SETUP.md](./GCP_SETUP.md))
2. Update the `.env` file with your GCP PostgreSQL connection string
3. Change the `provider` in `prisma/schema.prisma` from "sqlite" to "postgresql"
4. Run `npx prisma db push` to synchronize the schema

## Implementation Notes

- The application uses OpenAI's GPT-4o Vision to analyze ID documents and extract relevant information
- GPT-4o is capable of understanding various ID formats and layouts without specific training
- For production use, you may want to implement additional validation logic
- The connection to the database is managed through Prisma ORM for type safety and query efficiency

## Future Enhancements

- Support for multiple ID formats (driver's licenses, passports, etc.)
- Enhanced security with user authentication
- Custom validation rules for specific ID formats
- Integration with other verification services
