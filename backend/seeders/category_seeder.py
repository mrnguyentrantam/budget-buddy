from models import db, Category

def seed_categories():
    categories = [
        {'name': 'Food & Drinks', 'icon': '🍔'},
        {'name': 'Transport', 'icon': '🚗'},
        {'name': 'Shopping', 'icon': '🛍️'},
        {'name': 'Entertainment', 'icon': '🎮'},
        {'name': 'Health', 'icon': '💊'},
        {'name': 'Education', 'icon': '📚'},
        {'name': 'Bills', 'icon': '📄'},
        {'name': 'Other', 'icon': '📌'}
    ]

    # Check if categories already exist
    if Category.query.count() == 0:
        for category_data in categories:
            category = Category(**category_data)
            db.session.add(category)
        
        try:
            db.session.commit()
            print("Categories seeded successfully!")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding categories: {str(e)}")
    else:
        print("Categories already exist, skipping seed.") 