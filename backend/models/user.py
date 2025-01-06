from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, db.Sequence('user_id_seq'), primary_key=True)
    email = db.Column(db.String(100), unique=True)
    name = db.Column(db.String(100))
    password_hash = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)
    
    # Link transactions to user
    transactions = db.relationship('Transaction', backref='user', lazy=True) 
    
    # Add this line
    budgets = db.relationship('Budget', backref='user', lazy=True)
    
    # Add this relationship
    recurring_transactions = db.relationship('RecurringTransaction', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'name': self.name
        }