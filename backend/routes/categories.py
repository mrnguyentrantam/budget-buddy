from flask import Blueprint, jsonify, request
from routes.auth import token_required, is_admin
from models import Category, db

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('', methods=['GET'])
@token_required
def get_categories(current_user):
    try:
        categories = Category.query.order_by(Category.name).all()
        return jsonify([{
            'id': category.id,
            'name': category.name,
            'icon': category.icon
        } for category in categories])
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

@categories_bp.route('', methods=['POST'])
@token_required
@is_admin
def create_category(current_user):
    try:
        data = request.get_json()
        new_category = Category(
            name=data['name'],
            icon=data.get('icon')  # Optional field
        )
        db.session.add(new_category)
        db.session.commit()
        
        return jsonify({
            'id': new_category.id,
            'name': new_category.name,
            'icon': new_category.icon
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@token_required
@is_admin
def update_category(current_user, category_id):
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        if 'name' in data:
            category.name = data['name']
        if 'icon' in data:
            category.icon = data['icon']
            
        db.session.commit()
        
        return jsonify({
            'id': category.id,
            'name': category.name,
            'icon': category.icon
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/<int:category_id>', methods=['DELETE'])
@token_required
@is_admin
def delete_category(current_user, category_id):
    try:
        category = Category.query.get_or_404(category_id)
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Category deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 
        