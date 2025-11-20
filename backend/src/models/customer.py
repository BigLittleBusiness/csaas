from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import json

db = SQLAlchemy()

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(100), unique=True, nullable=False)  # ID from external system
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=True)
    plan_type = db.Column(db.String(50), nullable=True)
    mrr = db.Column(db.Float, default=0.0)  # Monthly Recurring Revenue
    created_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Health Score Components
    health_score = db.Column(db.Float, default=50.0)  # 0-100 scale
    usage_score = db.Column(db.Float, default=50.0)
    engagement_score = db.Column(db.Float, default=50.0)
    support_score = db.Column(db.Float, default=50.0)
    financial_score = db.Column(db.Float, default=50.0)
    
    # Customer Success Metrics
    onboarding_completed = db.Column(db.Boolean, default=False)
    time_to_value_days = db.Column(db.Integer, nullable=True)
    feature_adoption_rate = db.Column(db.Float, default=0.0)
    support_tickets_count = db.Column(db.Integer, default=0)
    last_support_ticket = db.Column(db.DateTime, nullable=True)
    
    # Relationship tracking
    last_contact_date = db.Column(db.DateTime, nullable=True)
    next_renewal_date = db.Column(db.DateTime, nullable=True)
    churn_risk_level = db.Column(db.String(20), default='low')  # low, medium, high, critical
    expansion_opportunity = db.Column(db.String(20), default='none')  # none, low, medium, high
    
    # AI-generated insights
    ai_insights = db.Column(db.Text, nullable=True)  # JSON string of AI recommendations
    last_ai_analysis = db.Column(db.DateTime, nullable=True)
    
    # Relationship with activities
    activities = db.relationship('CustomerActivity', backref='customer', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'external_id': self.external_id,
            'name': self.name,
            'email': self.email,
            'company': self.company,
            'plan_type': self.plan_type,
            'mrr': self.mrr,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'health_score': self.health_score,
            'usage_score': self.usage_score,
            'engagement_score': self.engagement_score,
            'support_score': self.support_score,
            'financial_score': self.financial_score,
            'onboarding_completed': self.onboarding_completed,
            'time_to_value_days': self.time_to_value_days,
            'feature_adoption_rate': self.feature_adoption_rate,
            'support_tickets_count': self.support_tickets_count,
            'last_support_ticket': self.last_support_ticket.isoformat() if self.last_support_ticket else None,
            'last_contact_date': self.last_contact_date.isoformat() if self.last_contact_date else None,
            'next_renewal_date': self.next_renewal_date.isoformat() if self.next_renewal_date else None,
            'churn_risk_level': self.churn_risk_level,
            'expansion_opportunity': self.expansion_opportunity,
            'ai_insights': json.loads(self.ai_insights) if self.ai_insights else None,
            'last_ai_analysis': self.last_ai_analysis.isoformat() if self.last_ai_analysis else None
        }
    
    def update_health_score(self):
        """Calculate overall health score based on component scores"""
        # Weighted average of component scores
        weights = {
            'usage': 0.3,
            'engagement': 0.25,
            'support': 0.25,
            'financial': 0.2
        }
        
        self.health_score = (
            self.usage_score * weights['usage'] +
            self.engagement_score * weights['engagement'] +
            self.support_score * weights['support'] +
            self.financial_score * weights['financial']
        )
        
        # Update churn risk based on health score
        if self.health_score >= 80:
            self.churn_risk_level = 'low'
        elif self.health_score >= 60:
            self.churn_risk_level = 'medium'
        elif self.health_score >= 40:
            self.churn_risk_level = 'high'
        else:
            self.churn_risk_level = 'critical'


class CustomerActivity(db.Model):
    __tablename__ = 'customer_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # login, feature_use, support_ticket, etc.
    activity_data = db.Column(db.Text, nullable=True)  # JSON string with activity details
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'activity_type': self.activity_type,
            'activity_data': json.loads(self.activity_data) if self.activity_data else None,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class CSMAction(db.Model):
    __tablename__ = 'csm_actions'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # email, call, meeting, etc.
    action_status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    
    # Action details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    ai_generated = db.Column(db.Boolean, default=True)
    
    # Scheduling
    scheduled_date = db.Column(db.DateTime, nullable=True)
    completed_date = db.Column(db.DateTime, nullable=True)
    created_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    # Results tracking
    outcome = db.Column(db.Text, nullable=True)
    customer_response = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'action_type': self.action_type,
            'action_status': self.action_status,
            'priority': self.priority,
            'title': self.title,
            'description': self.description,
            'ai_generated': self.ai_generated,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'outcome': self.outcome,
            'customer_response': self.customer_response
        }

