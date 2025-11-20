import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from openai import OpenAI

from src.models.user import db
from src.models.customer import Customer, CustomerActivity, CSMAction
from src.models.playbook import Playbook, PlaybookStep, PlaybookExecution, StepExecution, PLAYBOOK_TEMPLATES

class PlaybookEngine:
    """
    AI-powered playbook automation engine that executes customer success workflows
    based on customer health, behavior patterns, and predefined triggers.
    """
    
    def __init__(self):
        self.client = OpenAI()  # Uses environment variables for API key and base URL
    
    def initialize_default_playbooks(self):
        """Initialize the database with default playbook templates."""
        try:
            for template in PLAYBOOK_TEMPLATES:
                # Check if playbook already exists
                existing = Playbook.query.filter_by(name=template['name']).first()
                if existing:
                    continue
                
                # Create new playbook
                playbook = Playbook(
                    name=template['name'],
                    description=template['description'],
                    category=template['category'],
                    trigger_conditions=json.dumps(template['trigger_conditions']),
                    is_active=True,
                    priority=5
                )
                
                db.session.add(playbook)
                db.session.flush()  # Get the playbook ID
                
                # Add steps
                for step_data in template['steps']:
                    step = PlaybookStep(
                        playbook_id=playbook.id,
                        step_order=step_data['step_order'],
                        step_type=step_data['step_type'],
                        title=step_data['title'],
                        description=step_data['description'],
                        delay_hours=step_data.get('delay_hours', 0),
                        config=json.dumps(step_data.get('config', {}))
                    )
                    db.session.add(step)
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error initializing playbooks: {e}")
            return False
    
    def evaluate_triggers(self, customer: Customer) -> List[Playbook]:
        """
        Evaluate which playbooks should be triggered for a given customer.
        """
        triggered_playbooks = []
        active_playbooks = Playbook.query.filter_by(is_active=True).all()
        
        for playbook in active_playbooks:
            if self._check_trigger_conditions(customer, playbook):
                # Check if playbook is already running for this customer
                existing_execution = PlaybookExecution.query.filter_by(
                    customer_id=customer.id,
                    playbook_id=playbook.id,
                    status='active'
                ).first()
                
                if not existing_execution:
                    triggered_playbooks.append(playbook)
        
        return triggered_playbooks
    
    def _check_trigger_conditions(self, customer: Customer, playbook: Playbook) -> bool:
        """
        Check if a customer meets the trigger conditions for a playbook.
        """
        try:
            conditions = json.loads(playbook.trigger_conditions)
            customer_data = customer.to_dict()
            
            # Calculate customer age in days
            created_date = datetime.fromisoformat(customer_data['created_date'].replace('Z', '+00:00'))
            customer_age_days = (datetime.now(timezone.utc) - created_date).days
            
            # Check each condition
            for condition_key, condition_value in conditions.items():
                if condition_key == 'customer_age_days':
                    if isinstance(condition_value, dict):
                        if 'min' in condition_value and customer_age_days < condition_value['min']:
                            return False
                        if 'max' in condition_value and customer_age_days > condition_value['max']:
                            return False
                    else:
                        if customer_age_days != condition_value:
                            return False
                
                elif condition_key == 'last_login_days':
                    if customer_data.get('last_login'):
                        last_login = datetime.fromisoformat(customer_data['last_login'].replace('Z', '+00:00'))
                        days_since_login = (datetime.now(timezone.utc) - last_login).days
                        
                        if isinstance(condition_value, dict):
                            if 'min' in condition_value and days_since_login < condition_value['min']:
                                return False
                            if 'max' in condition_value and days_since_login > condition_value['max']:
                                return False
                    else:
                        # No login recorded, consider as infinite days
                        if isinstance(condition_value, dict) and 'min' in condition_value:
                            continue  # Assume condition is met if no login and min days required
                        return False
                
                elif condition_key in ['churn_risk_level', 'expansion_opportunity']:
                    customer_value = customer_data.get(condition_key)
                    if isinstance(condition_value, list):
                        if customer_value not in condition_value:
                            return False
                    else:
                        if customer_value != condition_value:
                            return False
                
                elif condition_key == 'health_score':
                    health_score = customer_data.get('health_score', 0)
                    if isinstance(condition_value, dict):
                        if 'min' in condition_value and health_score < condition_value['min']:
                            return False
                        if 'max' in condition_value and health_score > condition_value['max']:
                            return False
                
                elif condition_key in customer_data:
                    if customer_data[condition_key] != condition_value:
                        return False
            
            return True
            
        except Exception as e:
            print(f"Error checking trigger conditions: {e}")
            return False
    
    def start_playbook_execution(self, customer: Customer, playbook: Playbook) -> PlaybookExecution:
        """
        Start executing a playbook for a customer.
        """
        try:
            execution = PlaybookExecution(
                customer_id=customer.id,
                playbook_id=playbook.id,
                status='active',
                current_step=0,
                started_date=datetime.now(timezone.utc)
            )
            
            db.session.add(execution)
            db.session.commit()
            
            # Schedule first step
            self._schedule_next_step(execution)
            
            return execution
            
        except Exception as e:
            db.session.rollback()
            print(f"Error starting playbook execution: {e}")
            return None
    
    def _schedule_next_step(self, execution: PlaybookExecution):
        """
        Schedule the next step in a playbook execution.
        """
        try:
            playbook = Playbook.query.get(execution.playbook_id)
            steps = sorted(playbook.steps, key=lambda x: x.step_order)
            
            if execution.current_step >= len(steps):
                # Playbook completed
                execution.status = 'completed'
                execution.completed_date = datetime.now(timezone.utc)
                execution.success = True
                db.session.commit()
                return
            
            current_step = steps[execution.current_step]
            
            # Calculate when to execute this step
            next_execution_time = datetime.now(timezone.utc) + timedelta(hours=current_step.delay_hours)
            execution.next_step_date = next_execution_time
            
            db.session.commit()
            
        except Exception as e:
            print(f"Error scheduling next step: {e}")
    
    def execute_pending_steps(self):
        """
        Execute all pending playbook steps that are due.
        """
        try:
            # Find all executions with steps due for execution
            due_executions = PlaybookExecution.query.filter(
                PlaybookExecution.status == 'active',
                PlaybookExecution.next_step_date <= datetime.now(timezone.utc)
            ).all()
            
            for execution in due_executions:
                self._execute_current_step(execution)
            
        except Exception as e:
            print(f"Error executing pending steps: {e}")
    
    def _execute_current_step(self, execution: PlaybookExecution):
        """
        Execute the current step of a playbook execution.
        """
        try:
            playbook = Playbook.query.get(execution.playbook_id)
            customer = Customer.query.get(execution.customer_id)
            steps = sorted(playbook.steps, key=lambda x: x.step_order)
            
            if execution.current_step >= len(steps):
                return
            
            current_step = steps[execution.current_step]
            
            # Create step execution record
            step_execution = StepExecution(
                execution_id=execution.id,
                step_id=current_step.id,
                status='running',
                started_date=datetime.now(timezone.utc)
            )
            db.session.add(step_execution)
            db.session.flush()
            
            # Execute the step based on its type
            success = False
            output = {}
            error_message = None
            
            try:
                if current_step.step_type == 'email':
                    success, output = self._execute_email_step(customer, current_step)
                elif current_step.step_type == 'task':
                    success, output = self._execute_task_step(customer, current_step)
                elif current_step.step_type == 'wait':
                    success, output = self._execute_wait_step(current_step)
                elif current_step.step_type == 'condition':
                    success, output = self._execute_condition_step(customer, current_step)
                else:
                    success = False
                    error_message = f"Unknown step type: {current_step.step_type}"
                
            except Exception as step_error:
                success = False
                error_message = str(step_error)
            
            # Update step execution
            step_execution.status = 'completed' if success else 'failed'
            step_execution.completed_date = datetime.now(timezone.utc)
            step_execution.success = success
            step_execution.output = json.dumps(output) if output else None
            step_execution.error_message = error_message
            
            # Move to next step or complete execution
            if success:
                execution.current_step += 1
                self._schedule_next_step(execution)
            else:
                execution.status = 'failed'
                execution.completed_date = datetime.now(timezone.utc)
                execution.success = False
            
            db.session.commit()
            
        except Exception as e:
            db.session.rollback()
            print(f"Error executing step: {e}")
    
    def _execute_email_step(self, customer: Customer, step: PlaybookStep) -> tuple[bool, Dict]:
        """
        Execute an email step by generating and logging the email content.
        """
        try:
            config = json.loads(step.config) if step.config else {}
            
            # Generate personalized email content using AI
            email_content = self._generate_email_content(customer, step, config)
            
            # In a real implementation, this would send the email
            # For MVP, we'll just create a CSM action record
            action = CSMAction(
                customer_id=customer.id,
                action_type='email',
                title=f"Automated Email: {step.title}",
                description=email_content.get('body', step.description),
                priority='medium',
                ai_generated=True,
                action_status='completed',
                completed_date=datetime.now(timezone.utc),
                outcome=f"Email sent: {email_content.get('subject', step.title)}"
            )
            
            db.session.add(action)
            
            return True, {
                'email_subject': email_content.get('subject', step.title),
                'email_body': email_content.get('body', step.description),
                'action_id': action.id
            }
            
        except Exception as e:
            return False, {'error': str(e)}
    
    def _execute_task_step(self, customer: Customer, step: PlaybookStep) -> tuple[bool, Dict]:
        """
        Execute a task step by creating a CSM action.
        """
        try:
            config = json.loads(step.config) if step.config else {}
            
            # Create CSM action
            action = CSMAction(
                customer_id=customer.id,
                action_type=config.get('task_type', 'task'),
                title=step.title,
                description=step.description,
                priority=config.get('priority', 'medium'),
                ai_generated=True,
                action_status='pending'
            )
            
            # Set scheduled date if specified
            if config.get('duration_minutes'):
                action.description += f"\n\nEstimated duration: {config['duration_minutes']} minutes"
            
            db.session.add(action)
            
            return True, {
                'action_id': action.id,
                'task_type': config.get('task_type', 'task'),
                'priority': config.get('priority', 'medium')
            }
            
        except Exception as e:
            return False, {'error': str(e)}
    
    def _execute_wait_step(self, step: PlaybookStep) -> tuple[bool, Dict]:
        """
        Execute a wait step (essentially a no-op that just waits).
        """
        return True, {'waited_hours': step.delay_hours}
    
    def _execute_condition_step(self, customer: Customer, step: PlaybookStep) -> tuple[bool, Dict]:
        """
        Execute a conditional step that evaluates customer state.
        """
        try:
            conditions = json.loads(step.conditions) if step.conditions else {}
            
            # Evaluate conditions (similar to trigger evaluation)
            result = self._check_trigger_conditions(customer, type('obj', (object,), {
                'trigger_conditions': step.conditions
            })())
            
            return True, {'condition_result': result, 'conditions_met': result}
            
        except Exception as e:
            return False, {'error': str(e)}
    
    def _generate_email_content(self, customer: Customer, step: PlaybookStep, config: Dict) -> Dict:
        """
        Generate personalized email content using AI.
        """
        try:
            customer_data = customer.to_dict()
            
            prompt = f"""
            Generate a professional, personalized customer success email for the following scenario:

            Customer Information:
            - Name: {customer_data.get('name', 'Valued Customer')}
            - Company: {customer_data.get('company', 'N/A')}
            - Plan: {customer_data.get('plan_type', 'N/A')}
            - Health Score: {customer_data.get('health_score', 0)}/100
            - Days as Customer: {(datetime.now(timezone.utc) - datetime.fromisoformat(customer_data['created_date'].replace('Z', '+00:00'))).days}
            - Onboarding Completed: {customer_data.get('onboarding_completed', False)}

            Email Context:
            - Title: {step.title}
            - Description: {step.description}
            - Template Type: {config.get('template', 'general')}
            - Personalization: {config.get('personalization', True)}

            Generate a JSON response with:
            1. "subject": Professional email subject line (max 60 characters)
            2. "body": Email body with proper greeting, personalized content, clear call-to-action, and professional closing
            3. "tone": The tone used (professional, friendly, urgent, etc.)

            Keep the email concise, actionable, and focused on customer value.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert Customer Success Manager writing personalized emails. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            # Fallback email content
            return {
                'subject': step.title,
                'body': f"Hi {customer.name},\n\n{step.description}\n\nBest regards,\nYour Customer Success Team",
                'tone': 'professional',
                'error': str(e)
            }
    
    def get_active_executions(self, customer_id: Optional[int] = None) -> List[PlaybookExecution]:
        """
        Get all active playbook executions, optionally filtered by customer.
        """
        query = PlaybookExecution.query.filter_by(status='active')
        
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        
        return query.all()
    
    def pause_execution(self, execution_id: int) -> bool:
        """
        Pause a playbook execution.
        """
        try:
            execution = PlaybookExecution.query.get(execution_id)
            if execution and execution.status == 'active':
                execution.status = 'paused'
                db.session.commit()
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error pausing execution: {e}")
            return False
    
    def resume_execution(self, execution_id: int) -> bool:
        """
        Resume a paused playbook execution.
        """
        try:
            execution = PlaybookExecution.query.get(execution_id)
            if execution and execution.status == 'paused':
                execution.status = 'active'
                self._schedule_next_step(execution)
                return True
            return False
        except Exception as e:
            db.session.rollback()
            print(f"Error resuming execution: {e}")
            return False
    
    def get_playbook_performance(self, playbook_id: Optional[int] = None) -> Dict:
        """
        Get performance metrics for playbooks.
        """
        try:
            query = PlaybookExecution.query
            
            if playbook_id:
                query = query.filter_by(playbook_id=playbook_id)
            
            executions = query.all()
            
            total_executions = len(executions)
            successful_executions = len([e for e in executions if e.success is True])
            active_executions = len([e for e in executions if e.status == 'active'])
            failed_executions = len([e for e in executions if e.status == 'failed'])
            
            success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
            
            return {
                'total_executions': total_executions,
                'successful_executions': successful_executions,
                'active_executions': active_executions,
                'failed_executions': failed_executions,
                'success_rate': round(success_rate, 1)
            }
            
        except Exception as e:
            return {'error': str(e)}

