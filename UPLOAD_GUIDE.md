# How to Upload Large Folders to GitHub / Comment téléverser de gros dossiers sur GitHub

## English Version

### Problem
When trying to upload more than 100 files at once through GitHub's web interface, you'll see this error:
> "Yowza, that's a lot of files. Try uploading fewer than 100 at a time."

### Solution: Use Git Command Line

Instead of using the web interface, you can use Git commands to upload any number of files. Here's how:

#### Step 1: Install Git
1. Download Git from [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Install it with default settings
3. Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux)

#### Step 2: Configure Git (First Time Only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

#### Step 3: Clone Your Repository
Navigate to where you want to work and clone the repository:
```bash
git clone https://github.com/kevinpierreprof-ops/Fallen-Galaxy-Clone.git
cd Fallen-Galaxy-Clone
```

#### Step 4: Add Your Files
Copy all your files and folders into the `Fallen-Galaxy-Clone` directory.

#### Step 5: Upload Your Files
```bash
# Add all files to git
git add .

# Create a commit with a message describing your changes
git commit -m "Add game files"

# Push your changes to GitHub
git push
```

That's it! All your files will be uploaded to GitHub, regardless of how many there are.

### Troubleshooting

**Authentication Error?**
- GitHub may ask for authentication
- Create a Personal Access Token at [https://github.com/settings/tokens](https://github.com/settings/tokens)
- Use the token as your password when prompted

**Large Files Error?**
- Git has issues with files larger than 100MB
- For large files, consider using Git LFS: [https://git-lfs.github.com/](https://git-lfs.github.com/)

---

## Version Française

### Problème
Lorsque vous essayez de téléverser plus de 100 fichiers à la fois via l'interface web de GitHub, vous verrez cette erreur :
> "Yowza, that's a lot of files. Try uploading fewer than 100 at a time."

### Solution : Utiliser Git en ligne de commande

Au lieu d'utiliser l'interface web, vous pouvez utiliser les commandes Git pour téléverser n'importe quel nombre de fichiers. Voici comment :

#### Étape 1 : Installer Git
1. Téléchargez Git depuis [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Installez-le avec les paramètres par défaut
3. Ouvrez votre terminal (Invite de commandes sur Windows, Terminal sur Mac/Linux)

#### Étape 2 : Configurer Git (Première fois seulement)
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@exemple.com"
```

#### Étape 3 : Cloner votre dépôt
Naviguez vers l'endroit où vous voulez travailler et clonez le dépôt :
```bash
git clone https://github.com/kevinpierreprof-ops/Fallen-Galaxy-Clone.git
cd Fallen-Galaxy-Clone
```

#### Étape 4 : Ajouter vos fichiers
Copiez tous vos fichiers et dossiers dans le répertoire `Fallen-Galaxy-Clone`.

#### Étape 5 : Téléverser vos fichiers
```bash
# Ajouter tous les fichiers à git
git add .

# Créer un commit avec un message décrivant vos modifications
git commit -m "Ajout des fichiers du jeu"

# Pousser vos modifications vers GitHub
git push
```

C'est tout ! Tous vos fichiers seront téléversés sur GitHub, peu importe leur nombre.

### Dépannage

**Erreur d'authentification ?**
- GitHub peut demander une authentification
- Créez un jeton d'accès personnel sur [https://github.com/settings/tokens](https://github.com/settings/tokens)
- Utilisez le jeton comme mot de passe lorsqu'on vous le demande

**Erreur de fichiers volumineux ?**
- Git a des problèmes avec les fichiers de plus de 100 Mo
- Pour les gros fichiers, envisagez d'utiliser Git LFS : [https://git-lfs.github.com/](https://git-lfs.github.com/)

---

## Quick Reference / Référence Rapide

### Common Commands / Commandes Courantes

```bash
# Check status / Vérifier le statut
git status

# Add all files / Ajouter tous les fichiers
git add .

# Add specific file / Ajouter un fichier spécifique
git add filename.txt

# Commit changes / Valider les modifications
git commit -m "Your message / Votre message"

# Push to GitHub / Pousser vers GitHub
git push

# Pull latest changes / Récupérer les dernières modifications
git pull
```

### Video Tutorials / Tutoriels Vidéo
- [Git and GitHub for Beginners (English)](https://www.youtube.com/watch?v=RGOj5yH7evk)
- [Git et GitHub pour débutants (Français)](https://www.youtube.com/results?search_query=git+github+tutoriel+francais+debutant)
