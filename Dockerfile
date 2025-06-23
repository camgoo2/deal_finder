# Use an official lightweight Python image.
FROM python:3.11-slim
RUN apt-get update

ENV POETRY_VERSION=1.8.2
RUN pip install "poetry==$POETRY_VERSION"

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in pyproject.toml
RUN poetry config virtualenvs.in-project true && \
    poetry install --only=main --no-root
ENV PATH="/app/.venv/bin:$PATH"

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Command to run the application using Uvicorn
CMD ["poetry", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
