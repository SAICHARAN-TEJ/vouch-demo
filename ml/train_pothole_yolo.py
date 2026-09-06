"""
Pothole detection — YOLO training (Ultralytics).

Fine-tunes a single-class ('pothole') detector from the Kaggle
"Potholes Detection YOLOv8" dataset, starting from the YOLO11-nano
pretrained weights (yolo11n.pt).

Built to run on Kaggle (free GPU, dataset mounted at /kaggle/input), but works
anywhere the train/val paths in the dataset YAML resolve.

Usage (Kaggle cell or shell):
    python train_pothole_yolo.py \
        --data /kaggle/working/data.yaml \
        --weights yolo11n.pt \
        --epochs 100 --imgsz 640 --batch 16

Outputs (under <project>/<name>/):
    weights/best.pt   <- deploy this (best val mAP)
    weights/last.pt
    results.png, confusion_matrix.png, PR/F1 curves, ...
"""

from __future__ import annotations

import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train a YOLO pothole detector.")
    p.add_argument("--data", default="data.yaml", help="Path to the dataset YAML.")
    p.add_argument(
        "--weights",
        default="yolo11n.pt",
        help="Base weights to fine-tune (yolo11n.pt / yolov8n.pt / any .pt path).",
    )
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--batch", type=int, default=16, help="Batch size (-1 = auto).")
    p.add_argument("--patience", type=int, default=20, help="Early-stopping patience (epochs).")
    p.add_argument(
        "--device",
        default=None,
        help="CUDA device e.g. '0' or '0,1', or 'cpu'. Auto-detected if omitted.",
    )
    p.add_argument("--project", default="runs/pothole")
    p.add_argument("--name", default="yolo11n_potholes")
    p.add_argument("--export", default="onnx", help="Export format after training ('onnx', 'none', ...).")
    p.add_argument("--seed", type=int, default=0)
    return p.parse_args()


def main() -> None:
    args = parse_args()

    # Imported here so `--help` works before ultralytics/torch are installed.
    from ultralytics import YOLO
    import torch

    device = args.device
    if device is None:
        device = "0" if torch.cuda.is_available() else "cpu"

    print(f"[vouch] torch={torch.__version__} cuda={torch.cuda.is_available()} device={device}")
    print(f"[vouch] base weights : {args.weights}")
    print(f"[vouch] dataset yaml : {Path(args.data).resolve()}")

    model = YOLO(args.weights)

    model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        patience=args.patience,
        device=device,
        project=args.project,
        name=args.name,
        seed=args.seed,
        plots=True,
    )

    # Validate on the val split — reports mAP50, mAP50-95, precision, recall.
    metrics = model.val()
    try:
        print(
            f"[vouch] mAP50-95={metrics.box.map:.4f}  mAP50={metrics.box.map50:.4f}  "
            f"P={metrics.box.mp:.4f}  R={metrics.box.mr:.4f}"
        )
    except Exception:  # metrics shape can vary across ultralytics versions
        pass

    best = Path(args.project) / args.name / "weights" / "best.pt"
    print(f"[vouch] best weights : {best}")

    if args.export and args.export.lower() != "none":
        export_source = YOLO(str(best)) if best.exists() else model
        out = export_source.export(format=args.export, opset=12)
        print(f"[vouch] exported ({args.export}): {out}")


if __name__ == "__main__":
    main()
