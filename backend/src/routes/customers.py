from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import json

from src.models.user import db
from src.models.customer import Customer, CustomerActivity, CSMAction
from src.services.health_scoring import HealthScoringEngine

customers_bp = Blueprint('customers', __name__)
health_engine = HealthScoringEngine()

@customers_bp.route('/customers', methods=['GET'])
def get_customers():
    """Get all customers with their health scores and basic info."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        risk_filter = request.args.get('risk_level')
        
        query = Customer.query
        
        if risk_filter:
            query = query.filter(Customer.churn_risk_level == risk_filter)
        
        customers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        customer_list = []
        for customer in customers.items:
            customer_dict = customer.to_dict()
            customer_list.append(customer_dict)
        
        return jsonify({
            'customers': customer_list,
            'pagination': {
                'page': customers.page,
                'pages': customers.pages,
                'per_page': customers.per_page,
                'total': customers.total,
                'has_next': customers.has_next,
                'has_prev': customers.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get detailed customer information including health scores and recent activities."""
    try:
        customer = Customer.query.get_or_404(customer_id)
        
        # Get recent activities
        activities = CustomerActivity.query.filter_by(customer_id=customer_id)\
            .order_by(CustomerActivity.timestamp.desc())\
            .limit(50).all()
        
        # Get pending actions
        pending_actions = CSMAction.query.filter_by(
            customer_id=customer_id,
            action_status='pending'
        ).order_by(CSMAction.priority.desc(), CSMAction.created_date.desc()).all()
        
        customer_dict = customer.to_dict()
        customer_dict['recent_activities'] = [activity.to_dict() for activity in activities]
        customer_dict['pending_actions'] = [action.to_dict() for action in pending_actions]
        
        return jsonify(customer_dict)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/customers/<int:customer_id>/health', methods=['POST'])
def update_customer_health(customer_id):
    """Recalculate and update customer health scores with AI insights."""
    try:
        customer = Customer.query.get_or_404(customer_id)
        
        # Get customer activities for health calculation
        activities = CustomerActivity.query.filter_by(customer_id=customer_id).all()
        activity_dicts = [activity.to_dict() for activity in activities]
        
        # Calculate health scores
        customer_data = customer.to_dict()
        health_scores = health_engine.calculate_overall_health_score(customer_data, activity_dicts)
        
        # Update customer with new scores
        customer.health_score = health_scores['overall_score']
        customer.usage_score = health_scores['usage_score']
        customer.engagement_score = health_scores['engagement_score']
        customer.support_score = health_scores['support_score']
        customer.financial_score = health_scores['financial_score']
        customer.churn_risk_level = health_scores['risk_level']
        
        # Identify expansion opportunity
        customer.expansion_opportunity = health_engine.identify_expansion_opportunity(
            customer_data, health_scores
        )
        
        # Generate AI insights (this is async but we'll handle it synchronously for MVP)
        try:
            import asyncio
            ai_insights = asyncio.run(health_engine.generate_ai_insights(
                customer_data, health_scores, activity_dicts
            ))
            customer.ai_insights = json.dumps(ai_insights)
            customer.last_ai_analysis = datetime.now(timezone.utc)
        except Exception as ai_error:
            print(f"AI insights generation failed: {ai_error}")
            # Continue without AI insights
        
        db.session.commit()
        
        response_data = customer.to_dict()
        response_data['health_breakdown'] = health_scores['score_breakdown']
        
        return jsonify(response_data)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/customers', methods=['POST'])
def create_customer():
    """Create a new customer."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['external_id', 'name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if customer already exists
        existing_customer = Customer.query.filter_by(external_id=data['external_id']).first()
        if existing_customer:
            return jsonify({'error': 'Customer with this external_id already exists'}), 409
        
        # Create new customer
        customer = Customer(
            external_id=data['external_id'],
            name=data['name'],
            email=data['email'],
            company=data.get('company'),
            plan_type=data.get('plan_type'),
            mrr=data.get('mrr', 0.0),
            next_renewal_date=datetime.fromisoformat(data['next_renewal_date']) if data.get('next_renewal_date') else None
        )
        
        db.session.add(customer)
        db.session.commit()
        
        # Calculate initial health scores
        customer_data = customer.to_dict()
        health_scores = health_engine.calculate_overall_health_score(customer_data, [])
        
        customer.health_score = health_scores['overall_score']
        customer.usage_score = health_scores['usage_score']
        customer.engagement_score = health_scores['engagement_score']
        customer.support_score = health_scores['support_score']
        customer.financial_score = health_scores['financial_score']
        customer.churn_risk_level = health_scores['risk_level']
        
        db.session.commit()
        
        return jsonify(customer.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/customers/<int:customer_id>/activities', methods=['POST'])
def add_customer_activity():
    """Add a new activity for a customer."""
    try:
        data = request.get_json()
        customer_id = request.view_args['customer_id']
        
        # Validate customer exists
        customer = Customer.query.get_or_404(customer_id)
        
        # Validate required fields
        if not data.get('activity_type'):
            return jsonify({'error': 'Missing required field: activity_type'}), 400
        
        # Create new activity
        activity = CustomerActivity(
            customer_id=customer_id,
            activity_type=data['activity_type'],
            activity_data=json.dumps(data.get('activity_data', {})),
            timestamp=datetime.now(timezone.utc)
        )
        
        db.session.add(activity)
        
        # Update customer's last activity timestamp based on activity type
        if data['activity_type'] == 'login':
            customer.last_login = datetime.now(timezone.utc)
        elif data['activity_type'] == 'support_ticket':
            customer.last_support_ticket = datetime.now(timezone.utc)
            customer.support_tickets_count += 1
        
        db.session.commit()
        
        return jsonify(activity.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/customers/<int:customer_id>/actions', methods=['GET'])
def get_customer_actions(customer_id):
    """Get all CSM actions for a customer."""
    try:
        customer = Customer.query.get_or_404(customer_id)
        
        status_filter = request.args.get('status')
        query = CSMAction.query.filter_by(customer_id=customer_id)
        
        if status_filter:
            query = query.filter(CSMAction.action_status == status_filter)
        
        actions = query.order_by(CSMAction.created_date.desc()).all()
        
        return jsonify([action.to_dict() for action in actions])
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/customers/<int:customer_id>/actions', methods=['POST'])
def create_customer_action(customer_id):
    """Create a new CSM action for a customer."""
    try:
        data = request.get_json()
        
        # Validate customer exists
        customer = Customer.query.get_or_404(customer_id)
        
        # Validate required fields
        required_fields = ['action_type', 'title']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new action
        action = CSMAction(
            customer_id=customer_id,
            action_type=data['action_type'],
            title=data['title'],
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            scheduled_date=datetime.fromisoformat(data['scheduled_date']) if data.get('scheduled_date') else None,
            ai_generated=data.get('ai_generated', False)
        )
        
        db.session.add(action)
        db.session.commit()
        
        return jsonify(action.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/actions/<int:action_id>', methods=['PUT'])
def update_action(action_id):
    """Update a CSM action (mark as completed, add outcome, etc.)."""
    try:
        action = CSMAction.query.get_or_404(action_id)
        data = request.get_json()
        
        # Update allowed fields
        if 'action_status' in data:
            action.action_status = data['action_status']
            if data['action_status'] == 'completed':
                action.completed_date = datetime.now(timezone.utc)
        
        if 'outcome' in data:
            action.outcome = data['outcome']
        
        if 'customer_response' in data:
            action.customer_response = data['customer_response']
        
        if 'priority' in data:
            action.priority = data['priority']
        
        db.session.commit()
        
        return jsonify(action.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Get dashboard summary statistics."""
    try:
        # Get customer counts by risk level
        risk_counts = db.session.query(
            Customer.churn_risk_level,
            db.func.count(Customer.id)
        ).group_by(Customer.churn_risk_level).all()
        
        risk_summary = {level: 0 for level in ['low', 'medium', 'high', 'critical']}
        for level, count in risk_counts:
            risk_summary[level] = count
        
        # Get expansion opportunity counts
        expansion_counts = db.session.query(
            Customer.expansion_opportunity,
            db.func.count(Customer.id)
        ).group_by(Customer.expansion_opportunity).all()
        
        expansion_summary = {level: 0 for level in ['none', 'low', 'medium', 'high']}
        for level, count in expansion_counts:
            expansion_summary[level] = count
        
        # Get pending actions count
        pending_actions = CSMAction.query.filter_by(action_status='pending').count()
        
        # Get average health score
        avg_health = db.session.query(db.func.avg(Customer.health_score)).scalar() or 0
        
        # Get total MRR
        total_mrr = db.session.query(db.func.sum(Customer.mrr)).scalar() or 0
        
        # Get customers requiring immediate attention (high/critical risk)
        urgent_customers = Customer.query.filter(
            Customer.churn_risk_level.in_(['high', 'critical'])
        ).count()
        
        return jsonify({
            'total_customers': Customer.query.count(),
            'average_health_score': round(avg_health, 1),
            'total_mrr': round(total_mrr, 2),
            'pending_actions': pending_actions,
            'urgent_customers': urgent_customers,
            'risk_distribution': risk_summary,
            'expansion_opportunities': expansion_summary
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

