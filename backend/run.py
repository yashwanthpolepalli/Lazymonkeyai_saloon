import uvicorn
import os
import sys

# Define absolute directory paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "src")
VENV_DIR = os.path.join(BASE_DIR, "venv")

# Ensure src directory is in sys.path
sys.path.insert(0, SRC_DIR)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    app_env = os.getenv("APP_ENV", "development").lower()
    reload = app_env == "development"

    print(f"🚀 Starting Saloon & BusinessOSAI Backend on http://{host}:{port}")
    
    uvicorn.run(
        "src.main:app",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[SRC_DIR],
        reload_includes=["*.py"],
        reload_excludes=[
            VENV_DIR,
            "*/site-packages/*",
            "*.pyc",
            "*__pycache__*",
            "*.git*",
            "*.db",
        ],
    )
