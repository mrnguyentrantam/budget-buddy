from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from models import db, Transaction, RecurringTransaction

class RecurringTransactionService:
    @staticmethod
    def calculate_next_occurrence(frequency, from_date):
        """
        Calculate the next occurrence date based on frequency.
        Daily = next day
        Weekly = next week
        Monthly = next month
        Yearly = next year
        """
        if frequency == 'daily':
            return from_date + timedelta(days=1)
        elif frequency == 'weekly':
            return from_date + timedelta(weeks=1)
        elif frequency == 'monthly':
            return from_date + relativedelta(months=1)
        elif frequency == 'yearly':
            return from_date + relativedelta(years=1)
        return None

    @staticmethod
    def generate_pending_transactions():
        """Generate transactions for all active recurring transactions that are due"""
        print("Generating pending transactions")
        today = datetime.now().date()
        recurring_transactions = RecurringTransaction.query.filter_by(is_active=True).all()
        
        for recurring_tx in recurring_transactions:
            next_date = recurring_tx.next_occurrence
            
            # Skip if no next occurrence or if it's not today
            if not next_date or next_date != today:
                continue
            
            if recurring_tx.end_date and next_date > recurring_tx.end_date:
                recurring_tx.is_active = False
                continue

            # Create new transaction only if next_occurrence is today
            new_transaction = Transaction(
                user_id=recurring_tx.user_id,
                category_id=recurring_tx.category_id,
                amount=recurring_tx.amount,
                description=f"{recurring_tx.description} (Recurring)",
                created_at=next_date
            )
            
            # Calculate and update next occurrence
            recurring_tx.last_generated = next_date
            recurring_tx.next_occurrence = RecurringTransactionService.calculate_next_occurrence(
                recurring_tx.frequency, 
                next_date
            )
            
            db.session.add(new_transaction)
            print(f"New transaction created: {new_transaction.to_dict()}")
        
        db.session.commit() 