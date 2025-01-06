from . import db
from datetime import datetime

class Budget(db.Model):
    id = db.Column(db.Integer, db.Sequence('budget_id_seq'), primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    
    # Relationships
    category = db.relationship('Category', backref='budgets')
    
    def to_dict(self):
        return {
            'id': self.id,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'description': self.description,
            'amount': self.amount,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else None
        } 