from flask import Blueprint, jsonify
from models.user import User
from models.category import Category
from models.transaction import Transaction
from models import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
def get_admin_stats():
    try:
        # Get total users
        total_users = db.session.query(User).count()

        # Get active categories (categories that have transactions)
        active_categories = db.session.query(Category)\
            .join(Transaction)\
            .distinct(Category.id)\
            .count()

        # Get total transactions
        total_transactions = db.session.query(Transaction).count()

        return jsonify({
            'totalUsers': total_users,
            'activeCategories': active_categories,
            'totalTransactions': total_transactions
        }), 200
    except Exception as e:
        print(f"Error getting admin stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 