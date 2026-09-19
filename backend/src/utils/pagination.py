from typing import Generic, TypeVar, List, Sequence
from pydantic import BaseModel
from fastapi import Query

T = TypeVar("T")

class PageParams(BaseModel):
    page: int = 1
    limit: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    total_pages: int

def paginate(items: Sequence[T], total: int, params: PageParams) -> PaginatedResponse[T]:
    total_pages = (total + params.limit - 1) // params.limit if params.limit > 0 else 1
    return PaginatedResponse(
        items=list(items),
        total=total,
        page=params.page,
        limit=params.limit,
        total_pages=total_pages
    )
