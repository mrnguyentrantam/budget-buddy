from . import db

class Category(db.Model):
    id = db.Column(db.Integer, db.Sequence('category_id_seq'), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Keep the relationship definition here
    transactions = db.relationship('Transaction', back_populates='category') 

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 