import json
import requests
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

@dataclass
class IntegrationConfig:
    """Configuration for external platform integrations."""
    platform: str
    api_key: str
    api_secret: Optional[str] = None
    base_url: Optional[str] = None
    webhook_url: Optional[str] = None
    enabled: bool = True

class IntegrationService:
    """
    Service for managing integrations with external platforms like CRM, support, and billing systems.
    This is a framework for future integrations - MVP includes mock implementations.
    """
    
    def __init__(self):
        self.integrations = {}
        self.supported_platforms = [
            'stripe', 'hubspot', 'salesforce', 'intercom', 'zendesk', 
            'slack', 'mixpanel', 'amplitude', 'segment'
        ]
    
    def add_integration(self, config: IntegrationConfig) -> bool:
        """Add a new integration configuration."""
        try:
            if config.platform not in self.supported_platforms:
                raise ValueError(f"Platform {config.platform} not supported")
            
            self.integrations[config.platform] = config
            return True
            
        except Exception as e:
            print(f"Error adding integration: {e}")
            return False
    
    def remove_integration(self, platform: str) -> bool:
        """Remove an integration configuration."""
        try:
            if platform in self.integrations:
                del self.integrations[platform]
                return True
            return False
            
        except Exception as e:
            print(f"Error removing integration: {e}")
            return False
    
    def test_integration(self, platform: str) -> Dict[str, Any]:
        """Test connectivity to an integrated platform."""
        if platform not in self.integrations:
            return {'success': False, 'error': 'Integration not configured'}
        
        config = self.integrations[platform]
        
        try:
            if platform == 'stripe':
                return self._test_stripe_connection(config)
            elif platform == 'hubspot':
                return self._test_hubspot_connection(config)
            elif platform == 'salesforce':
                return self._test_salesforce_connection(config)
            elif platform == 'intercom':
                return self._test_intercom_connection(config)
            elif platform == 'zendesk':
                return self._test_zendesk_connection(config)
            elif platform == 'slack':
                return self._test_slack_connection(config)
            elif platform == 'mixpanel':
                return self._test_mixpanel_connection(config)
            elif platform == 'amplitude':
                return self._test_amplitude_connection(config)
            elif platform == 'segment':
                return self._test_segment_connection(config)
            else:
                return {'success': False, 'error': 'Platform not implemented'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def sync_customer_data(self, platform: str, customer_external_id: str) -> Dict[str, Any]:
        """Sync customer data from external platform."""
        if platform not in self.integrations:
            return {'success': False, 'error': 'Integration not configured'}
        
        config = self.integrations[platform]
        
        try:
            if platform == 'stripe':
                return self._sync_stripe_customer(config, customer_external_id)
            elif platform == 'hubspot':
                return self._sync_hubspot_contact(config, customer_external_id)
            elif platform == 'salesforce':
                return self._sync_salesforce_account(config, customer_external_id)
            elif platform == 'intercom':
                return self._sync_intercom_user(config, customer_external_id)
            elif platform == 'mixpanel':
                return self._sync_mixpanel_user(config, customer_external_id)
            elif platform == 'amplitude':
                return self._sync_amplitude_user(config, customer_external_id)
            else:
                return {'success': False, 'error': 'Platform sync not implemented'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_notification(self, platform: str, message: str, channel: str = None) -> Dict[str, Any]:
        """Send notification through integrated platform."""
        if platform not in self.integrations:
            return {'success': False, 'error': 'Integration not configured'}
        
        config = self.integrations[platform]
        
        try:
            if platform == 'slack':
                return self._send_slack_message(config, message, channel)
            elif platform == 'intercom':
                return self._send_intercom_message(config, message)
            else:
                return {'success': False, 'error': 'Notification platform not supported'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def track_event(self, platform: str, user_id: str, event_name: str, properties: Dict = None) -> Dict[str, Any]:
        """Track event in analytics platform."""
        if platform not in self.integrations:
            return {'success': False, 'error': 'Integration not configured'}
        
        config = self.integrations[platform]
        properties = properties or {}
        
        try:
            if platform == 'mixpanel':
                return self._track_mixpanel_event(config, user_id, event_name, properties)
            elif platform == 'amplitude':
                return self._track_amplitude_event(config, user_id, event_name, properties)
            elif platform == 'segment':
                return self._track_segment_event(config, user_id, event_name, properties)
            else:
                return {'success': False, 'error': 'Analytics platform not supported'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # Mock implementations for MVP - replace with actual API calls in production
    
    def _test_stripe_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Stripe connection test."""
        return {
            'success': True,
            'platform': 'stripe',
            'status': 'connected',
            'account_id': 'acct_mock123',
            'message': 'Successfully connected to Stripe'
        }
    
    def _test_hubspot_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock HubSpot connection test."""
        return {
            'success': True,
            'platform': 'hubspot',
            'status': 'connected',
            'portal_id': '12345678',
            'message': 'Successfully connected to HubSpot'
        }
    
    def _test_salesforce_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Salesforce connection test."""
        return {
            'success': True,
            'platform': 'salesforce',
            'status': 'connected',
            'org_id': 'org_mock123',
            'message': 'Successfully connected to Salesforce'
        }
    
    def _test_intercom_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Intercom connection test."""
        return {
            'success': True,
            'platform': 'intercom',
            'status': 'connected',
            'app_id': 'app_mock123',
            'message': 'Successfully connected to Intercom'
        }
    
    def _test_zendesk_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Zendesk connection test."""
        return {
            'success': True,
            'platform': 'zendesk',
            'status': 'connected',
            'subdomain': 'mockcompany',
            'message': 'Successfully connected to Zendesk'
        }
    
    def _test_slack_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Slack connection test."""
        return {
            'success': True,
            'platform': 'slack',
            'status': 'connected',
            'team_id': 'T12345678',
            'message': 'Successfully connected to Slack'
        }
    
    def _test_mixpanel_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Mixpanel connection test."""
        return {
            'success': True,
            'platform': 'mixpanel',
            'status': 'connected',
            'project_id': '12345',
            'message': 'Successfully connected to Mixpanel'
        }
    
    def _test_amplitude_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Amplitude connection test."""
        return {
            'success': True,
            'platform': 'amplitude',
            'status': 'connected',
            'app_id': 'app_mock123',
            'message': 'Successfully connected to Amplitude'
        }
    
    def _test_segment_connection(self, config: IntegrationConfig) -> Dict[str, Any]:
        """Mock Segment connection test."""
        return {
            'success': True,
            'platform': 'segment',
            'status': 'connected',
            'source_id': 'source_mock123',
            'message': 'Successfully connected to Segment'
        }
    
    def _sync_stripe_customer(self, config: IntegrationConfig, customer_id: str) -> Dict[str, Any]:
        """Mock Stripe customer sync."""
        return {
            'success': True,
            'platform': 'stripe',
            'customer_data': {
                'id': customer_id,
                'email': 'customer@example.com',
                'name': 'John Doe',
                'created': 1640995200,  # Mock timestamp
                'subscriptions': [
                    {
                        'id': 'sub_mock123',
                        'status': 'active',
                        'current_period_start': 1640995200,
                        'current_period_end': 1643673600,
                        'plan': {
                            'id': 'plan_mock123',
                            'amount': 2900,  # $29.00
                            'currency': 'usd',
                            'interval': 'month'
                        }
                    }
                ],
                'total_spent': 29000,  # $290.00 lifetime value
                'payment_method': 'card'
            }
        }
    
    def _sync_hubspot_contact(self, config: IntegrationConfig, contact_id: str) -> Dict[str, Any]:
        """Mock HubSpot contact sync."""
        return {
            'success': True,
            'platform': 'hubspot',
            'contact_data': {
                'id': contact_id,
                'email': 'contact@example.com',
                'firstname': 'Jane',
                'lastname': 'Smith',
                'company': 'Example Corp',
                'lifecyclestage': 'customer',
                'createdate': '2024-01-01T00:00:00Z',
                'lastmodifieddate': '2024-11-19T00:00:00Z',
                'hubspot_owner_id': '12345',
                'deal_stage': 'closedwon'
            }
        }
    
    def _sync_salesforce_account(self, config: IntegrationConfig, account_id: str) -> Dict[str, Any]:
        """Mock Salesforce account sync."""
        return {
            'success': True,
            'platform': 'salesforce',
            'account_data': {
                'Id': account_id,
                'Name': 'Example Corporation',
                'Type': 'Customer',
                'Industry': 'Technology',
                'AnnualRevenue': 1000000,
                'NumberOfEmployees': 50,
                'CreatedDate': '2024-01-01T00:00:00Z',
                'LastModifiedDate': '2024-11-19T00:00:00Z',
                'OwnerId': '005000000000000AAA'
            }
        }
    
    def _sync_intercom_user(self, config: IntegrationConfig, user_id: str) -> Dict[str, Any]:
        """Mock Intercom user sync."""
        return {
            'success': True,
            'platform': 'intercom',
            'user_data': {
                'id': user_id,
                'email': 'user@example.com',
                'name': 'Alex Johnson',
                'created_at': 1640995200,
                'updated_at': 1700000000,
                'last_seen_at': 1700000000,
                'session_count': 45,
                'unsubscribed_from_emails': False,
                'custom_attributes': {
                    'plan': 'pro',
                    'mrr': 99,
                    'signup_date': '2024-01-01'
                }
            }
        }
    
    def _sync_mixpanel_user(self, config: IntegrationConfig, user_id: str) -> Dict[str, Any]:
        """Mock Mixpanel user sync."""
        return {
            'success': True,
            'platform': 'mixpanel',
            'user_data': {
                'distinct_id': user_id,
                'properties': {
                    '$email': 'user@example.com',
                    '$name': 'Chris Wilson',
                    '$created': '2024-01-01T00:00:00',
                    '$last_seen': '2024-11-19T00:00:00',
                    'plan_type': 'premium',
                    'total_events': 1250,
                    'days_active': 45
                }
            }
        }
    
    def _sync_amplitude_user(self, config: IntegrationConfig, user_id: str) -> Dict[str, Any]:
        """Mock Amplitude user sync."""
        return {
            'success': True,
            'platform': 'amplitude',
            'user_data': {
                'user_id': user_id,
                'properties': {
                    'email': 'user@example.com',
                    'name': 'Sam Taylor',
                    'signup_date': '2024-01-01',
                    'last_active': '2024-11-19',
                    'plan': 'business',
                    'feature_usage': {
                        'dashboard_views': 89,
                        'reports_created': 12,
                        'integrations_used': 3
                    }
                }
            }
        }
    
    def _send_slack_message(self, config: IntegrationConfig, message: str, channel: str = None) -> Dict[str, Any]:
        """Mock Slack message sending."""
        return {
            'success': True,
            'platform': 'slack',
            'message_id': 'msg_mock123',
            'channel': channel or '#general',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'Message sent successfully'
        }
    
    def _send_intercom_message(self, config: IntegrationConfig, message: str) -> Dict[str, Any]:
        """Mock Intercom message sending."""
        return {
            'success': True,
            'platform': 'intercom',
            'message_id': 'msg_mock123',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'Message sent successfully'
        }
    
    def _track_mixpanel_event(self, config: IntegrationConfig, user_id: str, event_name: str, properties: Dict) -> Dict[str, Any]:
        """Mock Mixpanel event tracking."""
        return {
            'success': True,
            'platform': 'mixpanel',
            'event_id': 'evt_mock123',
            'user_id': user_id,
            'event_name': event_name,
            'properties': properties,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'Event tracked successfully'
        }
    
    def _track_amplitude_event(self, config: IntegrationConfig, user_id: str, event_name: str, properties: Dict) -> Dict[str, Any]:
        """Mock Amplitude event tracking."""
        return {
            'success': True,
            'platform': 'amplitude',
            'event_id': 'evt_mock123',
            'user_id': user_id,
            'event_name': event_name,
            'properties': properties,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'Event tracked successfully'
        }
    
    def _track_segment_event(self, config: IntegrationConfig, user_id: str, event_name: str, properties: Dict) -> Dict[str, Any]:
        """Mock Segment event tracking."""
        return {
            'success': True,
            'platform': 'segment',
            'message_id': 'msg_mock123',
            'user_id': user_id,
            'event_name': event_name,
            'properties': properties,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'message': 'Event tracked successfully'
        }
    
    def get_integration_status(self) -> Dict[str, Any]:
        """Get status of all configured integrations."""
        status = {
            'total_integrations': len(self.integrations),
            'active_integrations': len([i for i in self.integrations.values() if i.enabled]),
            'supported_platforms': self.supported_platforms,
            'configured_platforms': list(self.integrations.keys()),
            'integrations': {}
        }
        
        for platform, config in self.integrations.items():
            status['integrations'][platform] = {
                'enabled': config.enabled,
                'platform': config.platform,
                'has_webhook': config.webhook_url is not None,
                'last_tested': None  # Would track actual test timestamps in production
            }
        
        return status
    
    def bulk_sync_customers(self, platform: str, customer_ids: List[str]) -> Dict[str, Any]:
        """Sync multiple customers from external platform."""
        if platform not in self.integrations:
            return {'success': False, 'error': 'Integration not configured'}
        
        results = []
        successful = 0
        failed = 0
        
        for customer_id in customer_ids:
            result = self.sync_customer_data(platform, customer_id)
            results.append({
                'customer_id': customer_id,
                'success': result['success'],
                'error': result.get('error'),
                'data': result.get('customer_data') if result['success'] else None
            })
            
            if result['success']:
                successful += 1
            else:
                failed += 1
        
        return {
            'success': True,
            'platform': platform,
            'total_processed': len(customer_ids),
            'successful': successful,
            'failed': failed,
            'results': results
        }

