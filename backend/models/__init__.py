from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models after db is defined
from .category import Category
from .user import User
from .transaction import Transaction 
from .budget import Budget