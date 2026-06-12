# TODO — Avancement NewAppGLPI

Basé sur la liste des phases de `docs/Prompt.md` et le suivi de temps personnel
(`ToDo_ETU003306.pdf`, 83 sessions de travail réparties du 11/05 au 19/05/2025).
État au 2026-06-12.

## ✅ Fait

- [x] **Phase 1 — Authentification Backoffice par code unique**
  Code dans `.env`, route `POST /api/backoffice/login`, `BackofficeLoginPage` + protection de route (sessionStorage).

- [x] **Phase 2 — Import des 4 fichiers (3 CSV + ZIP images)**
  `server/importPipeline.js` (4 étapes : assets → images → tickets → coûts), find-or-create générique,
  journal SQLite, `BackofficeImportPage`. Bugs de robustesse corrigés (en-têtes CSV insensibles à la casse,
  `parseFrenchNumber` qui renvoie 0 au lieu de NaN).

- [x] **Phase 3 — Réinitialisation des données**
  `resetImportedData()` (LIFO via le journal SQLite, `force_purge`), bouton de confirmation dans `BackofficeHomePage`.

- [x] **Phase 4 — Dashboard Backoffice**
  Éléments par type, tickets par type/statut, + cartes **Coûts enregistrés / Coût total (Ar)**.
  N+1 corrigés (appels globaux `listItems` + `Promise.all`).

- [x] **Phase 5 — Page Tickets (liste + fiche détail)**
  Liste, fiche détail (éléments associés + coûts), édition (statut/priorité/type).
  Ajout récent : page "Ajouter un coût" avec **liste de tous les coûts enregistrés** sous le formulaire.

- [x] **Phase 6 — FrontOffice : liste des éléments + recherche multicritère**
  `ElementsPage` (filtre RSQL : nom/emplacement/statut/fabricant).

- [x] **Phase 7 — FrontOffice : création de ticket + association d'éléments**
  `CreateTicketPage` (formulaire + panier d'éléments associés, création via v2 + association via session v1).

- [x] **Phase 9 — FrontOffice : création d'élément**
  `CreateElementPage` (Computer/Monitor/Phone), champs Name/Status/Location/Manufacturer/Item_Type/Model/Inventory_Number/User,
  find-or-create + journalisation via `findOrCreateRef()`.

- [x] **Phase 10 — Backoffice CRUD éléments (liste + fiche détail)**
  `ElementsPage` (cartes avec image), `ElementDetailPage` — vient d'être enrichie :
  image à gauche / infos (Nom, Statut, Emplacement, Fabricant, Type, Modèle, N° d'inventaire) à droite, commentaire en bas.

- [x] **Phase 11 — Kanban FrontOffice**
  3 colonnes (Nouveau / En cours / Terminé), drag & drop natif, modale détail, modale création de ticket.
  Bug corrigé : tous les tickets tombaient dans "Nouveau" (lookup statut insensible à la casse).

- [x] **Phase 12 — Paramètres Kanban Backoffice**
  `KanbanSettingsPage` (3 couleurs + libellés FR/MG), `GET/PUT /api/kanban/settings`.

## ⏳ À faire / à vérifier

- [ ] **Phase 8 — Vérifications ExistingApp ↔ NewApp**
  - [ ] Réimporter les 4 fichiers et confirmer dans GLPI (interface ExistingApp) que tous les éléments,
        images, tickets et coûts créés sont bien visibles.
  - [ ] Modifier une donnée directement dans GLPI (ex. changer le statut d'un ticket, renommer un élément)
        et vérifier que NewApp (Backoffice + FrontOffice) reflète immédiatement le changement.
  - [ ] Refaire le cycle complet **import → modification dans GLPI → reset** et vérifier qu'aucune incohérence
        ne subsiste (journal SQLite vidé correctement, GLPI revenu à l'état initial).

## Pistes de finition (optionnel, non bloquant)

- [ ] Revue finale de la perf des pages Backoffice (latence ~2s/page restante = coût fixe GLPI v1 par appel —
      acceptable selon l'architecture "lecture live" retenue, mais à mentionner si l'évaluateur questionne).
- [ ] Relecture CSS globale (cohérence Backoffice/FrontOffice) avant la démonstration finale.
