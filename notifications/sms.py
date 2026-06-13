import africastalking
from django.conf import settings

# initialize Africa's talking SDK with credentials from .env
africastalking.initialize(
    username=settings.AFRICASTALKING_USERNAME,
    api_key=settings.AFRICASTALKING_API_KEY
)

#get the sms service
sms = africastalking.SMS

def send_sms(phone_number, message):
    """
    Sends an sms to a patient's phone number.
    args: phone_number: Patient's phone number 
    message: The SMS message text
    Returns True if sent successfully, false if failed
    """
    try:
        #Africa's talking requires numbers in international format
        #Cameroon numbers start with +237
        response = sms.send(message, [phone_number])
        print(f"SMS sent to {phone_number}: {response}")
        return True
    except Exception as e:
        print(f"SMS failed to {phone_number}: {str(e)}")
        return False

def send_appointment_confirmation(patient, appointment):
    """
    send confirmation sms when appointment is booked.
    called from appointments/views.py after successful booking.
    """
    message = (
        f"Hello {patient.first_name}, your appointment has been confirmed. "
        f"Date: {appointment.appointment_date}, "
        f"Time: {appointment.appointment_time}. "
        f"Please arrive 10 minutes early. - Hospital Queue System"
    )
    return send_sms(patient.phone_number, message)

def send_queue_number(patient, queue_entry):
    """
    Sends queue number and estimated wait time to patient.
    Called from queues/views.py when patient joins queue.
    """

    message = (
        f"Hello {patient.first_name}, you are in the queue. "
        f"Your queue number is {queue_entry.queue_number}. "
        f"Estimated wait time: {queue_entry.display_wait_time} minutes. "
        f"- Hospital Queue System"
    )
    return send_sms(patient.phone_number, message)

def send_turn_notification(patient, queue_entry):
    """
    notifies patient when its almost their turn.
    called form queues/views.py when 1-2 patients are ahead.
    """
    message = (
        f"Hello {patient.first_name}, it's almost your turn! "
        f"Queue number {queue_entry.queue_number}, will be called soon. "
        f"Please proceed to the waiting area. "
        f"- Hospital Queue System"
    )
    return send_sms(patient.phone_number, message)
def send_appointment_reminder(patient, appointment):
    """
    Sends reminder SMS one day before appointment.
    Can be triggered by a scheduled task (future feature).
    """
    message = (
        f"Reminder: Hello {patient.first_name}, you have an appointment "
        f"tomorrow at {appointment.appointment_time}. "
        f"- Hospital Queue System"
    )
    return send_sms(patient.phone_number, message)
    