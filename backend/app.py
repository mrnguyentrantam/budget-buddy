from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from config import Config
import os
from routes.transactions import transactions
from routes.auth import auth
from flask_login import LoginManager
from models.user import User
from flask_migrate import Migrate
from routes.categories import categories_bp
from routes.budgets import budgets
from routes.users import users
from flask_apscheduler import APScheduler
from services.recurring_transaction_service import RecurringTransactionService
from routes.admin import admin_bp
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configure app
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
migrate = Migrate(app, db)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized'}), 401

# Register blueprints
app.register_blueprint(transactions, url_prefix='/transactions')
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(categories_bp, url_prefix='/categories')
app.register_blueprint(budgets, url_prefix='/budgets')
app.register_blueprint(users, url_prefix='/users')
app.register_blueprint(admin_bp, url_prefix='/admin')

# Initialize scheduler
scheduler = APScheduler()
app.config['SCHEDULER_API_ENABLED'] = True
scheduler.init_app(app)

# Schedule the recurring transaction job
@scheduler.task('cron', id='generate_recurring_transactions', hour=0, minute=0)
def scheduled_task():
    with app.app_context():
        try:
            RecurringTransactionService.generate_pending_transactions()
            print("Successfully generated recurring transactions")
        except Exception as e:
            print(f"Error generating recurring transactions: {e}")
            db.session.rollback()

# Run once when server starts
with app.app_context():
    try:
        RecurringTransactionService.generate_pending_transactions()
        print("Initial generation of recurring transactions completed")
    except Exception as e:
        print(f"Error in initial generation of recurring transactions: {e}")
        db.session.rollback()

# Start the scheduler
scheduler.start()

if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)
