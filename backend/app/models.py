from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    simulations = relationship("Simulation", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("Comparison", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    policy_name = Column(String, nullable=True)
    input_params = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="simulations")

    def __repr__(self):
        return f"<Simulation(id={self.id}, user_id={self.user_id}, policy_name={self.policy_name})>"


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    comparison_name = Column(String, nullable=True)
    simulation_1_id = Column(Integer, ForeignKey("simulations.id"), nullable=True, index=True)
    simulation_2_id = Column(Integer, ForeignKey("simulations.id"), nullable=True, index=True)
    simulation_1_data = Column(JSON, nullable=False)  # Stores full simulation data (input + results)
    simulation_2_data = Column(JSON, nullable=False)  # Stores full simulation data (input + results)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="comparisons")

    def __repr__(self):
        return f"<Comparison(id={self.id}, user_id={self.user_id}, comparison_name={self.comparison_name})>"

