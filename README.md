# 📅 SPLANE

Splane est une application de gestion de projets construite avec Next.js 15, TypeScript et PostgreSQL, offrant des tableaux Kanban, une authentification utilisateur et un système automatisé de patchnotes.

## 📝 Système de Patchnote Automatisé

### Vue d'ensemble

Le système de patchnote automatise la génération et la diffusion des notes de mise à jour basées sur les pull requests fusionnées. Il utilise les conventions de nommage des branches pour catégoriser automatiquement les changements.

### Flux de fonctionnement

```
1️⃣ Développement
   PR (feature/xxx) → merge dev → GitHub Action → Draft patchnote

2️⃣ Release
   PR (dev) → merge main → GitHub Action → Version finale → Tag Git

3️⃣ Déploiement
   Docker → Import automatique → Base de données
```

### Conventions de branches

- `feature/nom-feature` → Section "Nouveautés"
- `fix/nom-fix` ou `bugfix/nom-fix` → Section "Corrections"
- `chore/nom-chore` → Section "Améliorations techniques"
- Autres → Section "Autres changements"

### Intégration Docker

Le service `patchnote-importer` dans `docker-compose.prod.yml` importe automatiquement les patchnotes lors du déploiement :

```yaml
patchnote-importer:
  # Service qui lit docs/patchnotes/*.json
  # et importe en base de données
  restart: 'no'
  command: node /app/scripts/import-patchnotes.js
```

### Structure des patchnotes

Les patchnotes sont stockés en JSON dans `docs/patchnotes/vX.Y.Z.json` :

```json
{
  "version": "1.2.0",
  "title": "Mise à jour 1.2.0",
  "emoji": "✨",
  "sections": {
    "news": [{ "name": "feature-name", "description": "Description", "pr_number": "42" }],
    "corrections": [],
    "technical-improvements": [],
    "other-changes": []
  }
}
```

## 🚀 Développement

### Commandes essentielles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run lint     # Vérification du code
make up          # Docker développement
make up-build    # Docker avec rebuild
```

### Structure du projet

```
src/
├── app/          # Pages Next.js App Router
├── action/       # Server actions (auth, projects, tasks, patchnotes)
├── components/   # Composants React
├── lib/          # Utilitaires (auth, prisma, email)
└── hook/         # Hooks React personnalisés
```
