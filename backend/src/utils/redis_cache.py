import json
from typing import Any, Optional
from src.core.config import settings

# In-memory key-value cache fallback when Redis is not running
_in_memory_cache: dict[str, Any] = {}

class CacheManager:
    """
    Unified Caching Layer with Redis support and automated in-memory fallback.
    """
    def __init__(self):
        self.redis_client = None
        if settings.REDIS_URL:
            try:
                import redis
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception as e:
                print(f"[CacheManager] Redis connection disabled/failed, using in-memory store: {e}")

    def get(self, key: str) -> Optional[Any]:
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                return json.loads(val) if val else None
            except Exception:
                pass
        return _in_memory_cache.get(key)

    def set(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        if self.redis_client:
            try:
                self.redis_client.setex(key, expire_seconds, json.dumps(value))
                return True
            except Exception:
                pass
        _in_memory_cache[key] = value
        return True

    def delete(self, key: str) -> bool:
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception:
                pass
        _in_memory_cache.pop(key, None)
        return True

    def clear(self) -> None:
        if self.redis_client:
            try:
                self.redis_client.flushdb()
            except Exception:
                pass
        _in_memory_cache.clear()

cache = CacheManager()
