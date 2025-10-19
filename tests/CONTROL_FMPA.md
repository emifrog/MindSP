# ✅ Checklist Contrôle Module FMPA

**Module** : FMPA (Fiche de Manifestation et de Participation aux Activités)  
**Date** : 18 Octobre 2025  
**Testeur** : **********\_**********  
**Statut** : ⏳ En attente

---

## 📊 Résumé

- **Total tests** : 50
- **Passés** : 0
- **Échecs** : 0
- **Progression** : 0%

---

## 1. Création FMPA (11 tests)

### Page `/fmpa/new`

- [ ] **1.1** Page accessible (admin/manager uniquement)
- [ ] **1.2** Formulaire complet affiché
- [ ] **1.3** Champ titre (requis, min 3 caractères)
- [ ] **1.4** Champ description (optionnel, textarea)
- [ ] **1.5** Date/heure début (datetime-local, requis)
- [ ] **1.6** Date/heure fin (datetime-local, requis)
- [ ] **1.7** Champ lieu (requis)
- [ ] **1.8** Sélection type (3 types : FORMATION, MANOEUVRE, PRESENCE_ACTIVE)
- [ ] **1.9** Nombre max participants (optionnel, number)
- [ ] **1.10** Checkbox "Approbation requise"
- [ ] **1.11** Bouton "Créer" fonctionnel, redirection vers `/fmpa/[id]`

**Notes** : **********************\_\_\_**********************

---

## 2. Liste FMPA (10 tests)

### Page `/fmpa`

- [ ] **2.1** Liste complète affichée
- [ ] **2.2** Filtre statut (PLANNED, ONGOING, COMPLETED, CANCELLED)
- [ ] **2.3** Filtre type (6 types)
- [ ] **2.4** Filtre date (date picker range)
- [ ] **2.5** Recherche par titre (insensible casse)
- [ ] **2.6** Tri par date (desc par défaut)
- [ ] **2.7** Pagination (10 par page)
- [ ] **2.8** Cartes FMPA avec toutes les infos
- [ ] **2.9** Badges statut colorés
- [ ] **2.10** Compteur participants affiché

**Notes** : **********************\_\_\_**********************

---

## 3. Détails FMPA (8 tests)

### Page `/fmpa/[id]`

- [ ] **3.1** Toutes les infos FMPA affichées
- [ ] **3.2** Liste participants avec statuts
- [ ] **3.3** QR Code affiché
- [ ] **3.4** Bouton "S'inscrire" (si non inscrit)
- [ ] **3.5** Bouton "Se désinscrire" (si inscrit)
- [ ] **3.6** Bouton "Télécharger QR Code"
- [ ] **3.7** Bouton "Scanner émargement" (admin)
- [ ] **3.8** Bouton "Export PDF liste" (admin)

**Notes** : **********************\_\_\_**********************

---

## 4. Inscription/Désinscription (7 tests)

- [ ] **4.1** Inscription fonctionnelle
- [ ] **4.2** Modal confirmation affichée
- [ ] **4.3** Statut PENDING créé
- [ ] **4.4** Toast confirmation
- [ ] **4.5** Email confirmation envoyé
- [ ] **4.6** Notification in-app créée
- [ ] **4.7** Désinscription fonctionnelle

**Test** :

```
1. Cliquer "S'inscrire"
2. Confirmer modal
3. Vérifier toast
4. Vérifier email (logs)
5. Vérifier notification
6. Cliquer "Se désinscrire"
7. Confirmer
```

**Notes** : **********************\_\_\_**********************

---

## 5. QR Code & Émargement (7 tests)

- [ ] **5.1** QR Code généré (format: `fmpa:{id}:user:{userId}`)
- [ ] **5.2** Téléchargement PNG fonctionnel
- [ ] **5.3** Scanner accessible (admin uniquement)
- [ ] **5.4** Scan QR Code fonctionnel
- [ ] **5.5** Validation émargement
- [ ] **5.6** Statut → ATTENDED
- [ ] **5.7** Mise à jour liste temps réel

**Test** :

```
1. Télécharger QR Code
2. Ouvrir scanner (admin)
3. Scanner QR Code
4. Vérifier statut ATTENDED
5. Vérifier mise à jour liste
```

**Notes** : **********************\_\_\_**********************

---

## 6. Export PDF Liste Émargement (5 tests)

- [ ] **6.1** Bouton "Export PDF" visible (admin)
- [ ] **6.2** Génération PDF fonctionnelle
- [ ] **6.3** Contenu PDF complet (logo, infos, tableau)
- [ ] **6.4** Mise en page professionnelle
- [ ] **6.5** Téléchargement automatique

**Test** :

```
1. Cliquer "Export PDF"
2. Attendre génération
3. Ouvrir PDF
4. Vérifier contenu
5. Vérifier mise en page
```

**Notes** : **********************\_\_\_**********************

---

## 7. Emails & Notifications (5 tests)

- [ ] **7.1** Email confirmation inscription
- [ ] **7.2** Email rappel 24h avant
- [ ] **7.3** Email annulation
- [ ] **7.4** Notification in-app inscription
- [ ] **7.5** Notification in-app annulation

**Test** :

```
1. S'inscrire → vérifier email
2. Modifier date FMPA à demain → vérifier rappel
3. Annuler FMPA → vérifier email annulation
4. Vérifier notifications in-app
```

**Notes** : **********************\_\_\_**********************

---

## 8. Modification & Annulation (5 tests)

- [ ] **8.1** Bouton "Modifier" (admin uniquement)
- [ ] **8.2** Formulaire pré-rempli
- [ ] **8.3** Modification sauvegardée
- [ ] **8.4** Annulation FMPA fonctionnelle
- [ ] **8.5** Emails envoyés aux participants

**Test** :

```
1. Modifier FMPA (admin)
2. Sauvegarder
3. Vérifier modifications
4. Annuler FMPA
5. Vérifier emails participants
```

**Notes** : **********************\_\_\_**********************

---

## 9. Permissions (3 tests)

- [ ] **9.1** USER peut voir FMPA
- [ ] **9.2** USER peut s'inscrire/désinscrire
- [ ] **9.3** Seul ADMIN peut créer/modifier/annuler

**Test** :

```
1. Login USER
2. Vérifier accès lecture
3. Vérifier inscription possible
4. Vérifier création impossible
5. Login ADMIN
6. Vérifier toutes actions possibles
```

**Notes** : **********************\_\_\_**********************

---

## 🐛 Bugs Trouvés

| #   | Description | Sévérité | Statut |
| --- | ----------- | -------- | ------ |
| 1   |             | ⚠️       |        |
| 2   |             | ⚠️       |        |
| 3   |             | ⚠️       |        |

**Sévérité** : 🔴 Critique | 🟠 Majeur | 🟡 Mineur | 🟢 Cosmétique

---

## ✅ Validation Finale

- [ ] Tous les tests passés
- [ ] Bugs critiques corrigés
- [ ] Documentation à jour
- [ ] Module validé pour production

**Signature** : **********\_********** **Date** : **********\_**********
