# Project Roadmap: Flux Predictive

This document outlines the development plan for completing the core features of the Flux Predictive application and suggests future enhancements.

---

## ✅ Core To-Do List

These are the essential tasks required to get the primary "Train Model" and "Run Models" features working.

### 1. Frontend Development (UI/UX)
- [x] **"Train Model" Page UI:**
  - Create a dedicated view for model training configuration.
  - Implement file upload and model parameter selection (Model Type, Target Column).
  - Add visual feedback for training status.
- [x] **"Run Models" Page UI:**
  - Create a dashboard to list available trained models.
  - Implement "Glassmorphism" cards for each model with details (Type, Date, Accuracy).
  - Add "Delete" functionality with confirmation logic.
  - Add "Run Model" workflow to upload new data for prediction.
- [x] **Synthetic Data Generator:**
  - Add a "Generate Synthetic Data" feature to the Atlas Data Optimizer.
  - Implement logic for Random, Ascending, and Descending spending trends.
  - Ensure realistic categories and date formatting.

### 2. Backend API Setup
- [ ] **Initialize a Python Backend:** Choose a lightweight framework.
  - **Suggestion:** `Flask` or `FastAPI`. FastAPI is more modern and often faster.
- [ ] **Create API Endpoints:** Design the routes the frontend will call.
  - `GET /models`: List all available trained models from the `models/` directory.
  - `DELETE /models/{id}`: Delete a specific trained model file.
  - `POST /train`: Receive cleaned CSV data and train a new model.
  - `POST /predict`: Receive a new CSV and a model ID to generate predictions.
- [ ] **Add Dependencies:** Create a `requirements.txt` file for Python packages (`flask`, `scikit-learn`, `pandas`, `numpy`, `joblib`).

### 3. Machine Learning Model Implementation
- [ ] **Model Storage Structure:**
  - Create a `models/` directory to store trained model files (`.pkl` or `.joblib`).
  - Implement logic to save metadata (accuracy, date, type) alongside the model file.
- [ ] **Training Logic:**
  - Implement `RandomForest` training pipeline.
  - Handle data preprocessing (One-Hot Encoding, missing values) automatically.
  - Calculate and save feature importance for "Fancy Insights".
- [ ] **Prediction Logic:**
  - Load the selected model from disk.
  - Run predictions on the new uploaded dataset.
  - Return predictions + feature importance data to the frontend.

### 4. Frontend Integration (Connecting UI to Backend)
- [ ] **Dynamic Model List:**
  - Fetch the list of models from `GET /models` instead of using dummy data.
  - Connect the "Delete" button to the `DELETE /models/{id}` endpoint.
- [ ] **Connect "Train" Button:**
  - Send the uploaded CSV to `POST /train`.
  - Display the returned training accuracy and success message.
- [ ] **Connect "Run Prediction" Button:**
  - Send the uploaded CSV and selected model ID to `POST /predict`.
  - **Display Results & Insights:**
    - Show the prediction results in a table.
    - Render charts (e.g., Bar Chart for Feature Importance) using the data returned from the backend.

---

## 💡 Suggestions & Future Features

These are ideas for enhancing the project beyond the core requirements.

- [ ] **Model Selection:** Allow users to choose between different models (e.g., Random Forest, Gradient Boosting, a simple Neural Network) from the UI.
- [ ] **Real-time Training Feedback:** Use WebSockets to provide a more detailed, real-time log of the model training process to the frontend.
- [ ] **Advanced Visualizations:** Instead of just a table, display prediction results with interactive charts (e.g., distribution plots, confusion matrices for classification).
- [ ] **User Accounts & Model Storage:** Add user authentication so that different users can save and manage their own trained models.
- [ ] **Cloud Deployment:** Write a `Dockerfile` to containerize the frontend and backend, making it easy to deploy on cloud services like Heroku or AWS.
