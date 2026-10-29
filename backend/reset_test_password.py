
from getpass import getpass

from sqlalchemy import select
from database import SessionLocal
from models import User
from auth import hash_password

email = "rohit.test2026@example.com"

new_password = getpass("Enter your new password: ")

if len(new_password) < 8:
    print("Password must be at least 8 characters.")
    raise SystemExit(1)

db = SessionLocal()

try:
    user = db.scalar(select(User).where(User.email == email))

    if user is None:
        print(f"No account found for {email}")
    else:
        user.hashed_password = hash_password(new_password)
        db.commit()
        print("Password reset successfully! You can now log in.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
