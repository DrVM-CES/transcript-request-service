# My Future Capacity - Transcript Request Service

A secure, FERPA-compliant web application for high school students to request official transcripts to be sent to colleges and universities. Part of the My Future Capacity platform, providing free transcript services to students.

**🌐 Live Site:** https://frolicking-horse-f44773.netlify.app

> **📚 For comprehensive project documentation**, see [`.memex/project_rules.md`](.memex/project_rules.md) - includes architecture, deployment patterns, lessons learned, and complete development guide.

## ✨ Features

### Core Functionality
- ✅ **Free Service**: No fees or charges for transcript requests
- ✅ **FERPA Compliant**: Full compliance with educational privacy requirements
- ✅ **Secure Processing**: Encrypted data transmission and storage
- ✅ **Electronic Delivery**: Fast processing through the Parchment network (production-ready)
- ✅ **User-Friendly**: Step-by-step guided form with validation
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **MFC Branding**: Integrated with My Future Capacity design system

### New Features (November 2025)
- ✅ **Digital Signature**: Canvas-based signature capture with mouse/touch support
- ✅ **PDF Generation**: Automatic PDF receipt with embedded signature
- ✅ **Email Delivery**: Beautiful HTML confirmation emails with PDF attachment
- ✅ **Liability Protection**: MFC liability release and legal disclaimers
- ✅ **School Database**: 646 schools with autocomplete (163 CA schools with full contact info)

### In Progress
- ⏳ **Parchment SFTP**: Ready for production credentials (currently simulated)
- ⏳ **Email Service**: PDF generation and email delivery active

<!-- Deploy trigger: 2025-11-20 -->

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: TailwindCSS with MFC brand colors
- **Database**: SQLite (local dev) / Turso libSQL (production)
- **ORM**: Drizzle ORM with type-safe queries
- **Validation**: Zod for runtime type checking
- **PESC Compliance**: Generates standard PESC v1.2.0 XML
- **SFTP**: ssh2-sftp-client for Parchment integration
- **Deployment**: Netlify with manual build commands
- **Production DB**: transcript-requests-prod-jamie32872.aws-us-west-2.turso.io

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git (for version control)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/DrVM-CES/transcript-request-service.git
   cd transcript-request
   ```

2. **Start the application** (easiest method)
   ```powershell
   # On Windows - handles everything automatically
   .\start.ps1
   ```

   Or manually:
   ```bash
   npm install
   npm run db:push       # Initialize local database
   npm run dev           # Start development server
   ```

3. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Test the transcript request form!

## 🔧 Environment Configuration

### Local Development

Create `.env.local`:
```env
DATABASE_URL="file:.data/dev.db"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_SECRET="your-local-secret"
MFC_API_KEY="your-local-key"
```

### Production (Netlify)

Set environment variables in Netlify Dashboard:
```env
# Database
DATABASE_URL="libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io"
TURSO_AUTH_TOKEN="[secret]"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://frolicking-horse-f44773.netlify.app"

# Security
ENCRYPTION_SECRET="[secret]"
MFC_API_KEY="[secret]"

# Parchment SFTP (when credentials available)
PARCHMENT_SFTP_HOST="[pending]"
PARCHMENT_SFTP_USERNAME="[pending]"
PARCHMENT_SFTP_PASSWORD="[pending]"
PARCHMENT_SFTP_PORT="22"
```

> **⚠️ Important:** Never commit `.env.local` or production secrets to Git!

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

## 📋 Current Status & Next Steps

### ✅ Completed
- Production deployment on Netlify (live and operational)
- Turso database connected and operational
- Multi-step form with validation
- PESC XML generation (v1.2.0 compliant)
- SFTP client ready (simulation mode)
- MFC branding applied
- Success page with navigation
- API endpoints functional

### 🚧 Next Priority (Phase 1)
1. **School database** with autocomplete search
2. **Date pickers** for DOB and date fields
3. **Parental consent workflow** for students under 18
4. **Content pages** (About, FAQ, Privacy Policy)

### ⏳ Pending External Dependencies
- **Parchment SFTP credentials** (contacts: Maggie West, Kim Underwood at Instructure)
- **MFC app integration** (2-3 hours development time, waiting for coordination)

### 🎯 Future Enhancements (Phase 2-4)
- User authentication (Better Auth)
- Student dashboard for tracking requests
- Payment integration ($5.99 for non-MFC clients)
- MFC client verification system
- Tiered service options

> **📖 For detailed roadmap**, see [`.memex/project_rules.md`](.memex/project_rules.md) - Section "Implementation Status"

## 🐛 Support & Troubleshooting

### Common Issues

1. **Database connection**: Ensure `.data` directory exists and is writable
2. **Port conflicts**: Change port in `package.json` if 3000 is in use
3. **Environment variables**: Check `.env.local` file exists and is properly formatted
4. **Netlify deployment**: See comprehensive troubleshooting in project rules

### Health Check
Visit `/api/health` to verify:
- Database connectivity
- SFTP status (simulation/production)
- Environment configuration

### Development Notes

- Form validation on both client and server side
- Database uses Drizzle ORM with type safety
- PESC XML follows official specifications
- All sensitive operations are server-side only
- Relative imports used (not path aliases) for Netlify compatibility

## 📚 Documentation

- **[Project Rules](.memex/project_rules.md)** - Comprehensive development guide with:
  - Architecture & technology patterns
  - Deployment procedures and troubleshooting
  - Database schema and migration patterns
  - PESC standards implementation
  - FERPA compliance requirements
  - Lessons learned from production deployment
  - Complete feature roadmap

- **[Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)** - Step-by-step Netlify deployment
- **[MFC Integration](MFC_API_INTEGRATION.md)** - API integration with My Future Capacity app
- **[PESC Specs](PARCHMENT_TECHNICAL_SPECS.md)** - Technical XML specifications

## 🔗 Important Links

- **Live Site**: https://frolicking-horse-f44773.netlify.app
- **GitHub**: https://github.com/DrVM-CES/transcript-request-service
- **My Future Capacity**: [Main application URL]

## 🛡️ Security

- All sensitive data encrypted in transit and at rest
- FERPA compliant with full audit trail
- IP address and user agent logging for compliance
- Server-side validation on all inputs

If you discover security vulnerabilities, please report them privately to the maintainers.

## 📄 License

This project is provided free of charge for educational institutions and students requesting transcripts. Part of the My Future Capacity platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with proper testing
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Before contributing**, read [`.memex/project_rules.md`](.memex/project_rules.md) for:
- Code patterns and conventions
- Deployment requirements
- Testing procedures
- Import path guidelines (use relative, not aliases!)

---

**Built with ❤️ for students by My Future Capacity**