"""
Oil Factory Machine Learning Engine - CLI Runner
Delegates to the central ml/train_model.py module using ml/dataset.csv
"""
import sys
import os

# Add ml directory to sys.path
ml_dir = os.path.join(os.path.dirname(__file__), "ml")
if ml_dir not in sys.path:
    sys.path.insert(0, ml_dir)

from train_model import main, predict_yield, train_model

if __name__ == "__main__":
    main()

