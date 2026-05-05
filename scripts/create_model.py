import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import os

# -----------------------------
# CREATE SIMPLE MODEL
# -----------------------------
model = Sequential([
    Dense(32, input_shape=(3,), activation='relu'),  # input: temp, cloud, humidity
    Dense(16, activation='relu'),
    Dense(1)  # output: irradiance
])

model.compile(optimizer='adam', loss='mse')

# -----------------------------
# DUMMY TRAINING DATA
# -----------------------------
# features: [temp, cloud, humidity]
X = np.random.rand(500, 3) * [50, 100, 100]

# simple formula for irradiance (fake but logical)
y = (X[:, 0] * 10) - (X[:, 1] * 2) + (X[:, 2] * 0.5)

y = y.reshape(-1, 1)

# -----------------------------
# TRAIN MODEL
# -----------------------------
model.fit(X, y, epochs=10, verbose=1)

# -----------------------------
# SAVE MODEL
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "solar_lstm.h5")

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

model.save(MODEL_PATH)

print("✅ Model saved at:", MODEL_PATH)