from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import json

db = SQLAlchemy()

class Playbook(db.Model):
    __tablename__ = 'playbooks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False)  # onboarding, retention, expansion, support
    
    # Trigger conditions
    trigger_conditions = db.Column(db.Text, nullable=False)  # JSON string with conditions
    
    # Playbook configuration
    is_active = db.Column(db.Boolean, default=True)
    priority = db.Column(db.Integer, default=5)  # 1-10 scale
    created_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    last_modified = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    # Success metrics
    execution_count = db.Column(db.Integer, default=0)
    success_rate = db.Column(db.Float, default=0.0)
    
    # Relationship with playbook steps
    steps = db.relationship('PlaybookStep', backref='playbook', lazy=True, cascade='all, delete-orphan', order_by='PlaybookStep.step_order')
    executions = db.relationship('PlaybookExecution', backref='playbook', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'trigger_conditions': json.loads(self.trigger_conditions) if self.trigger_conditions else None,
            'is_active': self.is_active,
            'priority': self.priority,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None,
            'execution_count': self.execution_count,
            'success_rate': self.success_rate,
            'steps': [step.to_dict() for step in self.steps]
        }


class PlaybookStep(db.Model):
    __tablename__ = 'playbook_steps'
    
    id = db.Column(db.Integer, primary_key=True)
    playbook_id = db.Column(db.Integer, db.ForeignKey('playbooks.id'), nullable=False)
    step_order = db.Column(db.Integer, nullable=False)
    
    # Step details
    step_type = db.Column(db.String(50), nullable=False)  # email, task, wait, condition, webhook
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Step configuration
    config = db.Column(db.Text, nullable=True)  # JSON string with step-specific configuration
    
    # Timing
    delay_hours = db.Column(db.Integer, default=0)  # Hours to wait before executing this step
    
    # Conditions
    conditions = db.Column(db.Text, nullable=True)  # JSON string with execution conditions
    
    def to_dict(self):
        return {
            'id': self.id,
            'playbook_id': self.playbook_id,
            'step_order': self.step_order,
            'step_type': self.step_type,
            'title': self.title,
            'description': self.description,
            'config': json.loads(self.config) if self.config else None,
            'delay_hours': self.delay_hours,
            'conditions': json.loads(self.conditions) if self.conditions else None
        }


class PlaybookExecution(db.Model):
    __tablename__ = 'playbook_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    playbook_id = db.Column(db.Integer, db.ForeignKey('playbooks.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Execution status
    status = db.Column(db.String(20), default='active')  # active, completed, failed, paused
    current_step = db.Column(db.Integer, default=0)
    
    # Timing
    started_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    completed_date = db.Column(db.DateTime, nullable=True)
    next_step_date = db.Column(db.DateTime, nullable=True)
    
    # Results
    success = db.Column(db.Boolean, nullable=True)
    results = db.Column(db.Text, nullable=True)  # JSON string with execution results
    
    # Relationship with step executions
    step_executions = db.relationship('StepExecution', backref='playbook_execution', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'playbook_id': self.playbook_id,
            'customer_id': self.customer_id,
            'status': self.status,
            'current_step': self.current_step,
            'started_date': self.started_date.isoformat() if self.started_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'next_step_date': self.next_step_date.isoformat() if self.next_step_date else None,
            'success': self.success,
            'results': json.loads(self.results) if self.results else None,
            'step_executions': [se.to_dict() for se in self.step_executions]
        }


class StepExecution(db.Model):
    __tablename__ = 'step_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    execution_id = db.Column(db.Integer, db.ForeignKey('playbook_executions.id'), nullable=False)
    step_id = db.Column(db.Integer, db.ForeignKey('playbook_steps.id'), nullable=False)
    
    # Execution details
    status = db.Column(db.String(20), default='pending')  # pending, running, completed, failed, skipped
    started_date = db.Column(db.DateTime, nullable=True)
    completed_date = db.Column(db.DateTime, nullable=True)
    
    # Results
    success = db.Column(db.Boolean, nullable=True)
    output = db.Column(db.Text, nullable=True)  # JSON string with step output
    error_message = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'execution_id': self.execution_id,
            'step_id': self.step_id,
            'status': self.status,
            'started_date': self.started_date.isoformat() if self.started_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'success': self.success,
            'output': json.loads(self.output) if self.output else None,
            'error_message': self.error_message
        }


# Predefined playbook templates
PLAYBOOK_TEMPLATES = [
    {
        'name': 'New Customer Onboarding',
        'description': 'Comprehensive onboarding sequence for new customers',
        'category': 'onboarding',
        'trigger_conditions': {
            'customer_age_days': {'max': 7},
            'onboarding_completed': False
        },
        'steps': [
            {
                'step_order': 1,
                'step_type': 'email',
                'title': 'Welcome Email',
                'description': 'Send personalized welcome email with getting started guide',
                'delay_hours': 1,
                'config': {
                    'template': 'welcome_email',
                    'personalization': True
                }
            },
            {
                'step_order': 2,
                'step_type': 'task',
                'title': 'Schedule Onboarding Call',
                'description': 'Create task to schedule onboarding call with customer',
                'delay_hours': 24,
                'config': {
                    'task_type': 'call',
                    'priority': 'high',
                    'duration_minutes': 30
                }
            },
            {
                'step_order': 3,
                'step_type': 'email',
                'title': 'Feature Highlight Email',
                'description': 'Send email highlighting key features based on customer plan',
                'delay_hours': 72,
                'config': {
                    'template': 'feature_highlight',
                    'plan_specific': True
                }
            }
        ]
    },
    {
        'name': 'Churn Risk Intervention',
        'description': 'Automated intervention for customers showing churn risk signals',
        'category': 'retention',
        'trigger_conditions': {
            'churn_risk_level': ['high', 'critical'],
            'last_login_days': {'min': 14}
        },
        'steps': [
            {
                'step_order': 1,
                'step_type': 'task',
                'title': 'Urgent Customer Check-in',
                'description': 'Create urgent task to contact at-risk customer',
                'delay_hours': 0,
                'config': {
                    'task_type': 'call',
                    'priority': 'urgent',
                    'duration_minutes': 15
                }
            },
            {
                'step_order': 2,
                'step_type': 'email',
                'title': 'Re-engagement Email',
                'description': 'Send personalized re-engagement email with value proposition',
                'delay_hours': 2,
                'config': {
                    'template': 'reengagement',
                    'include_success_stories': True
                }
            }
        ]
    },
    {
        'name': 'Expansion Opportunity',
        'description': 'Automated sequence for customers showing expansion potential',
        'category': 'expansion',
        'trigger_conditions': {
            'expansion_opportunity': ['medium', 'high'],
            'health_score': {'min': 70}
        },
        'steps': [
            {
                'step_order': 1,
                'step_type': 'task',
                'title': 'Expansion Discovery Call',
                'description': 'Schedule call to discuss expansion opportunities',
                'delay_hours': 24,
                'config': {
                    'task_type': 'call',
                    'priority': 'medium',
                    'duration_minutes': 30
                }
            },
            {
                'step_order': 2,
                'step_type': 'email',
                'title': 'Expansion Proposal',
                'description': 'Send customized expansion proposal based on usage patterns',
                'delay_hours': 168,  # 1 week
                'config': {
                    'template': 'expansion_proposal',
                    'usage_based': True
                }
            }
        ]
    }
]

