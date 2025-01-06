from flask import Blueprint, jsonify, request
from flask_login import login_required
from models import db, User
from routes.auth import token_required, is_admin
from datetime import datetime

users = Blueprint('users', __name__)

@users.route('', methods=['GET'])
@token_required
@is_admin
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'is_admin': user.is_admin,
    } for user in users])

@users.route('/<int:user_id>', methods=['DELETE'])
@token_required
@is_admin
def delete_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent user from deleting themselves
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    # Prevent deleting the last admin
    if user.is_admin:
        admin_count = User.query.filter_by(is_admin=True).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot delete the last admin user'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'})

@users.route('/<int:user_id>/toggle-admin', methods=['PUT'])
@token_required
@is_admin
def toggle_admin(current_user, user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent toggling the last admin
    if user.is_admin:
        admin_count = User.query.filter_by(is_admin=True).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot remove admin status from the last admin'}), 400
    
    # Prevent user from toggling their own admin status
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot modify your own admin status'}), 400

    user.is_admin = not user.is_admin
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'is_admin': user.is_admin
    })

@users.route('/<int:user_id>', methods=['GET'])
@token_required
@is_admin
def get_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,  
        'is_admin': user.is_admin,
    }) 
