# Multi-runtime Dockerfile for Node.js + Python Scikit-Learn Engine on Render
FROM node:20-bookworm-slim

# Install Python 3, pip, and virtual environment utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set up isolated Python virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Scikit-Learn, Pandas, and NumPy for ML yield forecasting
RUN pip install --no-cache-dir scikit-learn pandas numpy

WORKDIR /app

# Copy ML training datasets and regression models
COPY ml/ ./ml/
COPY oil_yield_model.py ./

# Install backend production dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy backend source tree
COPY backend/ ./

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV PYTHON_BIN=/opt/venv/bin/python3

CMD ["npm", "start"]
