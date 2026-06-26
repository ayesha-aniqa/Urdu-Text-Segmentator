"""Inspect the saved model files to understand their structure."""
import torch
import pickle
import os

models_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'models')

# === BiLSTM .pt file ===
print("=" * 60)
print("=== BiLSTM .pt file ===")
print("=" * 60)
pt_path = os.path.join(models_dir, 'urdu_segmentor_bilstm.pt')
try:
    checkpoint = torch.load(pt_path, map_location='cpu', weights_only=False)
    print(f"Type: {type(checkpoint).__name__}")
    if isinstance(checkpoint, dict):
        print(f"Top-level keys: {list(checkpoint.keys())}")
        for k, v in checkpoint.items():
            if isinstance(v, torch.Tensor):
                print(f"  [{k}]: Tensor shape={v.shape} dtype={v.dtype}")
            elif isinstance(v, dict):
                print(f"  [{k}]: dict with {len(v)} entries")
                for sk, sv in list(v.items())[:10]:
                    if isinstance(sv, torch.Tensor):
                        print(f"    {sk}: Tensor {sv.shape}")
                    else:
                        val_repr = repr(sv)
                        if len(val_repr) > 80:
                            val_repr = val_repr[:80] + "..."
                        print(f"    {sk}: {type(sv).__name__} = {val_repr}")
            elif isinstance(v, (list, tuple)):
                print(f"  [{k}]: {type(v).__name__} len={len(v)}, first 5: {v[:5]}")
            elif isinstance(v, (int, float, str, bool)):
                print(f"  [{k}]: {type(v).__name__} = {v}")
            else:
                print(f"  [{k}]: {type(v).__name__}")
    else:
        print(f"Loaded object type: {type(checkpoint)}")
        if hasattr(checkpoint, 'state_dict'):
            sd = checkpoint.state_dict()
            print(f"state_dict keys ({len(sd)}):")
            for k, v in list(sd.items())[:15]:
                print(f"  {k}: {v.shape}")
except Exception as e:
    print(f"Error: {e}")

print()
print("=" * 60)
print("=== CRF .pkl file ===")
print("=" * 60)
pkl_path = os.path.join(models_dir, 'urdu_segmentor_crf.pkl')
try:
    with open(pkl_path, 'rb') as f:
        crf = pickle.load(f)
    print(f"Type: {type(crf).__name__}")
    print(f"Module: {type(crf).__module__}")
    if isinstance(crf, dict):
        print(f"Keys: {list(crf.keys())}")
        for k, v in list(crf.items())[:10]:
            if isinstance(v, dict):
                print(f"  [{k}]: dict with {len(v)} entries")
                for sk, sv in list(v.items())[:3]:
                    print(f"    {sk}: {type(sv).__name__}")
            elif isinstance(v, (list, tuple)):
                print(f"  [{k}]: {type(v).__name__} len={len(v)}, first 3: {v[:3]}")
            else:
                val_repr = repr(v)
                if len(val_repr) > 80:
                    val_repr = val_repr[:80] + "..."
                print(f"  [{k}]: {type(v).__name__} = {val_repr}")
    else:
        attrs = [a for a in dir(crf) if not a.startswith('_')]
        print(f"Public attributes: {attrs[:25]}")
        for attr_name in ['classes_', 'state_features_', 'transition_features_', 'num_labels', 'labels_']:
            if hasattr(crf, attr_name):
                val = getattr(crf, attr_name)
                val_repr = repr(val)
                if len(val_repr) > 100:
                    val_repr = val_repr[:100] + "..."
                print(f"  {attr_name}: {val_repr}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
