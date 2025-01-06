from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from routes.auth import token_required
from models import db, Budget, Transaction
from sqlalchemy import func
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
    budgets = Budget.query.filter_by(user_id=current_user.id).all()
    
    budget_data = []
    for budget in budgets:
        # Calculate total transactions for this budget's category and date range
        total_transactions = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.category_id == budget.category_id,
            Transaction.user_id == current_user.id,
            Transaction.created_at >= budget.start_date,
            Transaction.created_at <= budget.end_date
        ).scalar() or 0  # Default to 0 if no transactions found
        
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