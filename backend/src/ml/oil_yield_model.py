"""
Oil Factory Machine Learning Engine - Backend Runner
Delegates to the central ml/train_model.py module using ml/dataset.csv
"""
import sys
import os

# Add root ml directory to sys.path
root_ml_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml"))
if root_ml_dir not in sys.path:
    sys.path.insert(0, root_ml_dir)

from train_model import main, predict_yield, train_model

if __name__ == "__main__":
    main()

