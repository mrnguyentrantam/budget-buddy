import os
from flask import Flask
from models import db
from seeders.category_seeder import seed_categories

def run_seeders():
    app = Flask(__name__)
    # Configure your app here (database URL, etc.)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:password@localhost:5432/budget_buddy'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        seed_categories()

if __name__ == "__main__":
    run_seeders() 