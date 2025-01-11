from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from routes.auth import token_required
from models import db, Budget, Transaction
from sqlalchemy import func, extract
from datetime import datetime

budgets = Blueprint('budgets', __name__)

@budgets.route('', methods=['POST'])
@token_required
def create_budget(current_user):
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['amount', 'category_id', 'start_date', 'end_date']):
        return jsonify({'error': 'Missing required fields'}), 400
        
    new_budget = Budget(
        amount=data['amount'],
        category_id=data['category_id'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        user_id=current_user.id
    )
    
    db.session.add(new_budget)
    db.session.commit()
    
    return jsonify(new_budget.to_dict()), 201

@budgets.route('/<int:id>', methods=['PUT'])
@token_required
def update_budget(current_user, id):
    budget = Budget.query.get(id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
        
    if budget.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'amount' in data:
        budget.amount = data['amount']
    if 'category_id' in data:
        budget.category_id = data['category_id']
        
    db.session.commit()
    
    return jsonify(budget.to_dict()) 

@budgets.route('', methods=['GET'])
@token_required
def get_budgets(current_user):
    # Get month and year from query parameters, default to current month/year
    month = request.args.get('month', datetime.now().month, type=int)
    year = request.args.get('year', datetime.now().year, type=int)

    # Calculate start and end dates for the month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    # Query budgets that were created specifically for this month/year
    budgets = Budget.query.filter(
        Budget.user_id == current_user.id,
        extract('month', Budget.start_date) == month,
        extract('year', Budget.start_date) == year
    ).all()
    
    budget_data = []
    for budget in budgets:
        # Calculate total transactions for this budget's category and date range
        total_transactions = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.category_id == budget.category_id,
            Transaction.user_id == current_user.id,
            Transaction.created_at >= start_date,
            Transaction.created_at < end_date
        ).scalar() or 0
        
        # Convert budget to dict and add transaction total
        budget_dict = budget.to_dict()
        budget_dict['total_transactions'] = float(total_transactions)
        budget_dict['remaining_amount'] = float(budget.amount - total_transactions)
        budget_data.append(budget_dict)
    
    return jsonify(budget_data) 

@budgets.route('/<int:budget_id>', methods=['DELETE'])
@token_required
def delete_budget(current_user, budget_id):
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user.id).first()
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
        
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({'message': 'Budget deleted successfully'}), 200 

@budgets.route('/check', methods=['POST'])
@token_required
def check_budget(current_user):
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['category_id', 'date']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Parse the date string into a datetime object
    date = datetime.strptime(data['date'], '%Y-%m-%d')
    month = date.month
    year = date.year
    
    # Calculate start and end dates for the month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    # Get the budget for this category and month
    budget = Budget.query.filter(
        Budget.user_id == current_user.id,
        Budget.category_id == data['category_id'],
        extract('month', Budget.start_date) == month,
        extract('year', Budget.start_date) == year
    ).first()
    
    if not budget:
        return jsonify({'has_budget': False})
    
    # Calculate total transactions for this budget's category and date range
    total_transactions = db.session.query(
        func.sum(Transaction.amount)
    ).filter(
        Transaction.category_id == data['category_id'],
        Transaction.user_id == current_user.id,
        Transaction.created_at >= start_date,
        Transaction.created_at < end_date
    ).scalar() or 0
    
    return jsonify({
        'has_budget': True,
        'budget_amount': float(budget.amount),
        'total_transactions': float(total_transactions),
        'remaining_amount': float(budget.amount - total_transactions),
        'is_exceeded': total_transactions >= budget.amount
    }) 
