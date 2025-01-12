from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
from models import db, Transaction, RecurringTransaction

class RecurringTransactionService:
    @staticmethod
    def calculate_next_occurrence(frequency, from_date):
        """
        Calculate the next occurrence date based on frequency.
        Returns datetime object with time set to midnight.
        Daily = next day
        Weekly = next week
        Monthly = next month
        Yearly = next year
        """
        # Convert from_date to datetime if it's a date
        if isinstance(from_date, date):
            from_date = datetime.combine(from_date, datetime.min.time())
            
        if frequency == 'daily':
            next_date = from_date + timedelta(days=1)
        elif frequency == 'weekly':
            next_date = from_date + timedelta(weeks=1)
        elif frequency == 'monthly':
            next_date = from_date + relativedelta(months=1)
        elif frequency == 'yearly':
            next_date = from_date + relativedelta(years=1)
        else:
            return None
            
        # Ensure we return a datetime object
        if isinstance(next_date, date):
            return datetime.combine(next_date, datetime.min.time())
        return next_date

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

            new_transaction = Transaction(
                user_id=recurring_tx.user_id,
                category_id=recurring_tx.category_id,
                amount=recurring_tx.amount,
                description=f"{recurring_tx.description} (Chi phí lặp lại)",
                created_at=datetime.fromisoformat(next_date.isoformat()),
                updated_at=datetime.fromisoformat(next_date.isoformat())
            )

            recurring_tx.last_generated = next_date
            recurring_tx.next_occurrence = RecurringTransactionService.calculate_next_occurrence(
                recurring_tx.frequency, 
                next_date
            )
            print(f"Creating new transaction for recurring transaction {recurring_tx.id}, next_occurrence: {next_date}")

            
            db.session.add(new_transaction)
            print(f"New transaction created: {new_transaction.to_dict()}")
        
        db.session.commit() 