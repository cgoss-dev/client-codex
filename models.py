from typing import Optional

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    street: Mapped[str] = mapped_column(String(200))
    unit: Mapped[Optional[str]] = mapped_column(String(50))
    location_type: Mapped[str] = mapped_column("type", String(20))
    occupancy: Mapped[Optional[str]] = mapped_column(String(20))
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(2))
    postal_code: Mapped[str] = mapped_column(String(10))


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    organization: Mapped[Optional[str]] = mapped_column(String(200))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(254))
    mobile: Mapped[Optional[str]] = mapped_column(String(14))


class LocationClient(Base):
    __tablename__ = "location_clients"
    __table_args__ = (
        UniqueConstraint(
            "location_id",
            "client_id",
            name="uq_location_clients_location_client",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id", ondelete="CASCADE")
    )
    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(String(20))
    priority: Mapped[str] = mapped_column(String(20))
    responsibility: Mapped[Optional[str]] = mapped_column(String(20))
    tenant_type: Mapped[Optional[str]] = mapped_column(String(20))
