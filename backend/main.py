
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy import select
from models import Product
from schemas import ProductResponse


from database import engine, SessionLocal
from models import User, Product, CartItem
from schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    TokenResponse,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,

)
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
import jwt


app = FastAPI(
    title="V-Fit AI API",
    version="1.0.0",
    description="AI-powered virtual shopping and try-on platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise credentials_error

    user = db.get(User, user_id)

    if user is None:
        raise credentials_error

    return user



@app.get("/")
def root():
    return {
        "message": "V-Fit AI API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "v-fit-ai-backend",
    }


@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {"status": "healthy", "database": "connected"}

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable",
        )


@app.post(
    "/users/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    email = str(user_data.email).lower()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    new_user = User(
        name=user_data.name.strip(),
        email=email,
        hashed_password=hash_password(user_data.password),
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    return new_user


@app.post("/users/login", response_model=TokenResponse)
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    email = str(user_data.email).lower()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None or not verify_password(
        user_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user.id,
        email=user.email,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@app.get("/users/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user



@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product).where(Product.id == product_id)
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product

@app.get("/products", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.scalars(select(Product)).all()
    return products



@app.get("/categories", response_model=list[str])
def get_categories(
    db: Session = Depends(get_db),
):
    query = select(Product.category).distinct().order_by(Product.category)
    return list(db.scalars(query).all())


@app.get("/cart", response_model=list[CartItemResponse])
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = db.scalars(
        select(CartItem).where(CartItem.user_id == current_user.id)
    ).all()
    return items


@app.post("/cart", response_model=CartItemResponse, status_code=201)
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.get(Product, item.product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == item.product_id,
        )
    )

    if cart_item:
        if cart_item.quantity + item.quantity > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum quantity per product is 100",
            )
        cart_item.quantity += item.quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity,
        )
        db.add(cart_item)

    try:
        db.commit()
        db.refresh(cart_item)
        return cart_item
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Could not add product to cart",
        )


@app.patch("/cart/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    item: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id,
        )
    )

    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    cart_item.quantity = item.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


@app.delete("/cart/{item_id}")
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_item = db.scalar(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id,
        )
    )

    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}
