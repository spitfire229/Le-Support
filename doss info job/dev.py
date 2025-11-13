import os
import json

# Dossier racine contenant tous les sous-dossiers d'images
DOSSIER_IMAGES = "images"

# Extensions d'images acceptées
EXTENSIONS = (".png", ".jpg", ".jpeg", ".gif", ".webp")

def generer_json_par_dossier():
    # Vérifie que le dossier racine existe
    if not os.path.exists(DOSSIER_IMAGES):
        os.makedirs(DOSSIER_IMAGES)
        print(f"Dossier '{DOSSIER_IMAGES}' créé (aucun sous-dossier pour le moment).")
        return

    # Parcourt tous les sous-dossiers
    sous_dossiers = [d for d in os.listdir(DOSSIER_IMAGES)
                     if os.path.isdir(os.path.join(DOSSIER_IMAGES, d))]

    if not sous_dossiers:
        print("Aucun sous-dossier trouvé dans 'images/'.")
        return

    for dossier in sous_dossiers:
        chemin_complet = os.path.join(DOSSIER_IMAGES, dossier)
        fichiers = [
            f for f in os.listdir(chemin_complet)
            if f.lower().endswith(EXTENSIONS)
        ]

        # Nom du fichier JSON basé sur le nom du dossier
        fichier_json = os.path.join(chemin_complet, f"{dossier}.json")

        # Écriture du JSON
        with open(fichier_json, "w", encoding="utf-8") as f:
            json.dump(fichiers, f, indent=2, ensure_ascii=False)

        print(f"✅ {len(fichiers)} image(s) détectée(s) dans '{dossier}/'")
        print(f"   → Fichier JSON généré : {fichier_json}")

if __name__ == "__main__":
    generer_json_par_dossier()
