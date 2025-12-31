from app.database import init_db, engine
from app.models import Base

if __name__ == "__main__":
    print("Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
        print("\nMake sure:")
        print("1. DATABASE_URL is set in .env file")
        print("2. Supabase connection is working")
        print("3. Database credentials are correct")

