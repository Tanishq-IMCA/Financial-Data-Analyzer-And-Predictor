from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
MODELS_DIR = 'models'
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Flux Predictive Backend is running'})

@app.route('/models', methods=['GET'])
def list_models():
    """List all available trained models."""
    models = []
    if os.path.exists(MODELS_DIR):
        for filename in os.listdir(MODELS_DIR):
            if filename.endswith('.pkl'):
                # In a real app, we would load metadata. For now, parse filename.
                # Expected format: Name_Type_Date_Accuracy.pkl (simplified for now)
                # We'll just return the filename and some dummy stats if metadata isn't found
                filepath = os.path.join(MODELS_DIR, filename)
                try:
                    # Try to load the object to get metadata if we stored it as a dict
                    loaded = joblib.load(filepath)
                    if isinstance(loaded, dict) and 'metadata' in loaded:
                        models.append(loaded['metadata'])
                    else:
                        # Fallback for raw models
                        models.append({
                            'id': filename,
                            'name': filename.replace('.pkl', ''),
                            'type': 'Unknown',
                            'date': 'Unknown',
                            'accuracy': 'N/A'
                        })
                except:
                    continue
    return jsonify(models)

@app.route('/models/<model_id>', methods=['DELETE'])
def delete_model(model_id):
    """Delete a specific model."""
    # model_id is expected to be the filename or ID stored in metadata
    # For simplicity, let's assume model_id passed from frontend corresponds to a filename for now
    # or we iterate to find it.
    
    # Security: Prevent directory traversal
    safe_filename = os.path.basename(model_id)
    filepath = os.path.join(MODELS_DIR, safe_filename)
    
    # If the frontend sends just an ID (like timestamp), we might need to search.
    # For this implementation, let's assume the frontend sends the filename as ID for deletion
    # OR we search for the file containing that ID in metadata.
    
    # Let's implement a search by ID since our frontend uses timestamps as IDs
    target_file = None
    for filename in os.listdir(MODELS_DIR):
        if filename.endswith('.pkl'):
            try:
                loaded = joblib.load(os.path.join(MODELS_DIR, filename))
                if isinstance(loaded, dict) and 'metadata' in loaded:
                    if str(loaded['metadata']['id']) == str(model_id):
                        target_file = filename
                        break
            except:
                continue
    
    if target_file:
        os.remove(os.path.join(MODELS_DIR, target_file))
        return jsonify({'status': 'success', 'message': 'Model deleted'})
    
    return jsonify({'status': 'error', 'message': 'Model not found'}), 404

@app.route('/train', methods=['POST'])
def train_model():
    """Train a new model from uploaded CSV."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    model_type = request.form.get('modelType', 'Random Forest')
    target_column = request.form.get('targetColumn')
    
    if not target_column:
        return jsonify({'error': 'Target column is required'}), 400

    try:
        df = pd.read_csv(file)
        
        # Basic Data Preprocessing
        if target_column not in df.columns:
            return jsonify({'error': f'Target column "{target_column}" not found in CSV'}), 400
            
        X = df.drop(columns=[target_column])
        y = df[target_column]
        
        # Identify column types
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_features = X.select_dtypes(include=['object']).columns

        # Create Preprocessing Pipeline
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median'))
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])

        # Select Model
        if model_type == 'Random Forest':
            # Check if Classification or Regression based on target variable
            if y.dtype == 'object' or len(y.unique()) < 20: # Heuristic for classification
                clf = RandomForestClassifier(n_estimators=100, random_state=42)
                task_type = 'Classification'
            else:
                clf = RandomForestRegressor(n_estimators=100, random_state=42)
                task_type = 'Regression'
        else:
            # Fallback to RF for now
            clf = RandomForestClassifier(n_estimators=100, random_state=42)
            task_type = 'Classification'

        # Full Pipeline
        model = Pipeline(steps=[('preprocessor', preprocessor),
                                ('classifier', clf)])

        # Train
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        score = model.score(X_test, y_test)
        accuracy_str = f"{score*100:.1f}%"

        # Save Model & Metadata
        model_id = str(int(pd.Timestamp.now().timestamp()))
        filename = f"{model_type.replace(' ', '_')}_{model_id}.pkl"
        
        metadata = {
            'id': model_id,
            'name': f"{model_type} - {target_column}",
            'type': model_type,
            'date': pd.Timestamp.now().strftime('%Y-%m-%d'),
            'accuracy': accuracy_str,
            'task_type': task_type,
            'target_column': target_column
        }
        
        save_object = {
            'model': model,
            'metadata': metadata
        }
        
        joblib.dump(save_object, os.path.join(MODELS_DIR, filename))
        
        return jsonify({'status': 'success', 'metadata': metadata})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Run predictions using a saved model."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    model_id = request.form.get('modelId')
    if not model_id:
        return jsonify({'error': 'Model ID is required'}), 400
        
    file = request.files['file']
    
    try:
        # Find and load the model
        target_file = None
        for filename in os.listdir(MODELS_DIR):
            if filename.endswith('.pkl'):
                try:
                    loaded = joblib.load(os.path.join(MODELS_DIR, filename))
                    if isinstance(loaded, dict) and 'metadata' in loaded:
                        if str(loaded['metadata']['id']) == str(model_id):
                            target_file = filename
                            model_data = loaded
                            break
                except:
                    continue
        
        if not target_file:
            return jsonify({'error': 'Model not found'}), 404
            
        model = model_data['model']
        df = pd.read_csv(file)
        
        # Run Prediction
        predictions = model.predict(df)
        
        # Add predictions to dataframe
        result_df = df.copy()
        result_df['Prediction'] = predictions
        
        # Convert to dict for JSON response
        # We'll return the first 100 rows for preview, or the full CSV string
        preview = result_df.head(100).to_dict(orient='records')
        
        # Also return feature importance if available
        feature_importance = []
        if hasattr(model.named_steps['classifier'], 'feature_importances_'):
            # This is tricky with pipelines because OneHotEncoder changes feature names
            # For now, we'll skip detailed feature names mapping to keep it simple
            # or just return raw values
            importances = model.named_steps['classifier'].feature_importances_
            feature_importance = importances.tolist()

        return jsonify({
            'status': 'success',
            'preview': preview,
            'feature_importance': feature_importance
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
