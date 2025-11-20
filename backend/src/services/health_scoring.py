import json
import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
from openai import OpenAI

class HealthScoringEngine:
    """
    Advanced customer health scoring engine that combines multiple data sources
    and uses AI to generate actionable insights and recommendations.
    """
    
    def __init__(self):
        self.client = OpenAI()  # Uses environment variables for API key and base URL
        
        # Scoring weights for different components
        self.weights = {
            'usage': 0.30,      # Product usage patterns
            'engagement': 0.25,  # Communication and interaction frequency
            'support': 0.25,     # Support ticket patterns and satisfaction
            'financial': 0.20    # Payment history and plan utilization
        }
        
        # Risk thresholds
        self.risk_thresholds = {
            'low': 80,
            'medium': 60,
            'high': 40,
            'critical': 0
        }
    
    def calculate_usage_score(self, customer_data: Dict) -> float:
        """
        Calculate usage score based on login frequency, feature adoption, and engagement depth.
        """
        score = 50.0  # Base score
        
        # Login frequency scoring
        if customer_data.get('last_login'):
            last_login = datetime.fromisoformat(customer_data['last_login'].replace('Z', '+00:00'))
            days_since_login = (datetime.now(timezone.utc) - last_login).days
            
            if days_since_login <= 1:
                score += 25
            elif days_since_login <= 7:
                score += 15
            elif days_since_login <= 30:
                score += 5
            else:
                score -= 20
        
        # Feature adoption scoring
        adoption_rate = customer_data.get('feature_adoption_rate', 0)
        score += (adoption_rate * 25)  # 0-25 points based on adoption rate
        
        # Onboarding completion
        if customer_data.get('onboarding_completed'):
            score += 15
        else:
            # Penalize if onboarding not completed after reasonable time
            created_date = datetime.fromisoformat(customer_data['created_date'].replace('Z', '+00:00'))
            days_since_signup = (datetime.now(timezone.utc) - created_date).days
            if days_since_signup > 14:
                score -= 15
        
        return max(0, min(100, score))
    
    def calculate_engagement_score(self, customer_data: Dict, activities: List[Dict]) -> float:
        """
        Calculate engagement score based on communication frequency and responsiveness.
        """
        score = 50.0  # Base score
        
        # Recent activity scoring
        recent_activities = [
            a for a in activities 
            if datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')) > 
            datetime.now(timezone.utc) - timedelta(days=30)
        ]
        
        activity_count = len(recent_activities)
        if activity_count >= 10:
            score += 25
        elif activity_count >= 5:
            score += 15
        elif activity_count >= 2:
            score += 5
        else:
            score -= 10
        
        # Last contact scoring
        if customer_data.get('last_contact_date'):
            last_contact = datetime.fromisoformat(customer_data['last_contact_date'].replace('Z', '+00:00'))
            days_since_contact = (datetime.now(timezone.utc) - last_contact).days
            
            if days_since_contact <= 7:
                score += 15
            elif days_since_contact <= 30:
                score += 5
            elif days_since_contact > 90:
                score -= 20
        
        return max(0, min(100, score))
    
    def calculate_support_score(self, customer_data: Dict) -> float:
        """
        Calculate support score based on ticket volume and resolution patterns.
        """
        score = 75.0  # Start with good assumption
        
        ticket_count = customer_data.get('support_tickets_count', 0)
        
        # Ticket volume impact
        if ticket_count == 0:
            score += 10  # No tickets is good
        elif ticket_count <= 2:
            score += 5   # Few tickets is normal
        elif ticket_count <= 5:
            score -= 5   # Moderate tickets
        else:
            score -= 15  # Many tickets indicate problems
        
        # Recent ticket activity
        if customer_data.get('last_support_ticket'):
            last_ticket = datetime.fromisoformat(customer_data['last_support_ticket'].replace('Z', '+00:00'))
            days_since_ticket = (datetime.now(timezone.utc) - last_ticket).days
            
            if days_since_ticket <= 7:
                score -= 10  # Recent tickets indicate ongoing issues
            elif days_since_ticket > 90:
                score += 10  # No recent tickets is good
        
        return max(0, min(100, score))
    
    def calculate_financial_score(self, customer_data: Dict) -> float:
        """
        Calculate financial score based on payment history and plan utilization.
        """
        score = 75.0  # Start with good assumption
        
        mrr = customer_data.get('mrr', 0)
        
        # MRR impact (higher MRR customers are typically more stable)
        if mrr >= 500:
            score += 15
        elif mrr >= 100:
            score += 10
        elif mrr >= 50:
            score += 5
        elif mrr < 20:
            score -= 10
        
        # Plan type considerations
        plan_type = customer_data.get('plan_type', '').lower()
        if 'enterprise' in plan_type or 'pro' in plan_type:
            score += 10
        elif 'trial' in plan_type or 'free' in plan_type:
            score -= 15
        
        # Time to value consideration
        ttv_days = customer_data.get('time_to_value_days')
        if ttv_days:
            if ttv_days <= 7:
                score += 10
            elif ttv_days <= 30:
                score += 5
            elif ttv_days > 90:
                score -= 10
        
        return max(0, min(100, score))
    
    def calculate_overall_health_score(self, customer_data: Dict, activities: List[Dict] = None) -> Dict:
        """
        Calculate comprehensive health score and component scores.
        """
        if activities is None:
            activities = []
        
        # Calculate component scores
        usage_score = self.calculate_usage_score(customer_data)
        engagement_score = self.calculate_engagement_score(customer_data, activities)
        support_score = self.calculate_support_score(customer_data)
        financial_score = self.calculate_financial_score(customer_data)
        
        # Calculate weighted overall score
        overall_score = (
            usage_score * self.weights['usage'] +
            engagement_score * self.weights['engagement'] +
            support_score * self.weights['support'] +
            financial_score * self.weights['financial']
        )
        
        # Determine risk level
        risk_level = 'low'
        for level, threshold in self.risk_thresholds.items():
            if overall_score >= threshold:
                risk_level = level
                break
        
        return {
            'overall_score': round(overall_score, 1),
            'usage_score': round(usage_score, 1),
            'engagement_score': round(engagement_score, 1),
            'support_score': round(support_score, 1),
            'financial_score': round(financial_score, 1),
            'risk_level': risk_level,
            'score_breakdown': {
                'usage': {
                    'score': round(usage_score, 1),
                    'weight': self.weights['usage'],
                    'contribution': round(usage_score * self.weights['usage'], 1)
                },
                'engagement': {
                    'score': round(engagement_score, 1),
                    'weight': self.weights['engagement'],
                    'contribution': round(engagement_score * self.weights['engagement'], 1)
                },
                'support': {
                    'score': round(support_score, 1),
                    'weight': self.weights['support'],
                    'contribution': round(support_score * self.weights['support'], 1)
                },
                'financial': {
                    'score': round(financial_score, 1),
                    'weight': self.weights['financial'],
                    'contribution': round(financial_score * self.weights['financial'], 1)
                }
            }
        }
    
    def identify_expansion_opportunity(self, customer_data: Dict, health_scores: Dict) -> str:
        """
        Identify expansion opportunities based on customer health and usage patterns.
        """
        overall_score = health_scores['overall_score']
        usage_score = health_scores['usage_score']
        financial_score = health_scores['financial_score']
        
        mrr = customer_data.get('mrr', 0)
        adoption_rate = customer_data.get('feature_adoption_rate', 0)
        
        # High health + high usage + good financial = high expansion opportunity
        if overall_score >= 80 and usage_score >= 75 and adoption_rate >= 0.7:
            return 'high'
        elif overall_score >= 70 and usage_score >= 60 and mrr >= 100:
            return 'medium'
        elif overall_score >= 60 and financial_score >= 70:
            return 'low'
        else:
            return 'none'
    
    async def generate_ai_insights(self, customer_data: Dict, health_scores: Dict, activities: List[Dict] = None) -> Dict:
        """
        Generate AI-powered insights and recommendations for the customer.
        """
        if activities is None:
            activities = []
        
        # Prepare context for AI analysis
        context = {
            'customer': {
                'name': customer_data.get('name', 'Unknown'),
                'company': customer_data.get('company', 'Unknown'),
                'plan_type': customer_data.get('plan_type', 'Unknown'),
                'mrr': customer_data.get('mrr', 0),
                'days_as_customer': (datetime.now(timezone.utc) - 
                                   datetime.fromisoformat(customer_data['created_date'].replace('Z', '+00:00'))).days,
                'onboarding_completed': customer_data.get('onboarding_completed', False),
                'feature_adoption_rate': customer_data.get('feature_adoption_rate', 0),
                'support_tickets_count': customer_data.get('support_tickets_count', 0)
            },
            'health_scores': health_scores,
            'recent_activities_count': len([
                a for a in activities 
                if datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')) > 
                datetime.now(timezone.utc) - timedelta(days=30)
            ])
        }
        
        prompt = f"""
        As an expert Customer Success Manager, analyze this customer profile and provide actionable insights:

        Customer Profile:
        - Name: {context['customer']['name']} ({context['customer']['company']})
        - Plan: {context['customer']['plan_type']} (${context['customer']['mrr']}/month)
        - Customer for: {context['customer']['days_as_customer']} days
        - Onboarding completed: {context['customer']['onboarding_completed']}
        - Feature adoption rate: {context['customer']['feature_adoption_rate']:.1%}
        - Support tickets: {context['customer']['support_tickets_count']}
        - Recent activities (30 days): {context['recent_activities_count']}

        Health Scores:
        - Overall Health: {health_scores['overall_score']}/100 (Risk: {health_scores['risk_level']})
        - Usage: {health_scores['usage_score']}/100
        - Engagement: {health_scores['engagement_score']}/100
        - Support: {health_scores['support_score']}/100
        - Financial: {health_scores['financial_score']}/100

        Provide a JSON response with:
        1. "summary": Brief 2-sentence assessment of customer health
        2. "key_risks": Array of top 3 risk factors (if any)
        3. "opportunities": Array of top 3 opportunities for improvement/expansion
        4. "recommended_actions": Array of 3-5 specific, actionable next steps
        5. "priority_level": "low", "medium", "high", or "urgent"
        6. "next_contact_days": Number of days until next recommended contact

        Focus on actionable, specific recommendations that a non-CSM manager could execute.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are an expert Customer Success Manager with 10+ years of experience. Provide practical, actionable insights in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            ai_insights = json.loads(response.choices[0].message.content)
            ai_insights['generated_at'] = datetime.now(timezone.utc).isoformat()
            ai_insights['model_used'] = 'gpt-4.1-mini'
            
            return ai_insights
            
        except Exception as e:
            # Fallback insights if AI fails
            return {
                'summary': f"Customer health score is {health_scores['overall_score']}/100 with {health_scores['risk_level']} churn risk. Requires attention based on current metrics.",
                'key_risks': self._generate_fallback_risks(health_scores),
                'opportunities': self._generate_fallback_opportunities(customer_data, health_scores),
                'recommended_actions': self._generate_fallback_actions(health_scores),
                'priority_level': self._determine_priority(health_scores['risk_level']),
                'next_contact_days': self._determine_contact_frequency(health_scores['risk_level']),
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'model_used': 'fallback',
                'error': str(e)
            }
    
    def _generate_fallback_risks(self, health_scores: Dict) -> List[str]:
        """Generate fallback risk assessment if AI fails."""
        risks = []
        
        if health_scores['usage_score'] < 50:
            risks.append("Low product usage indicates potential disengagement")
        if health_scores['engagement_score'] < 50:
            risks.append("Poor communication engagement suggests relationship issues")
        if health_scores['support_score'] < 50:
            risks.append("High support ticket volume indicates product issues")
        
        return risks[:3]
    
    def _generate_fallback_opportunities(self, customer_data: Dict, health_scores: Dict) -> List[str]:
        """Generate fallback opportunities if AI fails."""
        opportunities = []
        
        if health_scores['overall_score'] > 70:
            opportunities.append("Strong health score indicates expansion opportunity")
        if customer_data.get('feature_adoption_rate', 0) < 0.5:
            opportunities.append("Low feature adoption suggests training opportunity")
        if not customer_data.get('onboarding_completed'):
            opportunities.append("Complete onboarding to improve customer success")
        
        return opportunities[:3]
    
    def _generate_fallback_actions(self, health_scores: Dict) -> List[str]:
        """Generate fallback actions if AI fails."""
        actions = []
        
        if health_scores['risk_level'] in ['high', 'critical']:
            actions.append("Schedule immediate check-in call with customer")
            actions.append("Review recent support tickets and resolve outstanding issues")
        
        actions.append("Send personalized email with usage tips and best practices")
        actions.append("Schedule quarterly business review to discuss goals")
        
        return actions
    
    def _determine_priority(self, risk_level: str) -> str:
        """Determine priority level based on risk."""
        priority_map = {
            'critical': 'urgent',
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
        }
        return priority_map.get(risk_level, 'medium')
    
    def _determine_contact_frequency(self, risk_level: str) -> int:
        """Determine next contact frequency based on risk."""
        frequency_map = {
            'critical': 1,   # Contact immediately
            'high': 3,       # Contact within 3 days
            'medium': 14,    # Contact within 2 weeks
            'low': 30        # Contact within 30 days
        }
        return frequency_map.get(risk_level, 14)

