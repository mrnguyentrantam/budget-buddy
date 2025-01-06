from datetime import datetime
from . import db
from sqlalchemy.ext.declarative import declared_attr

class TransactionBase(db.Model):
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    
    @declared_attr
    def user_id(cls):
        return db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        
    @declared_attr
    def category_id(cls):
        return db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.Date, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'amount': self.amount,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'category': self.category.to_dict() if self.category else None
        }

class Transaction(TransactionBase):
    __tablename__ = 'transaction'
    
    def __repr__(self):
        return f'<Transaction {self.id}: {self.amount}>'

class RecurringTransaction(TransactionBase):
    __tablename__ = 'recurring_transaction'
    
    frequency = db.Column(db.String(50), nullable=False)  # 'daily', 'weekly', 'monthly', 'yearly'
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)  # Optional end date
    last_generated = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'frequency': self.frequency,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'last_generated': self.last_generated.isoformat() if self.last_generated else None,
            'is_active': self.is_active
        })
        return base_dict
    
    def __repr__(self):
        return f'<RecurringTransaction {self.id}: {self.amount} ({self.frequency})>'
    
    @property
    def next_occurrence(self):
        """Calculate the next occurrence date based on frequency"""
        if not self.is_active or (self.end_date and self.end_date < datetime.now().date()):
            return None
            
        last_date = self.last_generated or self.start_date
        today = datetime.now().date()
        
        if last_date >= today:
            return last_date
            
        from dateutil.relativedelta import relativedelta
        
        frequency_map = {
            'daily': lambda d: d + relativedelta(days=1),
            'weekly': lambda d: d + relativedelta(weeks=1),
            'monthly': lambda d: d + relativedelta(months=1),
            'yearly': lambda d: d + relativedelta(years=1)
        }
        
        if self.frequency not in frequency_map:
            raise ValueError(f"Invalid frequency: {self.frequency}")
            
        next_date = frequency_map[self.frequency](last_date)
        
        # If next_date is past end_date, return None
        if self.end_date and next_date > self.end_date:
            return None
            
        return next_date 