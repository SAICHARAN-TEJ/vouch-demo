# Pothole Detection — YOLO11 training

Fine-tunes **`yolo11n.pt`** (YOLO11-nano) into a single-class `pothole` detector
using the Kaggle **Potholes Detection YOLOv8** dataset.

> Ultralytics trains YOLO11 with the exact same API as YOLOv8. `yolo11n.pt` is the
> newer/stronger nano model, so we use it as the base weights.

## Files
| File | What it is |
|---|---|
| `pothole_yolo_kaggle.ipynb` | **Run this on Kaggle.** Self-contained: builds `data.yaml`, trains, validates, previews predictions, exports ONNX. |
| `train_pothole_yolo.py` | Same pipeline as a CLI script (Kaggle cell, Colab, or a local GPU box). |
| `requirements.txt` | `ultralytics>=8.3.0` (pulls in torch, etc.). |
| `../data.yaml` | The dataset config you provided (Kaggle input paths, `nc: 1`, `names: ['pothole']`). |
| `../yolo11n.pt` | Base weights you added. Upload as an input dataset **or** enable Internet so it downloads. |

## Why Kaggle (not this machine)
Your `data.yaml` points at `/kaggle/input/potholes-detection-yolov8/...` — the dataset
is **mounted on Kaggle**, not present locally. This machine also has no `torch`/`ultralytics`
installed and Python 3.14 (PyTorch wheels are unreliable there), and CPU training would
be impractically slow. Kaggle gives you the mounted dataset **and** a free GPU, so run it there.

## Run on Kaggle (recommended)
1. Create a new Kaggle Notebook and upload `pothole_yolo_kaggle.ipynb` (File → Import Notebook).
2. **Add Input** → search **"Potholes Detection YOLOv8"** → add the dataset.
3. **Settings → Accelerator → GPU** (T4 x2 or P100).
4. Get the base weights one of two ways:
   - **Settings → Internet → On** (ultralytics downloads `yolo11n.pt` automatically), or
   - **Add Input** and upload your `yolo11n.pt` — the notebook auto-detects it under `/kaggle/input/**`.
5. **Run All.** The notebook writes `/kaggle/working/data.yaml`, trains, prints metrics, shows
   sample predictions, and exports ONNX.
6. Grab `best.pt` (and `best.onnx`) from the **Output** tab.

Expected: 100 epochs of `yolo11n` @ 640px on this dataset is roughly **1–2 h** on a Kaggle GPU
(early-stops via `patience=20`). Real-world pothole mAP50 typically lands in the **~0.5–0.8**
range depending on the split — treat any single number with healthy skepticism.

## Run via the script instead
```bash
pip install -r ml/requirements.txt
python ml/train_pothole_yolo.py --data data.yaml --weights yolo11n.pt \
    --epochs 100 --imgsz 640 --batch 16
```
`--device` auto-selects GPU when available. Outputs land under `runs/pothole/yolo11n_potholes/`.

## How this connects to Vouch (important)
The Vouch demo keeps perception behind a **`CameraProvider` interface** (`src/camera/`), and
ships with `MockCameraProvider` for a reliable, repeatable hero flow. That's deliberate — the
PRD scopes real ML as a *future* path and uses simulated detections for Demo v1 (Story >
Feature count, Reliability > Complexity). This trained model is that future path made real.

Two ways to use `best.pt`/`best.onnx` once trained — pick when you're ready:
- **Standalone proof (low risk):** keep the live demo on the mock provider, and show the
  trained detector separately (the notebook's annotated sample predictions, metrics, curves)
  as evidence the perception is real. Nothing in the app changes.
- **Wired in (higher effort):** add a `YoloCameraProvider` that runs `best.onnx` via
  `onnxruntime-web` in-browser (or a small local inference service) and emits the same
  `CameraDetection` shape the engine already consumes. No changes to the Context Engine or UI
  — only a new provider swapped in at `src/camera/index.ts`.

Nothing here touches secrets or the frontend build; it's a separate ML workstream.
