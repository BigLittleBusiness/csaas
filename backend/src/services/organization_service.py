"""
Organization Service
Business logic for organization and plan management
"""

from datetime import datetime, timedelta
from src.models.user import db, Organization, User


class OrganizationService:
    """Service for managing organizations and subscriptions"""
    
    @staticmethod
    def create_organization(name, plan_tier='starter', billing_email=None):
        """Create a new organization with trial period"""
        plan_details = Organization.get_plan_details(plan_tier)
        
        organization = Organization(
            name=name,
            plan_tier=plan_tier,
            customer_limit=plan_details['customer_limit'],
            monthly_price=plan_details['price'],
            is_trial=True,
            trial_ends_at=datetime.utcnow() + timedelta(days=14),  # 14-day trial
            subscription_status='trial',
            billing_email=billing_email
        )
        
        db.session.add(organization)
        db.session.commit()
        
        return organization
    
    @staticmethod
    def update_plan(organization_id, new_plan_tier):
        """Update organization plan tier"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        plan_details = Organization.get_plan_details(new_plan_tier)
        
        # Check if downgrading and customer count exceeds new limit
        if organization.customer_count > plan_details['customer_limit']:
            raise ValueError(
                f"Cannot downgrade: Current customer count ({organization.customer_count}) "
                f"exceeds new plan limit ({plan_details['customer_limit']})"
            )
        
        organization.plan_tier = new_plan_tier
        organization.customer_limit = plan_details['customer_limit']
        organization.monthly_price = plan_details['price']
        organization.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return organization
    
    @staticmethod
    def activate_subscription(organization_id, stripe_customer_id, stripe_subscription_id):
        """Activate paid subscription"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        organization.is_trial = False
        organization.subscription_status = 'active'
        organization.stripe_customer_id = stripe_customer_id
        organization.stripe_subscription_id = stripe_subscription_id
        organization.current_period_start = datetime.utcnow()
        organization.current_period_end = datetime.utcnow() + timedelta(days=30)
        organization.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return organization
    
    @staticmethod
    def cancel_subscription(organization_id, immediate=False):
        """Cancel organization subscription"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        if immediate:
            organization.is_active = False
            organization.subscription_status = 'cancelled'
        else:
            # Cancel at end of billing period
            organization.subscription_status = 'cancelled'
        
        organization.cancelled_at = datetime.utcnow()
        organization.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return organization
    
    @staticmethod
    def update_usage_counts(organization_id):
        """Update customer and user counts for organization"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        # Count active users
        user_count = User.query.filter_by(
            organization_id=organization_id,
            is_active=True
        ).count()
        
        # Count customers (would query Customer model when implemented)
        # For now, keep existing count
        
        organization.user_count = user_count
        organization.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return organization
    
    @staticmethod
    def check_trial_expiration(organization_id):
        """Check if trial has expired and update status"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        if organization.is_trial and organization.trial_ends_at:
            if datetime.utcnow() > organization.trial_ends_at:
                organization.subscription_status = 'trial_expired'
                organization.is_active = False
                organization.updated_at = datetime.utcnow()
                db.session.commit()
                return True
        
        return False
    
    @staticmethod
    def get_organization_stats(organization_id):
        """Get comprehensive organization statistics"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        # Update usage counts
        OrganizationService.update_usage_counts(organization_id)
        
        # Get plan details
        plan_details = Organization.get_plan_details(organization.plan_tier)
        
        # Calculate days remaining in trial
        days_remaining = None
        if organization.is_trial and organization.trial_ends_at:
            delta = organization.trial_ends_at - datetime.utcnow()
            days_remaining = max(0, delta.days)
        
        return {
            'organization': organization.to_dict(),
            'plan_details': plan_details,
            'usage': {
                'customers': {
                    'current': organization.customer_count,
                    'limit': organization.customer_limit,
                    'percent': organization.customer_usage_percent,
                    'remaining': max(0, organization.customer_limit - organization.customer_count)
                },
                'users': {
                    'current': organization.user_count,
                    'limit': plan_details['user_limit']
                }
            },
            'trial': {
                'is_trial': organization.is_trial,
                'days_remaining': days_remaining,
                'expires_at': organization.trial_ends_at.isoformat() if organization.trial_ends_at else None
            },
            'subscription': {
                'status': organization.subscription_status,
                'is_active': organization.is_subscription_active,
                'current_period_end': organization.current_period_end.isoformat() if organization.current_period_end else None
            }
        }
    
    @staticmethod
    def get_available_plans():
        """Get all available plan tiers with details"""
        return {
            'starter': Organization.get_plan_details('starter'),
            'growth': Organization.get_plan_details('growth'),
            'enterprise': Organization.get_plan_details('enterprise')
        }
    
    @staticmethod
    def can_add_customer(organization_id):
        """Check if organization can add another customer"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        if not organization.is_subscription_active:
            return False, "Subscription is not active"
        
        if organization.is_over_customer_limit:
            return False, f"Customer limit reached ({organization.customer_limit})"
        
        return True, "Can add customer"
    
    @staticmethod
    def can_add_user(organization_id):
        """Check if organization can add another user"""
        organization = Organization.query.get(organization_id)
        if not organization:
            raise ValueError("Organization not found")
        
        if not organization.is_subscription_active:
            return False, "Subscription is not active"
        
        plan_details = Organization.get_plan_details(organization.plan_tier)
        user_limit = plan_details['user_limit']
        
        # -1 means unlimited
        if user_limit == -1:
            return True, "Can add user"
        
        if organization.user_count >= user_limit:
            return False, f"User limit reached ({user_limit})"
        
        return True, "Can add user"
