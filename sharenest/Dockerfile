FROM python:3.12-slim

RUN pip install --no-cache-dir uv==0.8.13

WORKDIR /app

COPY ./pyproject.toml ./README.md ./uv.lock* ./
RUN uv sync --frozen

COPY backend/ ./backend/

ENV PORT=8080
ENV HOST=0.0.0.0
ENV GOOGLE_CLOUD_PROJECT=qwiklabs-gcp-04-f3ca7b5378f0
ENV GOOGLE_CLOUD_LOCATION=us-central1
ENV GOOGLE_GENAI_USE_VERTEXAI=True

EXPOSE 8080

CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
