# Setting Up PostgreSQL on Google Cloud Platform

This guide will help you set up a PostgreSQL database on Google Cloud Platform (GCP) for use with the ID Scanner application.

## Prerequisites

- A Google Cloud Platform account
- Google Cloud SDK installed locally (optional, but helpful for troubleshooting)
- Basic familiarity with SQL and database concepts

## Step 1: Create a Cloud SQL Instance

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to "SQL" in the sidebar menu
4. Click "CREATE INSTANCE"
5. Select "PostgreSQL"
6. Complete the configuration form:
   - Give your instance a name (e.g., "id-scanner-db")
   - Set a secure password
   - Choose a region close to your users
   - Select a configuration (Shared core is sufficient for development)
   - You can leave most settings as defaults

## Step 2: Configure Network Access

1. In your SQL instance dashboard, go to the "Connections" tab
2. Under "Networking," choose "Add network" to add your application's IP address
3. For development, you can add your local IP address
4. For production, add your application server's IP address
5. Alternatively, you can enable the "Public IP" and use SSL/TLS

## Step 3: Create a Database

1. Go to "Databases" in your SQL instance dashboard
2. Click "CREATE DATABASE"
3. Name it "id_scanner" (or your preferred name)
4. Click "CREATE"

## Step 4: Create a User (Optional)

1. Go to "Users" in your SQL instance dashboard
2. Click "ADD USER ACCOUNT"
3. Create a dedicated user for your application with appropriate permissions
4. Note the username and password

## Step 5: Get Connection Details

Note the following information:
- Host: This is your instance's IP address
- Port: Usually 5432 for PostgreSQL
- Database name: "id_scanner" (or what you chose)
- Username: "postgres" (default) or your created user
- Password: The password you set

## Step 6: Update the Environment Variables

In your application's `.env` file, update the DATABASE_URL with your GCP connection information:

```
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Replace:
- USERNAME with your database username
- PASSWORD with your database password
- HOST with your Cloud SQL instance IP
- PORT with 5432
- DATABASE with your database name (e.g., id_scanner)

## Step 7: Deploy Schema

Run the following command to deploy your schema to the GCP database:

```
npx prisma db push
```

## Troubleshooting

### Connection Issues

If you can't connect to your database:

1. Check if the IP address of your application has been added to the allowed networks
2. Verify that your connection string is correct
3. Make sure the database user has appropriate permissions
4. Check if your Cloud SQL instance is running

### SSL Requirements

By default, Google Cloud SQL requires SSL connections. If you're having issues:

1. Go to "Connections" in your instance settings
2. Under "SSL," you can either:
   - Download the server certificate and configure your connection to use it
   - Temporarily disable the SSL requirement for testing (not recommended for production)

## Additional Resources

- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/connect-your-database-node-postgresql)
- [Connecting to Cloud SQL from external applications](https://cloud.google.com/sql/docs/postgres/connect-external-app) 