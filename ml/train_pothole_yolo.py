from __future__ import annotations
import argparse
from pathlib import Path
def main():
 p=argparse.ArgumentParser();p.add_argument('--data',default='data.yaml');p.add_argument('--weights',default='yolo11n.pt');p.add_argument('--epochs',type=int,default=100);p.add_argument('--imgsz',type=int,default=640);p.add_argument('--batch',type=int,default=16);p.add_argument('--device',default=None);p.add_argument('--project',default='runs/pothole');p.add_argument('--name',default='yolo11n_potholes');p.add_argument('--export',default='onnx');a=p.parse_args()
 from ultralytics import YOLO
 m=YOLO(a.weights);m.train(data=a.data,epochs=a.epochs,imgsz=a.imgsz,batch=a.batch,device=a.device,project=a.project,name=a.name,patience=20,plots=True);m.val();best=Path(a.project)/a.name/'weights'/'best.pt';
 if a.export!='none': YOLO(str(best) if best.exists() else a.weights).export(format=a.export,opset=12)
if __name__=='__main__': main()
