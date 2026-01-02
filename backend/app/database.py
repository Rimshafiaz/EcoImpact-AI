from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path
import socket

BASE_DIR = Path(__file__).parent.parent
env_path = BASE_DIR / ".env"

if not env_path.exists():
    raise FileNotFoundError(
        f"ERROR: .env file not found at {env_path}\n"
        "Please create a .env file in the backend/ directory.\n"
        "See SETUP_GUIDE.md for instructions."
    )

load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL not found in .env file.\n"
        "Please add DATABASE_URL to your .env file.\n"
        "Format: DATABASE_URL=postgresql://user:password@host:port/database"
    )

def test_dns_resolution(hostname):
    """Test if hostname can be resolved"""
    try:
        socket.gethostbyname(hostname)
        return True
    except socket.gaierror:
        return False

if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    hostname = None
    try:
        if "@" in DATABASE_URL:
            hostname = DATABASE_URL.split("@")[1].split(":")[0].split("/")[0]
            if hostname not in ["localhost", "127.0.0.1"] and not test_dns_resolution(hostname):
                print(f"WARNING: Cannot resolve hostname '{hostname}'")
                print("This may be a DNS or network issue.")
                print("Solutions:")
                print("1. Check your internet connection")
                print("2. Try using a different DNS server (8.8.8.8 or 1.1.1.1)")
                print("3. Check if firewall/antivirus is blocking connections")
                print("4. Try using a VPN or different network")
                print("5. Consider using a local database for demos (see LOCAL_DATABASE_SETUP.md)")
                print("See SETUP_GUIDE.md for detailed troubleshooting steps.")
    except Exception:
        pass
    
    if "sslmode" not in DATABASE_URL.lower():
        if hostname and hostname not in ["localhost", "127.0.0.1"]:
            if "?" in DATABASE_URL:
                DATABASE_URL += "&sslmode=require"
            else:
                DATABASE_URL += "?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"connect_timeout": 10} if "postgresql" in DATABASE_URL.lower() or "postgres" in DATABASE_URL.lower() else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)

