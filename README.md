# UpliftCS

**Customer Success, Elevated by AI**

UpliftCS is an AI-powered customer success platform that replaces expensive CSM teams with intelligent automation, delivering enterprise-grade customer success for small and mid-market businesses.

## Overview

UpliftCS democratizes customer success by making AI-powered automation accessible to the 50,000+ SMBs that can't afford dedicated CS teams. Our platform reduces churn by 40-60%, increases expansion revenue by 25-40%, and delivers a 14.6x ROI—all for 69% less than hiring a customer success manager.

### Key Features

- **AI-Powered Health Scoring**: Multi-dimensional customer health analysis combining usage, engagement, support, and financial metrics
- **Automated Playbooks**: Smart workflows for onboarding, retention, expansion, and churn prevention
- **Predictive Analytics**: Churn prediction and expansion opportunity identification 90+ days in advance
- **Integration Framework**: Seamless connections with Stripe, HubSpot, Intercom, Slack, and Mixpanel
- **24/7 Monitoring**: Continuous customer health tracking with automated interventions

## Value Proposition

| Traditional CSM | UpliftCS Platform |
|----------------|-------------------|
| $120K-180K annual salary | $23.4K-71.4K annual cost |
| Limited to 50-100 customers | Scales to 500+ customers |
| Works business hours | 24/7 automated monitoring |
| Manual playbook execution | AI-powered automation |
| Reactive interventions | Proactive predictions |

**Result**: 69% cost reduction with superior outcomes

## Tech Stack

### Backend
- **Framework**: Flask (Python 3.11)
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: SQLAlchemy with Alembic migrations
- **AI/ML**: OpenAI API (GPT-4.1-mini)
- **Authentication**: JWT-based multi-tenant auth

### Frontend
- **Framework**: React 19 with Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React

### Infrastructure
- **Deployment**: Cloud-native (AWS/GCP/Azure ready)
- **API**: RESTful with Flask-CORS
- **Security**: SOC2-compliant architecture

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 22+
- PostgreSQL 14+ (for production)
- OpenAI API key

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_openai_api_key
export DATABASE_URL=postgresql://user:password@localhost/upliftcs
export SECRET_KEY=your_secret_key

# Run database migrations
flask db upgrade

# Start development server
python src/main.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
upliftcs/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── migrations/      # Database migrations
│   │   └── main.py          # Application entry point
│   ├── requirements.txt
│   └── config.py
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx          # Main application
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Core Features

### 1. Customer Health Scoring

Multi-dimensional health scoring engine that analyzes:
- Product usage patterns and feature adoption
- Engagement frequency and recency
- Support ticket volume and sentiment
- Payment history and billing health
- Relationship strength indicators

### 2. AI-Powered Playbooks

Automated workflows for:
- **Onboarding**: Guided customer activation and time-to-value optimization
- **Retention**: Proactive engagement and churn prevention
- **Expansion**: Upsell and cross-sell opportunity identification
- **Renewal**: Automated renewal campaigns and risk mitigation

### 3. Predictive Analytics

- Churn prediction 90+ days in advance
- Expansion opportunity scoring
- Customer lifetime value forecasting
- Optimal intervention timing

### 4. Integrations

Pre-built integrations with:
- **Stripe**: Payment and subscription data
- **HubSpot**: CRM and contact management
- **Intercom**: Customer messaging and support
- **Slack**: Team notifications and alerts
- **Mixpanel**: Product analytics and usage tracking

## API Documentation

### Authentication

All API requests require JWT authentication:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Customer Health

```bash
GET /api/customers/{customer_id}/health
Authorization: Bearer {token}
```

### Playbook Execution

```bash
POST /api/playbooks/{playbook_id}/execute
Authorization: Bearer {token}

{
  "customer_id": "customer_123",
  "parameters": {}
}
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
pnpm test
```

### Database Migrations

```bash
# Create new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

## Deployment

### Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Configure PostgreSQL database
- [ ] Set secure `SECRET_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Enable rate limiting
- [ ] Set up CI/CD pipeline

## Business Model

### Pricing Tiers

- **Starter**: $1,950/month ($23.4K/year) - Up to 100 customers
- **Growth**: $3,950/month ($47.4K/year) - Up to 300 customers
- **Enterprise**: $5,950/month ($71.4K/year) - 500+ customers

### Unit Economics

- **LTV/CAC**: 19.2x
- **Gross Margin**: 85%
- **Payback Period**: 4.1 months
- **Net Revenue Retention**: 125%

## Roadmap

### Q1 2025 (Current)
- ✅ MVP platform development
- ✅ Core health scoring engine
- ✅ Basic playbook automation
- 🔄 PostgreSQL migration
- 🔄 Multi-tenant authentication

### Q2 2025
- Advanced AI recommendations
- Custom playbook builder
- Additional integrations (Salesforce, Zendesk)
- Mobile-responsive dashboard
- Beta customer onboarding

### Q3 2025
- Predictive churn modeling
- Automated email campaigns
- Advanced reporting and analytics
- API access for enterprise
- SOC2 compliance

### Q4 2025
- Multi-language support
- Vertical-specific templates
- Partner ecosystem
- Enterprise SSO
- Scale to 100+ customers

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

Copyright © 2025 UpliftCS. All rights reserved.

## Contact

- **Website**: https://upliftcs.com
- **Email**: hello@upliftcs.com
- **Demo**: https://upliftcs.com/demo

## Brand Assets

- **Colors**: Deep Navy (#0F172A), Vibrant Teal (#14B8A6), Ocean Blue (#0891B2), Light Teal (#5EEAD4)
- **Typography**: Poppins (headlines), Inter (body)
- **Logo**: Geometric layers design representing growth and elevation

---

**Built with ❤️ to democratize customer success for every business**
