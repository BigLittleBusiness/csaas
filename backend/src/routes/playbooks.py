from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import json

from src.models.user import db
from src.models.customer import Customer
from src.models.playbook import Playbook, PlaybookStep, PlaybookExecution, StepExecution
from src.services.playbook_engine import PlaybookEngine

playbooks_bp = Blueprint('playbooks', __name__)
playbook_engine = PlaybookEngine()

@playbooks_bp.route('/playbooks', methods=['GET'])
def get_playbooks():
    """Get all playbooks with their performance metrics."""
    try:
        playbooks = Playbook.query.order_by(Playbook.priority.desc(), Playbook.name).all()
        
        playbook_list = []
        for playbook in playbooks:
            playbook_dict = playbook.to_dict()
            
            # Add performance metrics
            performance = playbook_engine.get_playbook_performance(playbook.id)
            playbook_dict['performance'] = performance
            
            playbook_list.append(playbook_dict)
        
        return jsonify(playbook_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/<int:playbook_id>', methods=['GET'])
def get_playbook(playbook_id):
    """Get detailed playbook information including steps and recent executions."""
    try:
        playbook = Playbook.query.get_or_404(playbook_id)
        
        # Get recent executions
        recent_executions = PlaybookExecution.query.filter_by(playbook_id=playbook_id)\
            .order_by(PlaybookExecution.started_date.desc())\
            .limit(10).all()
        
        playbook_dict = playbook.to_dict()
        playbook_dict['recent_executions'] = [execution.to_dict() for execution in recent_executions]
        playbook_dict['performance'] = playbook_engine.get_playbook_performance(playbook_id)
        
        return jsonify(playbook_dict)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks', methods=['POST'])
def create_playbook():
    """Create a new custom playbook."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'category', 'trigger_conditions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new playbook
        playbook = Playbook(
            name=data['name'],
            description=data.get('description', ''),
            category=data['category'],
            trigger_conditions=json.dumps(data['trigger_conditions']),
            is_active=data.get('is_active', True),
            priority=data.get('priority', 5)
        )
        
        db.session.add(playbook)
        db.session.flush()  # Get the playbook ID
        
        # Add steps if provided
        if 'steps' in data:
            for step_data in data['steps']:
                step = PlaybookStep(
                    playbook_id=playbook.id,
                    step_order=step_data['step_order'],
                    step_type=step_data['step_type'],
                    title=step_data['title'],
                    description=step_data.get('description', ''),
                    delay_hours=step_data.get('delay_hours', 0),
                    config=json.dumps(step_data.get('config', {})),
                    conditions=json.dumps(step_data.get('conditions', {})) if step_data.get('conditions') else None
                )
                db.session.add(step)
        
        db.session.commit()
        
        return jsonify(playbook.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/<int:playbook_id>', methods=['PUT'])
def update_playbook(playbook_id):
    """Update an existing playbook."""
    try:
        playbook = Playbook.query.get_or_404(playbook_id)
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            playbook.name = data['name']
        if 'description' in data:
            playbook.description = data['description']
        if 'is_active' in data:
            playbook.is_active = data['is_active']
        if 'priority' in data:
            playbook.priority = data['priority']
        if 'trigger_conditions' in data:
            playbook.trigger_conditions = json.dumps(data['trigger_conditions'])
        
        playbook.last_modified = datetime.now(timezone.utc)
        
        db.session.commit()
        
        return jsonify(playbook.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/<int:playbook_id>/trigger', methods=['POST'])
def trigger_playbook():
    """Manually trigger a playbook for specific customers."""
    try:
        playbook_id = request.view_args['playbook_id']
        data = request.get_json()
        
        playbook = Playbook.query.get_or_404(playbook_id)
        
        customer_ids = data.get('customer_ids', [])
        if not customer_ids:
            return jsonify({'error': 'No customer IDs provided'}), 400
        
        triggered_executions = []
        
        for customer_id in customer_ids:
            customer = Customer.query.get(customer_id)
            if not customer:
                continue
            
            # Check if playbook is already running for this customer
            existing_execution = PlaybookExecution.query.filter_by(
                customer_id=customer_id,
                playbook_id=playbook_id,
                status='active'
            ).first()
            
            if existing_execution:
                continue
            
            # Start playbook execution
            execution = playbook_engine.start_playbook_execution(customer, playbook)
            if execution:
                triggered_executions.append(execution.to_dict())
        
        return jsonify({
            'message': f'Triggered playbook for {len(triggered_executions)} customers',
            'executions': triggered_executions
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/evaluate-triggers', methods=['POST'])
def evaluate_all_triggers():
    """Evaluate triggers for all customers and start appropriate playbooks."""
    try:
        data = request.get_json() or {}
        customer_ids = data.get('customer_ids')
        
        # Get customers to evaluate
        if customer_ids:
            customers = Customer.query.filter(Customer.id.in_(customer_ids)).all()
        else:
            customers = Customer.query.all()
        
        triggered_count = 0
        triggered_executions = []
        
        for customer in customers:
            # Evaluate triggers for this customer
            triggered_playbooks = playbook_engine.evaluate_triggers(customer)
            
            for playbook in triggered_playbooks:
                execution = playbook_engine.start_playbook_execution(customer, playbook)
                if execution:
                    triggered_count += 1
                    triggered_executions.append({
                        'customer_id': customer.id,
                        'customer_name': customer.name,
                        'playbook_id': playbook.id,
                        'playbook_name': playbook.name,
                        'execution_id': execution.id
                    })
        
        return jsonify({
            'message': f'Evaluated {len(customers)} customers, triggered {triggered_count} playbooks',
            'triggered_executions': triggered_executions
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/execute-pending', methods=['POST'])
def execute_pending_steps():
    """Execute all pending playbook steps that are due."""
    try:
        playbook_engine.execute_pending_steps()
        
        return jsonify({'message': 'Pending steps executed successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/executions', methods=['GET'])
def get_executions():
    """Get playbook executions with optional filtering."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status')
        customer_id = request.args.get('customer_id', type=int)
        playbook_id = request.args.get('playbook_id', type=int)
        
        query = PlaybookExecution.query
        
        if status_filter:
            query = query.filter(PlaybookExecution.status == status_filter)
        if customer_id:
            query = query.filter(PlaybookExecution.customer_id == customer_id)
        if playbook_id:
            query = query.filter(PlaybookExecution.playbook_id == playbook_id)
        
        executions = query.order_by(PlaybookExecution.started_date.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        execution_list = []
        for execution in executions.items:
            execution_dict = execution.to_dict()
            
            # Add customer and playbook names
            customer = Customer.query.get(execution.customer_id)
            playbook = Playbook.query.get(execution.playbook_id)
            
            execution_dict['customer_name'] = customer.name if customer else 'Unknown'
            execution_dict['playbook_name'] = playbook.name if playbook else 'Unknown'
            
            execution_list.append(execution_dict)
        
        return jsonify({
            'executions': execution_list,
            'pagination': {
                'page': executions.page,
                'pages': executions.pages,
                'per_page': executions.per_page,
                'total': executions.total,
                'has_next': executions.has_next,
                'has_prev': executions.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/executions/<int:execution_id>', methods=['GET'])
def get_execution(execution_id):
    """Get detailed execution information including step executions."""
    try:
        execution = PlaybookExecution.query.get_or_404(execution_id)
        
        execution_dict = execution.to_dict()
        
        # Add customer and playbook information
        customer = Customer.query.get(execution.customer_id)
        playbook = Playbook.query.get(execution.playbook_id)
        
        execution_dict['customer'] = customer.to_dict() if customer else None
        execution_dict['playbook'] = playbook.to_dict() if playbook else None
        
        return jsonify(execution_dict)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/executions/<int:execution_id>/pause', methods=['POST'])
def pause_execution(execution_id):
    """Pause a playbook execution."""
    try:
        success = playbook_engine.pause_execution(execution_id)
        
        if success:
            return jsonify({'message': 'Execution paused successfully'})
        else:
            return jsonify({'error': 'Failed to pause execution'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/executions/<int:execution_id>/resume', methods=['POST'])
def resume_execution(execution_id):
    """Resume a paused playbook execution."""
    try:
        success = playbook_engine.resume_execution(execution_id)
        
        if success:
            return jsonify({'message': 'Execution resumed successfully'})
        else:
            return jsonify({'error': 'Failed to resume execution'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/initialize-defaults', methods=['POST'])
def initialize_default_playbooks():
    """Initialize the database with default playbook templates."""
    try:
        success = playbook_engine.initialize_default_playbooks()
        
        if success:
            return jsonify({'message': 'Default playbooks initialized successfully'})
        else:
            return jsonify({'error': 'Failed to initialize default playbooks'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/playbooks/performance', methods=['GET'])
def get_overall_performance():
    """Get overall playbook performance metrics."""
    try:
        performance = playbook_engine.get_playbook_performance()
        
        # Get additional metrics
        active_playbooks = Playbook.query.filter_by(is_active=True).count()
        total_playbooks = Playbook.query.count()
        
        performance.update({
            'active_playbooks': active_playbooks,
            'total_playbooks': total_playbooks
        })
        
        return jsonify(performance)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

