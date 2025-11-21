# UpliftCS Development Guide

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 22+
- PostgreSQL 14+ (for production)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/BigLittleBusiness/csaas.git
cd csaas/backend
```

2. **Create virtual environment**
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**

For development (SQLite):
```bash
export FLASK_APP=src/main.py
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

For production (PostgreSQL):
```bash
# Create PostgreSQL database
createdb upliftcs

# Set DATABASE_URL in .env
export DATABASE_URL=postgresql://username:password@localhost:5432/upliftcs

# Run migrations
export FLASK_APP=src/main.py
flask db upgrade
```

6. **Run development server**
```bash
python src/main.py
```

The API will be available at http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start development server**
```bash
pnpm run dev
```

The frontend will be available at http://localhost:5173

## Database Migrations

### Creating a new migration
```bash
flask db migrate -m "Description of changes"
```

### Applying migrations
```bash
flask db upgrade
```

### Rolling back migrations
```bash
flask db downgrade
```

### Viewing migration history
```bash
flask db history
```

## Authentication System

### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "organization_name": "Acme Corp",
  "plan_tier": "growth"
}
```

### User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Using JWT Tokens
Include the access token in the Authorization header:
```bash
GET /api/customers
Authorization: Bearer {access_token}
```

### Token Refresh
```bash
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

## Multi-Tenancy

All customer data is automatically scoped to the user's organization. The JWT token contains the organization_id, which is used to filter all queries.

### Organization Isolation
- Each organization has its own customers, playbooks, and data
- Users can only access data from their own organization
- Admin users can invite new users to their organization

### Role-Based Access Control
- **admin**: Full access to organization data and user management
- **user**: Access to customer success features
- **viewer**: Read-only access

## API Testing

### Using curl
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "organization_name": "Test Org"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get customers (with token)
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman
1. Import the API collection (coming soon)
2. Set up environment variables for tokens
3. Use the collection to test all endpoints

## Development Workflow

### Feature Development
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test locally
4. Commit: `git commit -m "Add feature description"`
5. Push: `git push origin feature/your-feature-name`
6. Create pull request

### Database Schema Changes
1. Update models in `src/models/`
2. Create migration: `flask db migrate -m "Description"`
3. Review migration file in `migrations/versions/`
4. Apply migration: `flask db upgrade`
5. Test thoroughly
6. Commit both model changes and migration file

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

### Integration Tests
```bash
# Coming soon
```

## Deployment

### Production Checklist
- [ ] Set `FLASK_ENV=production` in .env
- [ ] Use PostgreSQL database
- [ ] Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up CI/CD pipeline
- [ ] Enable rate limiting
- [ ] Review security settings

### Environment Variables
All sensitive configuration should be in environment variables, never committed to git.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Ensure database exists: `psql -l`

### Migration Errors
- Check migration files in `migrations/versions/`
- Try `flask db stamp head` to reset migration state
- Manually fix database if needed

### Authentication Issues
- Verify JWT_SECRET_KEY is set
- Check token expiration
- Ensure user is active in database

## Code Style

### Python
- Follow PEP 8
- Use type hints where appropriate
- Write docstrings for functions and classes

### JavaScript/React
- Use ES6+ features
- Follow Airbnb style guide
- Use functional components with hooks

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For questions or issues:
- Email: hello@upliftcs.com
- GitHub Issues: https://github.com/BigLittleBusiness/csaas/issues
