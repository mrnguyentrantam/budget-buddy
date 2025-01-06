from datetime import datetime
from models import db, Transaction, RecurringTransaction

class RecurringTransactionService:
    @staticmethod
    def generate_pending_transactions():
        """Generate transactions for all active recurring transactions that are due"""
        today = datetime.now().date()
        recurring_transactions = RecurringTransaction.query.filter_by(is_active=True).all()
        
        for recurring_tx in recurring_transactions:
            next_date = recurring_tx.next_occurrence
            
            if next_date and next_date <= today:
                # Create new transaction
                new_transaction = Transaction(
                    user_id=recurring_tx.user_id,
                    category_id=recurring_tx.category_id,
                    amount=recurring_tx.amount,
                    description=f"{recurring_tx.description} (Recurring)",
                    date=next_date
                )
                
                # Update last_generated date
                recurring_tx.last_generated = next_date
                
                db.session.add(new_transaction)
        
        db.session.commit() 