# Personal Transaction Tracker API

A Flask-based REST API for tracking personal transactions with Google Authentication.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- A Google Cloud Platform account for OAuth 2.0 credentials

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create and activate a virtual environment**

   On Windows:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

   On macOS/Linux:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Google OAuth 2.0**

   a. Go to the [Google Cloud Console](https://console.cloud.google.com/)
   b. Create a new project or select an existing one
   c. Enable the Google+ API
   d. Go to Credentials
   e. Create an OAuth 2.0 Client ID
   f. Add authorized JavaScript origins (e.g., `http://localhost:5000`)
   g. Add authorized redirect URIs (e.g., `http://localhost:5000/callback`)
   h. Copy the Client ID and Client Secret

5. **Configure environment variables**

   Create a `.env` file in the backend directory and add:
   ```
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///app.db
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Running the Application

1. **Initialize the database**
   
   The database will be automatically created when you first run the application.

2. **Start the Flask server**
   ```bash
   python app.py
   ```

   The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login/google` - Google Sign-In
- `GET /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user info

### Transactions
- `GET /api/transactions` - Get all transactions for the logged-in user
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/<id>` - Update an transaction
- `DELETE /api/transactions/<id>` - Delete an transaction

### Example Transaction Request

Creating a new transaction:
```json
POST /api/transactions
{
    "amount": 50.99,
    "description": "Grocery shopping",
    "category": "Food",
    "date": "2024-03-15T14:30:00"
}
```

## Project Structure
```
backend/
├── .env                  # Environment variables
├── app.py               # Main application file
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
├── models/
│   ├── __init__.py     # Database initialization
│   ├── transaction.py      # Transaction model
│   └── user.py         # User model
└── routes/
    ├── __init__.py     # Routes initialization
    ├── auth.py         # Authentication routes
    └── transactions.py     # Transaction routes
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

## Security

- All transaction endpoints require authentication
- Users can only access their own transactions
- Google OAuth2.0 is used for secure authentication
- CORS is enabled for frontend integration

## Development

To run the application in development mode with hot reloading:
```bash
export FLASK_ENV=development  # On Unix/macOS
set FLASK_ENV=development    # On Windows
python app.py
```

## Testing the API

You can test the API using tools like [Postman](https://www.postman.com/) or curl commands.

Example curl command:
```bash
# Get all transactions (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/transactions
```

## Frontend Integration

To integrate with a frontend application:

1. Include the Google Sign-In script:
   ```html
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```

2. Initialize Google Sign-In:
   ```javascript
   google.accounts.id.initialize({
     client_id: 'YOUR_GOOGLE_CLIENT_ID',
     callback: handleCredentialResponse
   });

   async function handleCredentialResponse(response) {
     const result = await fetch('http://localhost:5000/api/auth/login/google', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         token: response.credential
       })
     });
     
     const data = await result.json();
     // Handle the response...
   }
   ```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
```

This README provides comprehensive documentation for setting up and using your transaction tracker API. It includes:
- Setup instructions
- Environment configuration
- API endpoint documentation
- Project structure
- Security considerations
- Development guidelines
- Frontend integration examples

Would you like me to explain any part in more detail or add additional sections to the README?