from flask import Blueprint, request, jsonify
from src.services.integration_service import IntegrationService, IntegrationConfig

integrations_bp = Blueprint('integrations', __name__)
integration_service = IntegrationService()

@integrations_bp.route('/integrations', methods=['GET'])
def get_integrations():
    """Get all configured integrations and their status."""
    try:
        status = integration_service.get_integration_status()
        return jsonify(status), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/supported', methods=['GET'])
def get_supported_platforms():
    """Get list of supported integration platforms."""
    try:
        return jsonify({
            'supported_platforms': integration_service.supported_platforms,
            'total': len(integration_service.supported_platforms)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations', methods=['POST'])
def add_integration():
    """Add a new integration configuration."""
    try:
        data = request.get_json()
        
        if not data or 'platform' not in data or 'api_key' not in data:
            return jsonify({'error': 'Platform and api_key are required'}), 400
        
        config = IntegrationConfig(
            platform=data['platform'],
            api_key=data['api_key'],
            api_secret=data.get('api_secret'),
            base_url=data.get('base_url'),
            webhook_url=data.get('webhook_url'),
            enabled=data.get('enabled', True)
        )
        
        success = integration_service.add_integration(config)
        
        if success:
            return jsonify({
                'message': f'Integration for {data["platform"]} added successfully',
                'platform': data['platform']
            }), 201
        else:
            return jsonify({'error': 'Failed to add integration'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>', methods=['DELETE'])
def remove_integration(platform):
    """Remove an integration configuration."""
    try:
        success = integration_service.remove_integration(platform)
        
        if success:
            return jsonify({
                'message': f'Integration for {platform} removed successfully'
            }), 200
        else:
            return jsonify({'error': f'Integration for {platform} not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>/test', methods=['POST'])
def test_integration(platform):
    """Test connectivity to an integrated platform."""
    try:
        result = integration_service.test_integration(platform)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>/sync/<customer_id>', methods=['POST'])
def sync_customer_data(platform, customer_id):
    """Sync customer data from external platform."""
    try:
        result = integration_service.sync_customer_data(platform, customer_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>/sync/bulk', methods=['POST'])
def bulk_sync_customers(platform):
    """Sync multiple customers from external platform."""
    try:
        data = request.get_json()
        
        if not data or 'customer_ids' not in data:
            return jsonify({'error': 'customer_ids array is required'}), 400
        
        customer_ids = data['customer_ids']
        if not isinstance(customer_ids, list):
            return jsonify({'error': 'customer_ids must be an array'}), 400
        
        result = integration_service.bulk_sync_customers(platform, customer_ids)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>/notify', methods=['POST'])
def send_notification(platform):
    """Send notification through integrated platform."""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'message is required'}), 400
        
        message = data['message']
        channel = data.get('channel')
        
        result = integration_service.send_notification(platform, message, channel)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>/track', methods=['POST'])
def track_event(platform):
    """Track event in analytics platform."""
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data or 'event_name' not in data:
            return jsonify({'error': 'user_id and event_name are required'}), 400
        
        user_id = data['user_id']
        event_name = data['event_name']
        properties = data.get('properties', {})
        
        result = integration_service.track_event(platform, user_id, event_name, properties)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/demo/setup', methods=['POST'])
def setup_demo_integrations():
    """Set up demo integrations for testing purposes."""
    try:
        demo_integrations = [
            IntegrationConfig(
                platform='stripe',
                api_key='sk_test_demo123',
                enabled=True
            ),
            IntegrationConfig(
                platform='hubspot',
                api_key='demo_hubspot_key',
                enabled=True
            ),
            IntegrationConfig(
                platform='intercom',
                api_key='demo_intercom_key',
                enabled=True
            ),
            IntegrationConfig(
                platform='slack',
                api_key='xoxb-demo-slack-token',
                enabled=True
            ),
            IntegrationConfig(
                platform='mixpanel',
                api_key='demo_mixpanel_key',
                enabled=True
            )
        ]
        
        added_count = 0
        for config in demo_integrations:
            if integration_service.add_integration(config):
                added_count += 1
        
        return jsonify({
            'message': f'Demo integrations set up successfully',
            'integrations_added': added_count,
            'total_integrations': len(demo_integrations)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/webhook/<platform>', methods=['POST'])
def handle_webhook(platform):
    """Handle incoming webhooks from integrated platforms."""
    try:
        data = request.get_json()
        headers = dict(request.headers)
        
        # In a real implementation, you would:
        # 1. Verify webhook signature
        # 2. Parse platform-specific webhook format
        # 3. Update customer data based on webhook events
        # 4. Trigger relevant playbooks or actions
        
        # For MVP, we'll just log the webhook and return success
        webhook_data = {
            'platform': platform,
            'timestamp': data.get('timestamp') if data else None,
            'event_type': data.get('type') if data else 'unknown',
            'data_received': data is not None,
            'headers_count': len(headers)
        }
        
        return jsonify({
            'success': True,
            'message': f'Webhook received for {platform}',
            'webhook_data': webhook_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@integrations_bp.route('/integrations/<platform>/health', methods=['GET'])
def get_integration_health(platform):
    """Get health status of a specific integration."""
    try:
        if platform not in integration_service.integrations:
            return jsonify({'error': f'Integration for {platform} not configured'}), 404
        
        # Test the connection
        test_result = integration_service.test_integration(platform)
        
        config = integration_service.integrations[platform]
        health_data = {
            'platform': platform,
            'enabled': config.enabled,
            'connection_status': 'healthy' if test_result['success'] else 'unhealthy',
            'last_test_result': test_result,
            'has_webhook': config.webhook_url is not None,
            'configuration_complete': bool(config.api_key)
        }
        
        return jsonify(health_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

