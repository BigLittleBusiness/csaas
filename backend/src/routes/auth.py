"""
Authentication Routes
Handles user registration, login, and JWT token management with multi-tenant support
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from src.models.user import db, User, Organization
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user and organization"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'organization_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create organization
        organization = Organization(
            name=data['organization_name'],
            plan_tier=data.get('plan_tier', 'starter'),
            customer_limit=data.get('customer_limit', 100)
        )
        db.session.add(organization)
        db.session.flush()  # Get organization ID
        
        # Create user
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            name=data['name'],
            organization_id=organization.id,
            role=data.get('role', 'admin')  # First user is admin
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'organization_id': organization.id,
                'role': user.role
            }
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'organization_id': organization.id,
                'organization_name': organization.name,
                'role': user.role
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT tokens"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens with organization context
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'organization_id': user.organization_id,
                'role': user.role
            }
        )
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'organization_id': user.organization_id,
                'role': user.role
            },
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Invalid user'}), 401
        
        # Generate new access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'organization_id': user.organization_id,
                'role': user.role
            }
        )
        
        return jsonify({'access_token': access_token}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        organization = Organization.query.get(user.organization_id)
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            },
            'organization': {
                'id': organization.id,
                'name': organization.name,
                'plan_tier': organization.plan_tier,
                'customer_limit': organization.customer_limit,
                'is_active': organization.is_active
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current and new password required'}), 400
        
        # Verify current password
        if not check_password_hash(user.password_hash, data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        user.password_hash = generate_password_hash(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/organization/users', methods=['GET'])
@jwt_required()
def get_organization_users():
    """Get all users in the organization (admin only)"""
    try:
        claims = get_jwt()
        
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        organization_id = claims.get('organization_id')
        users = User.query.filter_by(organization_id=organization_id).all()
        
        return jsonify({
            'users': [{
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            } for user in users]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/organization/invite', methods=['POST'])
@jwt_required()
def invite_user():
    """Invite a new user to the organization (admin only)"""
    try:
        claims = get_jwt()
        
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        organization_id = claims.get('organization_id')
        
        if not data.get('email') or not data.get('name'):
            return jsonify({'error': 'Email and name required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create user with temporary password
        temp_password = generate_password_hash('TempPass123!')  # Should send email in production
        user = User(
            email=data['email'],
            password_hash=temp_password,
            name=data['name'],
            organization_id=organization_id,
            role=data.get('role', 'user')
        )
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User invited successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
