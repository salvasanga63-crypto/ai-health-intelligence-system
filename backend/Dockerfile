FROM python:3.10-slim
WORKDIR /app

# Install runtime dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code as a package
COPY backend /app/backend

ENV PYTHONUNBUFFERED=1
EXPOSE 5000

# Run with a production server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "backend.app:app"]
