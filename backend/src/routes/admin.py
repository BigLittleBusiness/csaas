"""
Admin Routes
Administrative endpoints for user and organization management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Organization
from src.services.organization_service import OrganizationService

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    """List all users in the organization"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get all users in the same organization
        users = User.query.filter_by(organization_id=user.organization_id).all()
        
        return jsonify({
            'users': [u.to_dict() for u in users],
            'total': len(users)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get specific user details"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get user from same organization
        user = User.query.filter_by(
            id=user_id,
            organization_id=admin_user.organization_id
        ).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user details"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get user from same organization
        user = User.query.filter_by(
            id=user_id,
            organization_id=admin_user.organization_id
        ).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent self-modification
        if user.id == current_user_id:
            return jsonify({'error': 'Cannot modify your own account'}), 400
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        if 'role' in data and data['role'] in ['admin', 'user', 'viewer']:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Deactivate user (soft delete)"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        admin_user = User.query.get(current_user_id)
        
        if not admin_user or admin_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get user from same organization
        user = User.query.filter_by(
            id=user_id,
            organization_id=admin_user.organization_id
        ).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent self-deletion
        if user.id == current_user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        # Soft delete (deactivate)
        user.is_active = False
        db.session.commit()
        
        # Update organization user count
        OrganizationService.update_usage_counts(admin_user.organization_id)
        
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/organization', methods=['GET'])
@jwt_required()
def get_organization():
    """Get organization details"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        organization = Organization.query.get(user.organization_id)
        
        if not organization:
            return jsonify({'error': 'Organization not found'}), 404
        
        # Get comprehensive stats
        stats = OrganizationService.get_organization_stats(organization.id)
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/organization', methods=['PUT'])
@jwt_required()
def update_organization():
    """Update organization details"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        organization = Organization.query.get(user.organization_id)
        
        if not organization:
            return jsonify({'error': 'Organization not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            organization.name = data['name']
        if 'billing_email' in data:
            organization.billing_email = data['billing_email']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Organization updated successfully',
            'organization': organization.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/organization/plans', methods=['GET'])
@jwt_required()
def get_available_plans():
    """Get all available plan tiers"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        plans = OrganizationService.get_available_plans()
        return jsonify({'plans': plans}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/organization/stats', methods=['GET'])
@jwt_required()
def get_organization_stats():
    """Get detailed organization statistics"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        stats = OrganizationService.get_organization_stats(user.organization_id)
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/organization/plan', methods=['PUT'])
@jwt_required()
def update_organization_plan():
    """Update organization plan tier"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        new_plan = data.get('plan_tier')
        
        if not new_plan:
            return jsonify({'error': 'plan_tier is required'}), 400
        
        if new_plan not in ['starter', 'growth', 'enterprise']:
            return jsonify({'error': 'Invalid plan tier'}), 400
        
        organization = OrganizationService.update_plan(user.organization_id, new_plan)
        
        return jsonify({
            'message': 'Plan updated successfully',
            'organization': organization.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get organization stats
        org_stats = OrganizationService.get_organization_stats(user.organization_id)
        
        # Get user statistics
        users = User.query.filter_by(organization_id=user.organization_id).all()
        active_users = [u for u in users if u.is_active]
        verified_users = [u for u in users if hasattr(u, 'email_verified') and u.email_verified]
        
        # Get recent users
        recent_users = User.query.filter_by(
            organization_id=user.organization_id
        ).order_by(User.created_at.desc()).limit(5).all()
        
        # Get recent logins
        recent_logins = User.query.filter_by(
            organization_id=user.organization_id
        ).filter(User.last_login.isnot(None)).order_by(
            User.last_login.desc()
        ).limit(5).all()
        
        return jsonify({
            'statistics': {
                'users': {
                    'total': len(users),
                    'active': len(active_users),
                    'verified': len(verified_users),
                    'inactive': len(users) - len(active_users)
                },
                'organization': org_stats
            },
            'recent_activity': {
                'new_users': [u.to_dict() for u in recent_users],
                'recent_logins': [u.to_dict() for u in recent_logins]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
