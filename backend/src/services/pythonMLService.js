import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Primary ML script path at root ml/train_model.py (uses dataset.csv)
const rootMLPath = path.resolve(__dirname, '../../../ml/train_model.py');
const internalMLPath = path.resolve(__dirname, '../ml/oil_yield_model.py');
const pythonScriptPath = fs.existsSync(rootMLPath) ? rootMLPath : internalMLPath;

/**
 * Executes the Python Scikit-Learn Linear Regression model script
 * and returns the prediction result object.
 */
export const runPythonMLPrediction = (oilType = 'Groundnut Oil', seedWeightKg = 1000) => {
  return new Promise((resolve, reject) => {
    const args = [
      pythonScriptPath,
      '--oil',
      String(oilType),
      '--seeds',
      String(seedWeightKg),
      '--json',
    ];

    const pythonCmd = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');

    execFile(pythonCmd, args, { windowsHide: true, timeout: 20000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`Failed to parse Python ML output: ${stdout || stderr}`));
      }
    });
  });
};

export default {
  runPythonMLPrediction,
};

