# Transcript Request Service

A secure, FERPA-compliant web application for high school students to request official transcripts to be sent to colleges and universities. This service is completely free and integrates with the Parchment network for electronic transcript delivery.

## Features

- **Free Service**: No fees or charges for transcript requests
- **FERPA Compliant**: Full compliance with educational privacy requirements
- **Secure Processing**: Encrypted data transmission and storage
- **Electronic Delivery**: Fast processing through the Parchment network
- **User-Friendly**: Step-by-step guided form with validation
- **Mobile Responsive**: Works on all devices

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: SQLite (local) / Turso (production) with Drizzle ORM
- **Validation**: Zod for form validation
- **PESC Compliance**: Generates standard PESC XML for transcript requests
- **Deployment**: Netlify ready with zero configuration

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Git (optional, for version control)

### Installation

1. **Clone or download the project**
   ```bash
   git clone [repository-url]
   cd transcript-request
   ```

2. **Start the application**
   ```powershell
   # On Windows
   .\start.ps1
   
   # Or manually
   npm install
   npm run db:push
   npm run dev
   ```

3. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Start requesting transcripts!

## Environment Configuration

Create a `.env.local` file for production deployment:

```env
# Database (for production use Turso)
DATABASE_URL="libsql://[your-database].turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# Parchment SFTP (for production)
PARCHMENT_SFTP_HOST="sftp.parchment.com"
PARCHMENT_SFTP_USERNAME="your-username"
PARCHMENT_SFTP_PASSWORD="your-password"
PARCHMENT_SFTP_PATH="/incoming"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
ENCRYPTION_SECRET="your-secret-key"
```

## Usage Flow

1. **Student Information**: Personal details as they appear on school records
2. **School Information**: Current high school details and attendance info
3. **Destination**: Where to send the transcript (college/university)
4. **Consent**: FERPA disclosure and authorization
5. **Submission**: Secure processing and delivery

## Compliance & Security

- **FERPA Compliance**: Full disclosure and consent process
- **Data Encryption**: Secure transmission and storage
- **Audit Trail**: Complete logging for compliance reporting
- **Privacy Protection**: Minimal data collection, secure handling
- **Access Controls**: No unauthorized access to student records

## API Routes

- `POST /api/submit-request` - Submit transcript request
- Request validation with Zod schemas
- PESC XML generation
- Database logging for audit trail

## Database Schema

Key tables:
- `transcript_requests` - Main request records with full audit trail
- Includes student info, school details, consent tracking, and processing status

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Database commands
npm run db:push      # Apply schema changes
npm run db:generate  # Generate migrations

# Linting
npm run lint
```

## Production Deployment

### Netlify Deployment

1. **Build configuration** (automatically detected):
   ```toml
   [build]
   command = "npm run build"
   publish = ".next"
   ```

2. **Environment variables**: Set in Netlify dashboard
   - `DATABASE_URL`
   - `TURSO_AUTH_TOKEN` 
   - `PARCHMENT_SFTP_*` variables

3. **Deploy**: 
   ```bash
   npm run build
   # Push to Git repository connected to Netlify
   ```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   npm start
   ```

2. **Database setup**: Initialize Turso database and run migrations

3. **SFTP setup**: Configure Parchment SFTP credentials

## File Structure

```
transcript-request/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── request/        # Request form page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── form-steps/     # Multi-step form components
│   │   └── TranscriptRequestForm.tsx
│   └── lib/                # Utility libraries
│       ├── validation.ts   # Zod schemas
│       └── pesc-xml-generator.ts
├── db/                     # Database schema and config
├── drizzle.config.ts      # Drizzle ORM configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── start.ps1             # Startup script
```

## PESC Standards Compliance

This application generates XML that complies with:
- PESC TranscriptRequest v1.2.0
- PESC High School Transcript v1.3.0
- Parchment User Defined Extensions v1.0.0

## Support & Troubleshooting

### Common Issues

1. **Database connection**: Ensure `.data` directory exists and is writable
2. **Port conflicts**: Change port in `package.json` if 3000 is in use
3. **Environment variables**: Check `.env.local` file exists and is properly formatted

### Development Notes

- Form validation happens on both client and server
- Database uses optimistic updates for better UX
- PESC XML generation follows official specifications
- All sensitive operations are server-side only

## License

This project is provided free of charge for educational institutions and students requesting transcripts. Commercial use requires permission.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper testing
4. Submit a pull request

## Security

If you discover security vulnerabilities, please report them privately to the maintainers.