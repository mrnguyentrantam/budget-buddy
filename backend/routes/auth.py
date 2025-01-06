from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from flask_login import login_required, current_user, logout_user
import jwt as pyjwt
from datetime import datetime, timedelta
from functools import wraps
import logging

auth = Blueprint('auth', __name__)

# Set up logging at the top of the file
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add your JWT secret key (move this to environment variables in production)
JWT_SECRET = 'your-secret-key'
JWT_EXPIRATION = 24  # hours

def create_token(user_id, is_admin):
    """Create a new JWT token"""
    return pyjwt.encode(
        {
            'user_id': str(user_id),
            'is_admin': is_admin,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION)
        },
        JWT_SECRET,
        algorithm='HS256'
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = pyjwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

def is_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # First argument should be current_user from token_required
        current_user = args[0] if args else None
        
        if not current_user or not current_user.is_admin:
            return jsonify({'error': 'Admin privileges required'}), 403
            
        return f(*args, **kwargs)
    
    return decorated

@auth.route('/login', methods=['POST'])
def login():
    try:
        logger.debug("Login attempt received")
        data = request.json
        logger.debug(f"Request data: {data}")
        
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            logger.error("Missing email or password")
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()
        logger.debug(f"User found: {user is not None}")
        
        if user and user.check_password(password):
            token = create_token(user.id, user.is_admin)
            logger.debug("Login successful, token created")
            return jsonify({
                'id': str(user.id),
                'name': user.name,
                'email': user.email,
                'is_admin': user.is_admin,
                'token': token,
                'status': 'success'
            })
        
        logger.error("Invalid credentials")
        return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        logger.exception("Error during login")  # This will log the full stack trace
        return jsonify({'error': str(e)}), 500

@auth.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({'error': 'Name, email and password are required'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        user = User(
            email=email,
            name=name
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()

        # Return format matching NextAuth expectations
        return jsonify({
            'id': str(user.id),  # Convert to string for JWT compatibility
            'name': user.name,
            'email': user.email,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Successfully logged out'})

@auth.route('/user')
@token_required
def get_user(current_user):
    return jsonify({
        'id': str(current_user.id),
        'name': current_user.name,
        'email': current_user.email
    })

# The following routes can be used for additional functionality
# but aren't required for basic NextAuth implementation

@auth.route('/session', methods=['GET'])
@login_required
def get_session():
    """Endpoint for validating session"""
    return jsonify({
        'id': str(current_user.id),
        'name': current_user.name,
        'email': current_user.email
    }) 