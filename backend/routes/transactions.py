from flask import Blueprint, request, jsonify
from services.recurring_transaction_service import RecurringTransactionService
from routes.auth import token_required
from models.transaction import Transaction, RecurringTransaction
from models import db
from datetime import datetime

transactions = Blueprint('transactions', __name__)

@transactions.route('', methods=['GET'])
@token_required
def get_transactions(current_user):
    # Get query parameters
    category_id = request.args.get('category_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    limit = request.args.get('limit', type=int)
    
    # Build the base query
    query = Transaction.query.filter_by(user_id=current_user.id)
    
    # Add category filter if provided
    if category_id is not None:
        query = query.filter_by(category_id=category_id)
    
    # Add date range filters if provided
    if start_date and end_date:
        query = query.filter(Transaction.created_at >= datetime.fromisoformat(start_date))
        query = query.filter(Transaction.created_at <= datetime.fromisoformat(end_date))
    # If no date range provided, check for month/year filters
    elif month is not None and year is not None:
        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)
        query = query.filter(Transaction.created_at >= start)
        query = query.filter(Transaction.created_at < end)
    
    # Execute query with ordering
    query = query.order_by(Transaction.created_at.desc())
    
    # Apply limit if provided
    if limit is not None:
        query = query.limit(limit)
    
    transactions = query.all()
    return jsonify([transaction.to_dict() for transaction in transactions])

@transactions.route('', methods=['POST'])
@token_required
def create_transaction(current_user):
    data = request.get_json()
    
    # Create base transaction
    new_transaction = Transaction(
        amount=data['amount'],
        description=data['description'],
        category_id=data['category_id'],
        created_at=datetime.fromisoformat(data.get('date', datetime.utcnow().isoformat())),
        user_id=current_user.id
    )
    
    db.session.add(new_transaction)
    
    # If recurring, create a recurring transaction record
    if data.get('isRecurring', False):
        recurring_transaction = RecurringTransaction(
            user_id=current_user.id,
            frequency=data.get('frequency', 'monthly'), 
            created_at=datetime.fromisoformat(data.get('date', datetime.utcnow().isoformat())),
            end_date=data.get('end_date') if data.get('end_date') else None,  # Convert empty string to None
            is_active=True,
            last_generated=new_transaction.created_at,
            amount=new_transaction.amount,
            description=new_transaction.description,
            category_id=new_transaction.category_id,
            next_occurrence=RecurringTransactionService.calculate_next_occurrence(
                data.get('frequency', 'monthly'),
                new_transaction.created_at
            )
        )
        db.session.add(recurring_transaction)
    
    db.session.commit()
    
    response_data = new_transaction.to_dict()
    if data.get('isRecurring', False):
        response_data['recurring'] = recurring_transaction.to_dict()
    
    return jsonify(response_data), 201

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