# 📝 Documentation Système de Patchnotes Automatisés

## 🌟 Introduction

Le système de patchnotes automatisés permet de tenir les utilisateurs informés des nouvelles fonctionnalités et améliorations apportées à Splane. Il génère et affiche automatiquement les notes de mise à jour basées sur les pull requests fusionnées.

## 🎯 Objectifs

- ✅ Informer les utilisateurs des nouveautés
- ✅ Générer automatiquement les notes à partir des PR
- ✅ Afficher les patchnotes une seule fois par utilisateur
- ✅ Organiser les modifications par catégories

## 🔄 Flux de fonctionnement

### 1️⃣ Création et mise à jour des patchnotes (via PR sur `dev`)

Lorsqu'une pull request est fusionnée dans la branche `dev`, le workflow `update-patchnote.yml` s'exécute pour :

- 🔍 Analyser le nom de la branche pour déterminer le type de modification
- 📊 Catégoriser la modification selon le préfixe de la branche (`feature/`, `fix/`, etc.)
- 📝 Mettre à jour le fichier temporaire `patchnote-draft.json` qui se trouve dans le dossier `docs/patchnotes/`
- 🚀 Créer une PR pour intégrer ces modifications dans le draft

```
PR (feature/nouvelle-fonction) → dev → update-patchnote.yml → PR de mise à jour → dev
```

### 2️⃣ Publication des patchnotes (via PR sur `main`)

Lorsqu'une PR est fusionnée dans la branche `main`, le workflow `publish-patchnote.yml` s'exécute pour :

- 🔢 Générer un numéro de version (SemVer: X.Y.Z)
- 💾 Sauvegarder le patchnote final dans `docs/patchnotes/`
- 🏷️ Créer un tag Git avec la nouvelle version
- 🧹 Supprimer les fichiers temporaires
- 📋 Créer une PR pour intégrer ces modifications dans `main`

```
PR (dev) → main → publish-patchnote.yml → PR de publication → main → push-patchnote-tag.yml
```

### 3️⃣ Finalisation (après fusion de la PR de publication)

Le fichier de `docker-compose.prod.yml` contient un service pour **importer directement dans la db** les `patchnotes`, grâce au script `import-patchnotes.js` disponible dans le dossier `scripts/`.  (plus de détails sur le script, [plus bas](#-scripts-dimportation))

## 🗂️ Structure du système

### 📂 Format des fichiers

**Fichier temporaire** (patchnote-draft.json) :
```json
{
  "version": "",
  "title": "Prochaine mise à jour",
  "emoji": "✨",
  "sections": {
    "Nouveautés": [
      { "name": "feature-name", "description": "Description de la fonctionnalité" }
    ],
    "Corrections": [],
    "Améliorations techniques": [],
    "Autres changements": []
  }
}
```

**Fichier final** (docs/patchnotes/vX.Y.Z.json) :
```json
{
  "version": "1.2.0",
  "title": "Mise à jour 1.2.0",
  "emoji": "✨",
  "sections": {
    "Nouveautés": [
      { "name": "feature-name", "description": "Description de la fonctionnalité" }
    ],
    "Corrections": [],
    "Améliorations techniques": [],
    "Autres changements": []
  }
}
```

### 🧠 Modèle de données

```prisma
model PatchNote {
  id          Int       @id @default(autoincrement())
  version     String    // Par exemple "1.2.0"
  title       String
  emoji       String?
  releaseDate DateTime  @default(now())
  content     String    // Contenu JSON structuré des notes
  published   Boolean   @default(false)
  
  userViews   PatchNoteView[]
}

model PatchNoteView {
  id          Int       @id @default(autoincrement())
  userId      Int
  patchNoteId Int
  viewedAt    DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id])
  patchNote   PatchNote @relation(fields: [patchNoteId], references: [id])
  
  @@unique([userId, patchNoteId])
}
```

## 🔄 Intégration dans l'application

### 📱 Affichage des patchnotes

1. Lors de l'accès au dashboard, le système vérifie si un patchnote non vu existe pour l'utilisateur
2. Si oui, une modal s'affiche avec les détails du patchnote
3. Une fois fermée, la modal ne réapparaît plus pour ce patchnote

### 🖌️ Rendu du patchnote

La modal présente :
- 🎨 Un en-tête avec l'emoji et le titre
- 📋 Les modifications organisées par catégories
- ✅ Un bouton pour fermer et continuer

## 🔧 Versionnement

Le système utilise le versionnement sémantique (SemVer) :

- **X** (MAJEUR) : Changements incompatibles avec les versions précédentes
- **Y** (MINEUR) : Ajout de fonctionnalités compatibles (incrémenté par défaut)
- **Z** (CORRECTIF) : Corrections de bugs

## 🚩 Conventions de nommage des branches

- `feature/...` → Section "Nouveautés"
- `fix/...` ou `bugfix/...` ou `patch/...` → Section "Corrections"
- `chore/...` → Section "Améliorations techniques"
- Autres préfixes → Section "Autres changements"

## 💻 Scripts d'importation

Le script `import-patchnotes.js` est utilisé lors du déploiement pour importer les patchnotes dans la base de données comme  :

1. Lit tous les fichiers JSON dans `docs/patchnotes/`
2. Vérifie si le patchnote existe déjà en base
3. Importe uniquement les nouveaux patchnotes

## 🔍 Dépannage

### Problèmes courants

- ❌ **Le patchnote n'apparaît pas** : Vérifier que le fichier a bien été importé en base de données
- ❌ **La PR automatique échoue** : Vérifier les logs GitHub Actions pour identifier le problème
- ❌ **Boucle de PR** : S'assurer que les conditions d'exclusion des workflows sont correctes

### 🛠️ Solution de contournement

En cas de problème avec le système automatique, il est toujours possible de créer manuellement un fichier dans `docs/patchnotes/` au format approprié.

## 📈 Évolutions futures possibles

- 🎮 Interface d'administration pour gérer les patchnotes
- 📚 Historique des patchnotes accessible aux utilisateurs
- 🔔 Notification par email pour les mises à jour majeures
- 🎛️ Personnalisation du comportement d'affichage par utilisateur

---