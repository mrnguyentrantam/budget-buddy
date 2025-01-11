from datetime import datetime
from . import db
from sqlalchemy.ext.declarative import declared_attr

class TransactionBase(db.Model):
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())


    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'amount': self.amount,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }

class Transaction(TransactionBase):
    __tablename__ = 'transaction'
    
    category = db.relationship('Category', back_populates='transactions')
    
    def __repr__(self):
        return f'<Transaction {self.id}: {self.amount}>'
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict['category'] = self.category.to_dict() if self.category else None
        return base_dict

class RecurringTransaction(TransactionBase):
    __tablename__ = 'recurring_transaction'
    
    category = db.relationship('Category', back_populates='recurring_transactions')
    frequency = db.Column(db.String(50), nullable=False)  # 'daily', 'weekly', 'monthly', 'yearly'
    end_date = db.Column(db.Date, nullable=True)  # Optional end date
    last_generated = db.Column(db.Date)
    next_occurrence = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        base_dict = super().to_dict()
        base_dict.update({
            'frequency': self.frequency,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'last_generated': self.last_generated.isoformat() if self.last_generated else None,
            'next_occurrence': self.next_occurrence.isoformat() if self.next_occurrence else None,
            'is_active': self.is_active,
            'category': self.category.to_dict() if self.category else None
        })
        return base_dict
    
    def __repr__(self):
        return f'<RecurringTransaction {self.id}: {self.amount} ({self.frequency})>'
    
    @property
    def calculate_next_occurrence(self):
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