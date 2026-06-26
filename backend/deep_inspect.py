"""Extract CRF feature patterns and BiLSTM architecture details."""
import pickle, os, torch, sys
sys.stdout.reconfigure(encoding='utf-8')

models_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'models')

# === CRF ===
print("=== CRF Details ===")
pkl_path = os.path.join(models_dir, 'urdu_segmentor_crf.pkl')
with open(pkl_path, 'rb') as f:
    crf = pickle.load(f)

print(f"Type: {type(crf).__name__}")
print(f"Classes: {crf.classes_}")

# Get feature function patterns
sf = crf.state_features_
feature_prefixes = set()
for (feat_name, label), weight in list(sf.items())[:200]:
    prefix = feat_name.split(':')[0] if ':' in feat_name else feat_name.split('=')[0] if '=' in feat_name else feat_name
    feature_prefixes.add(prefix)

print(f"\nState features: {len(sf)} total")
print(f"Feature prefixes found: {sorted(feature_prefixes)[:30]}")

# Show some sample features (ASCII-safe)
print("\nSample features (first 20):")
for i, ((feat_name, label), weight) in enumerate(sf.items()):
    if i >= 20:
        break
    safe_name = feat_name.encode('ascii', 'replace').decode('ascii')
    print(f"  ({safe_name}, {label}): {weight:.4f}")

# Transition features
if hasattr(crf, 'transition_features_'):
    tf = crf.transition_features_
    print(f"\nTransition features: {len(tf)} entries")
    for (from_label, to_label), weight in tf.items():
        print(f"  {from_label} -> {to_label}: {weight:.4f}")

# Check what predict expects
print(f"\nhas predict: {hasattr(crf, 'predict')}")
print(f"has predict_single: {hasattr(crf, 'predict_single')}")

# Check algorithm used
if hasattr(crf, 'algorithm'):
    print(f"Algorithm: {crf.algorithm}")

# === BiLSTM ===
print("\n=== BiLSTM Architecture ===")
pt_path = os.path.join(models_dir, 'urdu_segmentor_bilstm.pt')
sd = torch.load(pt_path, map_location='cpu', weights_only=False)

emb = sd['embedding.weight']
vocab_size = emb.shape[0]
emb_dim = emb.shape[1]
print(f"Vocab size: {vocab_size}, Embedding dim: {emb_dim}")

lstm1_ih = sd['bilstm1.weight_ih_l0']
lstm1_hidden = lstm1_ih.shape[0] // 4
print(f"BiLSTM1: input={lstm1_ih.shape[1]}, hidden={lstm1_hidden} (bidirectional -> {lstm1_hidden*2})")

lstm2_ih = sd['bilstm2.weight_ih_l0']
lstm2_hidden = lstm2_ih.shape[0] // 4
lstm2_input = lstm2_ih.shape[1]
print(f"BiLSTM2: input={lstm2_input}, hidden={lstm2_hidden} (bidirectional -> {lstm2_hidden*2})")

h2t = sd['hidden2tag.weight']
num_tags = h2t.shape[0]
h2t_input = h2t.shape[1]
print(f"Hidden2Tag: input={h2t_input}, output={num_tags}")

crf_trans = sd['crf.trans_matrix']
print(f"CRF (built-in): trans_matrix={crf_trans.shape}")
print(f"  start_trans={sd['crf.start_trans'].shape}")
print(f"  end_trans={sd['crf.end_trans'].shape}")

print("\n=== Summary ===")
print(f"Architecture: Embedding({vocab_size},{emb_dim}) -> BiLSTM({emb_dim},{lstm1_hidden},bidirectional) -> BiLSTM({lstm2_input},{lstm2_hidden},bidirectional) -> Linear({h2t_input},{num_tags}) -> CRF({num_tags})")
print(f"The .pt file contains a COMPLETE BiLSTM+CRF model (CRF layer is BUILT-IN)")
print(f"The .pkl file contains a SEPARATE sklearn CRF model (feature-based)")
print(f"Both models output {num_tags} tags for BIES (no X tag)")
