# 📋 Comandi Terminale per GitHub Branch WebPayback

## 🔗 Target: https://github.com/cyper73/webpayback-protocol/tree/webpayback

### 📥 STEP 1: Scarica e Prepara i File
```bash
# Scarica l'archivio dal tuo progetto Replit
# webpayback-protocol-v2-github-update-20250801.tar.gz

# Estrai i file
tar -xzf webpayback-protocol-v2-github-update-20250801.tar.gz
cd webpayback-protocol-extracted/
```

### 🔧 STEP 2: Configura Git e Repository
```bash
# Inizializza git (se necessario)
git init

# Configura il repository remoto
git remote add origin https://github.com/cyper73/webpayback-protocol.git

# Verifica la connessione
git remote -v
```

### 🌿 STEP 3: Crea e Passa al Branch WebPayback
```bash
# Scarica i branch esistenti dal remoto
git fetch origin

# Crea e passa al branch webpayback
git checkout -b webpayback

# Oppure se il branch esiste già:
git checkout webpayback
git pull origin webpayback
```

### 📤 STEP 4: Carica i File
```bash
# Aggiungi tutti i file
git add .

# Controlla cosa verrà committato
git status

# Commit con messaggio delle correzioni di sicurezza
git commit -m "🔒 Security Update: Wallet Verification System & Database Schema Fix

✅ Fixed wallet verification system bug (schema mismatch)
✅ Added missing signature_verified fields to database
✅ Completed security audit of all registered wallets  
✅ Removed malicious XSS entry, confirmed 8 legitimate wallets
✅ Content Certificate NFT system now fully operational
✅ Updated replit.md with security audit documentation"

# Push al branch webpayback
git push -u origin webpayback
```

### 🔍 STEP 5: Verifica Upload
```bash
# Controlla lo stato finale
git log --oneline -n 3

# URL finale del branch:
# https://github.com/cyper73/webpayback-protocol/tree/webpayback
```

## ⚡ Comando Rapido (All-in-One)
```bash
git init
git remote add origin https://github.com/cyper73/webpayback-protocol.git
git checkout -b webpayback
git add .
git commit -m "🔒 Security Update: Wallet Verification & Database Schema Fix"
git push -u origin webpayback
```

## 🚨 Troubleshooting
Se ricevi errori di autenticazione:
```bash
# Usa token personale invece della password
git remote set-url origin https://[TOKEN]@github.com/cyper73/webpayback-protocol.git
```

## 📦 File da Caricare
- client/ (Frontend React con Content Certificate UI)
- server/ (Backend con wallet verification system)  
- shared/ (Schema database aggiornato)
- contracts/ (Smart contracts WPT)
- docs/ (Documentazione completa)
- File di configurazione (package.json, tsconfig.json, etc.)