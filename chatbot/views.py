from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import os
from django.utils import timezone
from accounts.models import Hospital

class ChatAssistantView(APIView):
    """
    Patient AI Chat Assistant View.
    Classifies symptoms (Urgent vs Routine) and answers FAQs.
    Uses Anthropic Claude if ANTHROPIC_API_KEY / CLAUDE_API_KEY is present;
    otherwise, falls back to a smart local rule-engine.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response(
                {'error': 'Message parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        api_key = os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('CLAUDE_API_KEY')
        
        # Check if anthropic package is installed
        has_anthropic = False
        try:
            import anthropic
            has_anthropic = True
        except ImportError:
            pass

        # ------------------------------------------------------------
        # MODE A: LIVE CLAUDE LLM AGENT
        # ------------------------------------------------------------
        if api_key and has_anthropic:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=api_key)
                
                # Fetch registered hospitals to include in prompt context
                hospitals = Hospital.objects.all()
                hospital_context = ""
                if hospitals.exists():
                    hospital_context = "Registered hospitals in our network:\n" + "\n".join(
                        [f"- {h.name} located at {h.address} (Phone: {h.phone_number or 'N/A'})" for h in hospitals]
                    )
                else:
                    hospital_context = "There are currently no registered hospitals in our network."

                system_prompt = (
                    "You are the MediQueue AI Triage and FAQ Assistant. Your role is to help patients triage their symptoms "
                    "and answer FAQs about registered hospitals in our system. Follow these instructions strictly:\n"
                    "1. Symptom Triage: If the patient describes symptoms, analyze them and explicitly state if they are URGENT "
                    "(Priority 2) or ROUTINE (Priority 3). Guide them on whether they need to book an urgent consult or a standard booking.\n"
                    f"2. Clinic Info: Here is the list of active hospitals in our network:\n{hospital_context}\n"
                    "3. Opening Hours: Emergency walk-ins are open 24/7 across all hospitals. Standard outpatient appointments are "
                    "Monday through Sunday, 08:00 AM to 05:00 PM.\n"
                    "4. Queue Priority: Explain that MediQueue prioritizes Emergency (1) first, then Urgent (2), then Routine (3).\n"
                    "5. Formatting: Be brief, polite, and limit responses to 2-3 sentences. Do not use emojis."
                )

                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=250,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": message}
                    ]
                )
                
                return Response({
                    'response': response.content[0].text,
                    'is_live_ai': True
                })
            except Exception as e:
                # If API call fails, log and fallback to local rule-engine
                print(f"Chatbot Claude API error (falling back): {e}")

        # ------------------------------------------------------------
        # MODE B: FALLBACK TRIAGE & FAQ ENGINE
        # ------------------------------------------------------------
        msg = message.lower()
        hospitals = Hospital.objects.all()

        # 1. Location / Address FAQ
        if any(k in msg for k in ['location', 'where', 'address', 'hospital', 'hospitals', 'facility', 'facilities']):
            if hospitals.exists():
                hlist = "\n".join([f"- {h.name}: {h.address}" for h in hospitals])
                reply = f"Here are the locations of the registered hospitals in our network:\n{hlist}"
            else:
                reply = "There are currently no registered hospitals in the system. Hospital administrators can register their facilities through our onboarding portal."

        # 2. Hours / Schedule FAQ
        elif any(k in msg for k in ['hour', 'hours', 'time', 'open', 'schedule', 'close', 'closed']):
            reply = "Emergency walk-ins are admitted 24/7 across all network hospitals. Standard consulting hours for scheduled outpatient appointments are Monday through Sunday, 08:00 AM to 05:00 PM."

        # 3. Queue / Position / Triage FAQ
        elif any(k in msg for k in ['queue', 'position', 'wait', 'triage', 'priority', 'mechanic', 'work']):
            reply = "MediQueue operates on a priority triage basis: Emergency cases (Priority 1) are treated immediately, followed by Urgent symptom cases (Priority 2), and Routine checkups (Priority 3). Within each tier, patients are seen in order of arrival."

        # 4. Booking / How to Book FAQ
        elif any(k in msg for k in ['book', 'appointment', 'reserve', 'schedule', 'doctor', 'visit']):
            reply = "To book an appointment, go to the 'Book Appointment' section in the sidebar. Select a hospital, choose a doctor, select an available date and time slot, and describe your symptoms."

        # 5. Symptom Triage Analysis
        else:
            urgent_keywords = [
                'chest pain', 'breathing', 'shortness of breath', 'bleeding', 
                'unconscious', 'fracture', 'broken', 'seizure', 'convulsion',
                'severe', 'heart', 'stroke', 'paralysis', 'urgent', 'accident'
            ]
            is_urgent = False
            for kw in urgent_keywords:
                if kw in msg:
                    is_urgent = True
                    break
            
            if any(k in msg for k in ['pain', 'fever', 'cough', 'sick', 'symptom', 'symptoms', 'hurt', 'headache', 'stomach', 'flu', 'cold', 'infection']):
                if is_urgent:
                    reply = "Based on the symptoms described, this sounds like an URGENT case. We recommend scheduling an immediate appointment or visiting the emergency room if symptoms worsen. When booking, your priority will automatically be upgraded."
                else:
                    reply = "Based on the symptoms described, this sounds like a ROUTINE case. You can schedule a regular outpatient appointment via the 'Book Appointment' portal at your convenience."
            else:
                reply = "Hello! I am your MediQueue Triage Assistant. I can help analyze your symptoms (e.g. try asking 'I have severe chest pain' or 'I have a mild fever'), answer FAQs about our hospitals' locations and hours, or guide you on how to book an appointment."

        return Response({
            'response': reply,
            'is_live_ai': False
        })
