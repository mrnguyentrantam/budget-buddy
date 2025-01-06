from flask import Blueprint, request, jsonify
from routes.auth import token_required
from models.transaction import Transaction
from models import db
from datetime import datetime

transactions = Blueprint('transactions', __name__)

@transactions.route('', methods=['GET'])
@token_required
def get_transactions(current_user):
    # Get query parameters
    category_id = request.args.get('category_id', type=int)
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    
    # Build the base query
    query = Transaction.query.filter_by(user_id=current_user.id)
    
    # Add category filter if provided
    if category_id is not None:
        query = query.filter_by(category_id=category_id)
    
    # Add month and year filters if both are provided
    if month is not None and year is not None:
        # Extract month and year from created_at timestamp for comparison
        query = query.filter(
            db.extract('month', Transaction.created_at) == month,
            db.extract('year', Transaction.created_at) == year
        )
    
    # Execute query with ordering
    transactions = query.order_by(Transaction.created_at.desc()).all()
    return jsonify([transaction.to_dict() for transaction in transactions])

@transactions.route('', methods=['POST'])
@token_required
def create_transaction(current_user):
    data = request.get_json()
    
    new_transaction = Transaction(
        amount=data['amount'],
        description=data['description'],
        category_id=data['category_id'],
        created_at=datetime.fromisoformat(data.get('date', datetime.utcnow().isoformat())),
        user_id=current_user.id
    )
    
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify(new_transaction.to_dict()), 201

@transactions.route('/<int:id>', methods=['PUT'])
@token_required
def update_transaction(current_user, id):
    transaction = Transaction.query.get_or_404(id)
    if transaction.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    transaction.amount = data.get('amount', transaction.amount)
    transaction.description = data.get('description', transaction.description)
    transaction.category_id = data.get('category_id', transaction.category_id   )
    if 'date' in data:
        transaction.created_at = datetime.fromisoformat(data['date'])
    
    db.session.commit()
    return jsonify(transaction.to_dict())

@transactions.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, id):
    transaction = Transaction.query.get_or_404(id)
    if transaction.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(transaction)
    db.session.commit()
    return '', 204 

@transactions.route('/<int:id>', methods=['GET'])
@token_required
def get_transaction(current_user, id):
    transaction = Transaction.query.get_or_404(id)
    if transaction.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(transaction.to_dict()) 