"""
User and Organization Models
Supports multi-tenant authentication and authorization
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Organization(db.Model):
    """Organization/Tenant model for multi-tenancy"""
    __tablename__ = 'organizations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    
    # Plan Management
    plan_tier = db.Column(db.String(50), default='starter')  # starter, growth, enterprise
    customer_limit = db.Column(db.Integer, default=100)
    monthly_price = db.Column(db.Float, default=1950.00)  # Price in cents/dollars
    
    # Status Tracking
    is_active = db.Column(db.Boolean, default=True)
    is_trial = db.Column(db.Boolean, default=True)
    trial_ends_at = db.Column(db.DateTime, nullable=True)
    subscription_status = db.Column(db.String(50), default='trial')  # trial, active, past_due, cancelled
    
    # Billing Information
    billing_email = db.Column(db.String(120), nullable=True)
    stripe_customer_id = db.Column(db.String(100), unique=True, nullable=True)
    stripe_subscription_id = db.Column(db.String(100), unique=True, nullable=True)
    current_period_start = db.Column(db.DateTime, nullable=True)
    current_period_end = db.Column(db.DateTime, nullable=True)
    
    # Usage Tracking
    customer_count = db.Column(db.Integer, default=0)
    user_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    users = db.relationship('User', backref='organization', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Organization {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'plan_tier': self.plan_tier,
            'customer_limit': self.customer_limit,
            'monthly_price': self.monthly_price,
            'is_active': self.is_active,
            'is_trial': self.is_trial,
            'trial_ends_at': self.trial_ends_at.isoformat() if self.trial_ends_at else None,
            'subscription_status': self.subscription_status,
            'billing_email': self.billing_email,
            'customer_count': self.customer_count,
            'user_count': self.user_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def is_over_customer_limit(self):
        """Check if organization has exceeded customer limit"""
        return self.customer_count >= self.customer_limit
    
    @property
    def customer_usage_percent(self):
        """Calculate percentage of customer limit used"""
        if self.customer_limit == 0:
            return 0
        return round((self.customer_count / self.customer_limit) * 100, 2)
    
    @property
    def is_subscription_active(self):
        """Check if subscription is active (trial or paid)"""
        return self.subscription_status in ['trial', 'active'] and self.is_active
    
    @staticmethod
    def get_plan_details(plan_tier):
        """Get plan configuration details"""
        plans = {
            'starter': {
                'name': 'Starter',
                'price': 1950.00,  # $1,950/month
                'customer_limit': 100,
                'user_limit': 3,
                'features': [
                    'Up to 100 customers',
                    '3 team members',
                    'AI health scoring',
                    'Basic playbooks',
                    'Email support'
                ]
            },
            'growth': {
                'name': 'Growth',
                'price': 3950.00,  # $3,950/month
                'customer_limit': 300,
                'user_limit': 10,
                'features': [
                    'Up to 300 customers',
                    '10 team members',
                    'Advanced AI insights',
                    'Custom playbooks',
                    'All integrations',
                    'Priority support'
                ]
            },
            'enterprise': {
                'name': 'Enterprise',
                'price': 5950.00,  # $5,950/month
                'customer_limit': 1000,
                'user_limit': -1,  # Unlimited
                'features': [
                    'Up to 1,000 customers',
                    'Unlimited team members',
                    'Predictive analytics',
                    'Advanced automation',
                    'API access',
                    'Dedicated support',
                    'Custom integrations'
                ]
            }
        }
        return plans.get(plan_tier, plans['starter'])


class User(db.Model):
    """User model with organization association"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), default='user')  # admin, user, viewer
    is_active = db.Column(db.Boolean, default=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'is_active': self.is_active,
            'organization_id': self.organization_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
