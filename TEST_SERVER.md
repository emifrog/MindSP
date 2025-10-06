# 🧪 Test du Serveur Custom avec Socket.IO

## 🚀 Démarrage

### 1. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000` avec Socket.IO sur `ws://localhost:3000/api/socket`

### 2. Vérifier les logs

Vous devriez voir :

```
> Ready on http://localhost:3000
> Socket.IO ready on ws://localhost:3000/api/socket
```

## ✅ Tests à Effectuer

### Test 1 : Connexion Socket.IO

1. Ouvrir l'application : `http://localhost:3000`
2. Se connecter avec : `admin@sdis13.fr` / `Password123!`
3. Ouvrir la console du navigateur (F12)
4. Vérifier les logs :
   ```
   ✅ Socket connecté
   ✅ Socket authentifié
   ```

### Test 2 : Notifications

1. Cliquer sur l'icône 🔔 dans le header
2. Vérifier que le dropdown s'ouvre
3. Le compteur devrait afficher le nombre de notifications non lues

### Test 3 : Messagerie

1. Aller sur `/messages`
2. Vérifier que la liste des conversations s'affiche
3. Cliquer sur une conversation
4. Envoyer un message
5. Vérifier que le message apparaît instantanément

### Test 4 : Temps Réel (2 navigateurs)

1. Ouvrir 2 fenêtres de navigateur
2. Se connecter avec 2 utilisateurs différents
3. Créer une conversation entre eux
4. Envoyer un message depuis le navigateur 1
5. Vérifier que le message apparaît dans le navigateur 2 **sans rafraîchir**

### Test 5 : Indicateurs de Frappe

1. Dans une conversation, commencer à taper
2. L'autre utilisateur devrait voir "..." apparaître
3. Arrêter de taper
4. L'indicateur devrait disparaître après 1 seconde

### Test 6 : Messages Lus

1. Envoyer un message
2. L'autre utilisateur ouvre la conversation
3. Le message devrait afficher ✓✓ (double check)

### Test 7 : Présence Online/Offline

1. Ouvrir la console du navigateur
2. Taper : `socket.emit('get_online_users')`
3. Écouter : `socket.on('online_users', (users) => console.log(users))`
4. Vérifier la liste des utilisateurs en ligne

## 🐛 Dépannage

### Erreur : "Cannot find module 'socket.io'"

```bash
npm install socket.io socket.io-client
```

### Erreur : "Redis connection refused"

Le système de queue nécessite Redis. Pour l'instant, vous pouvez :

- Installer Redis localement
- Ou commenter les imports de queue dans le code

### Socket ne se connecte pas

1. Vérifier que le serveur custom est bien démarré (pas `next dev`)
2. Vérifier les logs du serveur
3. Vérifier la console du navigateur

## 📊 Logs Attendus

### Serveur

```
🔌 Client connecté: abc123
✅ Utilisateur authentifié: user-id
📨 User user-id rejoint conversation conv-id
💬 Message envoyé dans conversation conv-id
```

### Client (Console Navigateur)

```
✅ Socket connecté
✅ Socket authentifié
```

## 🎯 Fonctionnalités Testées

- [x] Connexion Socket.IO
- [x] Authentification
- [x] Envoi de messages
- [x] Réception temps réel
- [x] Indicateurs de frappe
- [x] Messages lus/non lus
- [x] Notifications
- [x] Présence online/offline

## 🚀 Prochaines Étapes

Si tous les tests passent :

1. ✅ Phase 4 complète et opérationnelle
2. 🎉 Prêt pour la Phase 5 (PWA & Offline)
3. 📝 Documenter les bugs trouvés
4. 🔧 Optimiser les performances

## 📝 Notes

- Le serveur custom remplace `next dev`
- Socket.IO est intégré dans le même processus
- Les routes Next.js fonctionnent normalement
- Hot reload fonctionne toujours

**Bon test !** 🚒🔥
