# Project Roadmap: Flux Predictive

This document outlines the development plan for completing the core features of the Flux Predictive application and suggests future enhancements.

---

## ✅ Core To-Do List

These are the essential tasks required to get the primary "Train Model" and "Run Models" features working.

### 1. Backend API Setup
- [ ] **Initialize a Python Backend:** Choose a lightweight framework.
  - **Suggestion:** `Flask` or `FastAPI`. FastAPI is more modern and often faster.
- [ ] **Create API Endpoints:** Design the routes the frontend will call.
  - `/train`: To receive cleaned data and train the model.
  - `/predict`: To receive new data and return predictions from the trained model.
  - `/status`: To check the status of a training job.
- [ ] **Add Dependencies:** Create a `requirements.txt` file for Python packages (`flask`, `scikit-learn`, `pandas`, `numpy`).

### 2. Machine Learning Model Implementation
- [ ] **Choose and Implement a Model:**
  - **Primary Choice:** `RandomForest` from `scikit-learn`. It handles both classification (purchase probability) and regression (future spending).
- [ ] **Data Preprocessing:**
  - Handle categorical data (e.g., text columns) using One-Hot Encoding.
  - Handle missing values.
- [ ] **Model Training Logic:**
  - Implement the function that fits the model to the training data sent from the frontend.
  - Save the trained model to a file (e.g., using `joblib` or `pickle`) so it can be reused without retraining.
- [ ] **Prediction Logic:**
  - Implement the function that loads the saved model and uses it to make predictions on new data.

### 3. Frontend Integration
- [ ] **Connect "Train Model" Page:**
  - Create a new view/component for the training interface.
  - Add a file upload similar to the "Atlas Optimizer".
  - Add a button that sends the cleaned data to the `/train` backend endpoint.
  - Show training progress and completion status from the backend.
- [ ] **Connect "Run Models" Page:**
  - Create a new view/component for the prediction interface.
  - Add a file upload for the data to be predicted on.
  - Add a button to send the data to the `/predict` backend endpoint.
- [ ] **Display Results:**
  - Create components to visualize the predictions (e.g., a table with a new "Prediction" column).
  - **(Crucial for Analysis):** If using Random Forest, create a chart (e.g., a bar chart) to display the "Feature Importance" returned from the model. This shows *why* the model made its predictions.

---

## 💡 Suggestions & Future Features

These are ideas for enhancing the project beyond the core requirements.

- [ ] **Model Selection:** Allow users to choose between different models (e.g., Random Forest, Gradient Boosting, a simple Neural Network) from the UI.
- [ ] **Real-time Training Feedback:** Use WebSockets to provide a more detailed, real-time log of the model training process to the frontend.
- [ ] **Advanced Visualizations:** Instead of just a table, display prediction results with interactive charts (e.g., distribution plots, confusion matrices for classification).
- [ ] **User Accounts & Model Storage:** Add user authentication so that different users can save and manage their own trained models.
- [ ] **Cloud Deployment:** Write a `Dockerfile` to containerize the frontend and backend, making it easy to deploy on cloud services like Heroku or AWS.
