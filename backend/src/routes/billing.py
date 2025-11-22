"""
Billing Routes
Plan upgrades, downgrades, and subscription management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from src.models.user import db, User, Organization
from src.services.organization_service import OrganizationService

billing_bp = Blueprint('billing', __name__, url_prefix='/api/billing')


@billing_bp.route('/plans', methods=['GET'])
@jwt_required()
def get_plans():
    """Get all available plans with current plan highlighted"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        organization = Organization.query.get(user.organization_id)
        plans = OrganizationService.get_available_plans()
        
        return jsonify({
            'plans': plans,
            'current_plan': organization.plan_tier if organization else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    """Get current subscription details"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        stats = OrganizationService.get_organization_stats(user.organization_id)
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/upgrade', methods=['POST'])
@jwt_required()
def upgrade_plan():
    """Upgrade to a higher plan tier"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        new_plan = data.get('plan_tier')
        
        if not new_plan:
            return jsonify({'error': 'plan_tier is required'}), 400
        
        organization = Organization.query.get(user.organization_id)
        
        # Validate upgrade path
        plan_hierarchy = {'starter': 1, 'growth': 2, 'enterprise': 3}
        current_level = plan_hierarchy.get(organization.plan_tier, 0)
        new_level = plan_hierarchy.get(new_plan, 0)
        
        if new_level <= current_level:
            return jsonify({'error': 'Can only upgrade to a higher tier plan'}), 400
        
        # Update plan
        updated_org = OrganizationService.update_plan(user.organization_id, new_plan)
        
        # Get plan details for pricing
        plan_details = Organization.get_plan_details(new_plan)
        
        return jsonify({
            'message': f'Successfully upgraded to {plan_details["name"]} plan',
            'organization': updated_org.to_dict(),
            'plan_details': plan_details,
            'next_steps': {
                'action': 'payment_required',
                'amount': plan_details['price'],
                'billing_cycle': 'monthly'
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/downgrade', methods=['POST'])
@jwt_required()
def downgrade_plan():
    """Downgrade to a lower plan tier"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        new_plan = data.get('plan_tier')
        
        if not new_plan:
            return jsonify({'error': 'plan_tier is required'}), 400
        
        organization = Organization.query.get(user.organization_id)
        
        # Validate downgrade path
        plan_hierarchy = {'starter': 1, 'growth': 2, 'enterprise': 3}
        current_level = plan_hierarchy.get(organization.plan_tier, 0)
        new_level = plan_hierarchy.get(new_plan, 0)
        
        if new_level >= current_level:
            return jsonify({'error': 'Can only downgrade to a lower tier plan'}), 400
        
        # Check if downgrade is possible
        plan_details = Organization.get_plan_details(new_plan)
        
        # Check customer count
        if organization.customer_count > plan_details['customer_limit']:
            return jsonify({
                'error': 'Cannot downgrade',
                'reason': f'You have {organization.customer_count} customers but the {new_plan} plan only supports {plan_details["customer_limit"]}',
                'action_required': f'Please reduce your customer count to {plan_details["customer_limit"]} or less before downgrading'
            }), 400
        
        # Check user count
        if plan_details['user_limit'] != -1 and organization.user_count > plan_details['user_limit']:
            return jsonify({
                'error': 'Cannot downgrade',
                'reason': f'You have {organization.user_count} users but the {new_plan} plan only supports {plan_details["user_limit"]}',
                'action_required': f'Please reduce your user count to {plan_details["user_limit"]} or less before downgrading'
            }), 400
        
        # Update plan (effective at end of billing period)
        updated_org = OrganizationService.update_plan(user.organization_id, new_plan)
        
        return jsonify({
            'message': f'Downgrade to {plan_details["name"]} plan scheduled',
            'organization': updated_org.to_dict(),
            'plan_details': plan_details,
            'effective_date': organization.current_period_end.isoformat() if organization.current_period_end else 'immediately',
            'savings': organization.monthly_price - plan_details['price']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancel subscription"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        immediate = data.get('immediate', False)
        
        organization = OrganizationService.cancel_subscription(
            user.organization_id,
            immediate=immediate
        )
        
        if immediate:
            message = 'Subscription cancelled immediately'
            access_until = 'now'
        else:
            message = 'Subscription will be cancelled at end of billing period'
            access_until = organization.current_period_end.isoformat() if organization.current_period_end else 'end of trial'
        
        return jsonify({
            'message': message,
            'access_until': access_until,
            'organization': organization.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/reactivate', methods=['POST'])
@jwt_required()
def reactivate_subscription():
    """Reactivate cancelled subscription"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        organization = Organization.query.get(user.organization_id)
        
        if not organization:
            return jsonify({'error': 'Organization not found'}), 404
        
        if organization.subscription_status != 'cancelled':
            return jsonify({'error': 'Subscription is not cancelled'}), 400
        
        # Reactivate subscription
        organization.subscription_status = 'active'
        organization.is_active = True
        organization.cancelled_at = None
        organization.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subscription reactivated successfully',
            'organization': organization.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/trial/extend', methods=['POST'])
@jwt_required()
def extend_trial():
    """Extend trial period (admin only, for special cases)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        days = data.get('days', 7)  # Default 7 days extension
        
        organization = Organization.query.get(user.organization_id)
        
        if not organization:
            return jsonify({'error': 'Organization not found'}), 404
        
        if not organization.is_trial:
            return jsonify({'error': 'Organization is not on trial'}), 400
        
        # Extend trial
        if organization.trial_ends_at:
            organization.trial_ends_at = organization.trial_ends_at + timedelta(days=days)
        else:
            organization.trial_ends_at = datetime.utcnow() + timedelta(days=days)
        
        organization.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': f'Trial extended by {days} days',
            'trial_ends_at': organization.trial_ends_at.isoformat(),
            'organization': organization.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@billing_bp.route('/usage', methods=['GET'])
@jwt_required()
def get_usage():
    """Get current usage statistics"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update and get stats
        OrganizationService.update_usage_counts(user.organization_id)
        stats = OrganizationService.get_organization_stats(user.organization_id)
        
        return jsonify({
            'usage': stats['usage'],
            'plan_details': stats['plan_details'],
            'warnings': []
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
