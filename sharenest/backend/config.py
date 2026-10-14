import os

class Settings:
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "qwiklabs-gcp-04-f3ca7b5378f0")
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-east1")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "sharenest-donations-qwiklabs-04-f3ca")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    PORT: int = int(os.getenv("PORT", "8080"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    AGENT_ENGINE_RESOURCE_NAME: str = os.getenv(
        "AGENT_ENGINE_RESOURCE_NAME",
        "projects/546884461112/locations/us-east1/reasoningEngines/5195022016939294720"
    )
    AGENT_DIRECTORY: str = os.getenv("AGENT_DIRECTORY", "app")
    SANDBOX_RESOURCE_NAME: str = os.getenv(
        "SANDBOX_RESOURCE_NAME",
        "projects/546884461112/locations/us-east1/reasoningEngines/7273503613714956288/sandboxEnvironments/2079651477147615232"
    )

settings = Settings()
