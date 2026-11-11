"""
NeuralScan 2.0 - DenseNet121 Model Training Script
Architecture: DenseNet121 with Transfer Learning & Upper-Layer Fine-Tuning
Classes: 0=Covid, 1=Tuberculosis, 2=Normal, 3=Pneumonia
Dataset: Cleaned 65,240 images (51 cross-class duplicate groups removed)
"""

import os
from pathlib import Path
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

# 1. CONSTANTS & CONFIGURATION
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
NUM_CLASSES = 4
CLASS_NAMES = ["Covid", "Tuberculosis", "Normal", "Pneumonia"]
MODELS_DIR = Path(__file__).resolve().parent / "models"
MODELS_DIR.mkdir(exist_ok=True, parents=True)
MODEL_SAVE_PATH = MODELS_DIR / "densenet121_final.keras"


def build_densenet121_model() -> tf.keras.Model:
    """
    Builds DenseNet121 architecture:
    DenseNet121 (ImageNet weights)
    -> GlobalAveragePooling2D
    -> Dropout(0.3)
    -> Dense(256, activation='relu')
    -> Dropout(0.2)
    -> Dense(4, activation='softmax')
    """
    base_model = tf.keras.applications.DenseNet121(
        include_top=False,
        weights="imagenet",
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )

    # Initial transfer learning phase: freeze backbone
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
    # Correct DenseNet preprocessing
    x = tf.keras.applications.densenet.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.Dropout(0.3, name="dropout_1")(x)
    x = layers.Dense(256, activation="relu", name="dense_features")(x)
    x = layers.Dropout(0.2, name="dropout_2")(x)
    outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="classification_head")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="NeuralScan_DenseNet121")
    return model, base_model


def get_training_callbacks(checkpoint_path: Path):
    """
    Returns standard training callbacks:
    - ModelCheckpoint: Saves best validation loss model
    - EarlyStopping: Stops training if validation loss plateaus
    - ReduceLROnPlateau: Halves learning rate on validation stagnation
    """
    return [
        callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_loss",
            save_best_only=True,
            mode="min",
            verbose=1
        ),
        callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            mode="min",
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
            verbose=1
        )
    ]


def train_model(dataset_dir: str, epochs_phase1: int = 10, epochs_phase2: int = 15):
    """
    Two-phase training procedure:
    Phase 1: Train top classification head with frozen backbone (Adam lr=1e-3).
    Phase 2: Fine-tune upper layers of DenseNet121 with small learning rate (Adam lr=1e-5).
    """
    print(f"[*] Preparing DenseNet121 training pipeline...")
    print(f"[*] Target Classes: {CLASS_NAMES}")

    # Dataset loading using strict directory structure matching ResNet50
    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=CLASS_NAMES,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=True
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=CLASS_NAMES,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False
    )

    # Performance optimizations
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

    model, base_model = build_densenet121_model()

    # --- PHASE 1: Feature Extraction ---
    print("\n[=== PHASE 1: Training Classification Head ===]")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )

    cb_phase1 = get_training_callbacks(MODEL_SAVE_PATH)
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_phase1,
        callbacks=cb_phase1
    )

    # --- PHASE 2: Fine-Tuning Upper Layers ---
    print("\n[=== PHASE 2: Fine-Tuning DenseNet Upper Layers ===]")
    base_model.trainable = True
    # Freeze initial 300 layers, fine-tune remaining top dense blocks
    for layer in base_model.layers[:300]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )

    cb_phase2 = get_training_callbacks(MODEL_SAVE_PATH)
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_phase2,
        callbacks=cb_phase2
    )

    # Save final model
    model.save(str(MODEL_SAVE_PATH))
    print(f"\n[+] DenseNet121 model saved successfully to: {MODEL_SAVE_PATH}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train DenseNet121 for NeuralScan 2.0")
    parser.add_argument("--data_dir", type=str, default="./data", help="Path to cleaned dataset directory containing train/val/test")
    parser.add_argument("--epochs1", type=int, default=10, help="Epochs for Phase 1 (transfer learning)")
    parser.add_argument("--epochs2", type=int, default=15, help="Epochs for Phase 2 (fine-tuning)")
    args = parser.parse_args()

    train_model(args.data_dir, args.epochs1, args.epochs2)
