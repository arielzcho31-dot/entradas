# 🔒 INSTRUCCIONES DE GIT - Seguridad

## ✅ ANTES DE COMMITEAR

### 1. Verificar que .env.local NO está en Git

```bash
# Ver estado
git status | grep ".env.local"

# Debería estar vacío. Si aparece .env.local:
git rm --cached .env.local

# Verificar que está en .gitignore
cat .gitignore | grep ".env.local"

# Si no aparece, agregarlo:
echo ".env.local" >> .gitignore
```

### 2. Limpiar archivos temporales

```bash
# Remover archivos .bak
rm -f src/middleware.ts.bak
rm -f src/lib/rate-limit.ts.bak

# Verificar no hay otros .bak
find . -name "*.bak" -type f

# Agregar al .gitignore
echo "*.bak" >> .gitignore
```

### 3. Verificar que Firebase NO está incluido

```bash
# Buscar imports de Firebase
grep -r "firebase" src/ --include="*.ts" --include="*.tsx"

# Si aparece solo en:
# - node_modules/ (OK)
# - .git/ (OK)
# Entonces está bien

# Si aparece en código fuente, eso es PROBLEMA
```

---

## 🚀 COMMITEAR LOS CAMBIOS

### Paso 1: Ver qué cambió

```bash
git status
```

**Esperado:**
```
modified:   package.json
modified:   src/middleware.ts
modified:   src/context/auth-context.tsx
modified:   src/app/api/auth/login/route.ts
modified:   src/app/api/auth/register/route.ts
modified:   .gitignore

Untracked files:
  src/lib/api-utils.ts
  src/lib/validators.ts
  src/lib/auth-utils.ts
  src/lib/...
  .env.example
  scripts/generate-secrets.sh
  [documentación]
```

### Paso 2: Crear commits lógicos

```bash
# Commit 1: Dependencias
git add package.json
git commit -m "chore: update dependencies (jose, stable next)"

# Commit 2: Librerías de seguridad
git add src/lib/api-utils.ts src/lib/validators.ts src/lib/auth-utils.ts
git commit -m "feat: add security utilities (JWT, validation, API utils)"

# Commit 3: Hooks
git add src/hooks/use-api.ts
git commit -m "feat: add useApi hook for secure requests with auto-refresh"

# Commit 4: API Routes
git add src/app/api/auth/me/route.ts
git add src/app/api/auth/logout/route.ts
git add src/app/api/auth/refresh/route.ts
git add src/app/api/auth/register/route.ts
git add src/app/api/auth/login/route.ts
git commit -m "feat: implement secure auth endpoints with JWT + refresh tokens"

# Commit 5: Middleware y contexto
git add src/middleware.ts src/context/auth-context.tsx
git commit -m "feat: add middleware for route protection and auth context using cookies"

# Commit 6: Configuración
git add .env.example .gitignore scripts/generate-secrets.sh
git commit -m "config: add environment template and secrets generator"

# Commit 7: Documentación
git add AUDIT_SUMMARY.md SECURITY_CHANGES.md SETUP_POST_AUDIT.md QUICK_START_SECURITY.md
git add EXAMPLES_NEW_ARCHITECTURE.md CHECKLIST_AUDIT.md FINAL_STEPS.md
git add DOCUMENTATION_INDEX.md README_SECURITY.md ARCHITECTURE_DIAGRAM.md
git add CHECKLIST_PRINTABLE.md SUMMARY_TABLE.md
git commit -m "docs: add comprehensive security audit documentation"
```

### Paso 3: Ver el resultado

```bash
git log --oneline -10
```

**Esperado:**
```
abc1234 docs: add comprehensive security audit documentation
def5678 config: add environment template and secrets generator
ghi9012 feat: add middleware for route protection...
jkl3456 feat: implement secure auth endpoints...
mno7890 feat: add useApi hook for secure requests...
pqr1234 feat: add security utilities...
stu5678 chore: update dependencies...
```

---

## 📤 PUSH A REMOTO

```bash
# Ver branch actual
git branch

# Push a remoto (asumiendo origin/main)
git push origin main

# O si usas otra rama:
git push origin [tu-rama]

# Ver estado
git status
```

**Esperado:**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

## ✅ VERIFICACIÓN FINAL

```bash
# Verificar que .env.local NO está en remoto
git log -p --all -- .env.local

# Debería mostrar:
# "fatal: path '.env.local' does not exist in any of the trees"

# Verificar commits fueron subidos
git log --oneline origin/main -10

# Debería mostrar tus commits nuevos
```

---

## ⚠️ SI COMETISTE UN ERROR

### Si commiteaste .env.local

```bash
# 1. IMMEDIATAMENTE cambiar credenciales
# (En BD, Gmail, JWT secrets, etc)

# 2. Remover del historio de Git
git filter-branch --tree-filter 'rm -f .env.local' -f HEAD

# 3. Force push (cuidado, afecta a otros)
git push --force-with-lease origin main

# 4. Notificar al equipo
# ⚠️ Riesgoso, consultar con tech lead
```

### Si commiteaste código de Firebase

```bash
# 1. Revertir commit
git revert [commit-hash]

# 2. Remover imports de Firebase
# 3. Hacer nuevo commit limpio
# 4. Push
```

---

## 🔍 AUDITORÍA DE COMMITS

Para verificar que todo está bien:

```bash
# Ver cambios en cada commit
git show abc1234  # Cambiar por hash del commit

# Ver solo archivos modificados
git show --name-only abc1234

# Ver diff de seguridad
git diff main~7 main -- src/context/auth-context.tsx

# Verificar que no hay credenciales
git grep "JWT_SECRET=" -- "*.ts" "*.tsx" "*.js"
# Debería estar vacío o solo en documentación
```

---

## 📋 CHECKLIST DE GIT

- [ ] .env.local NO está en remoto
- [ ] *.bak archivos removidos
- [ ] Firebase imports removidos del código
- [ ] .gitignore actualizado
- [ ] Commits con mensajes descriptivos
- [ ] Commits lógicamente separados
- [ ] Todo está pushed a remoto
- [ ] Sin conflictos de merge
- [ ] CI/CD pasó (si existe)

---

## 🚀 PRÓXIMO PASO

Después de pushear:

```bash
# 1. Crear Pull Request (si en rama separada)
# 2. Code review
# 3. Merge a main
# 4. Deploy a producción

# Para deploy:
npm run build
npm start
```

---

## 📞 SI NECESITAS AYUDA

```bash
# Ver historio de cambios
git log --oneline -20

# Ver diff de archivo específico
git diff src/context/auth-context.tsx

# Ver cambios entre commits
git diff abc1234..def5678

# Revertir un commit (NO lo hagas sin consultar)
git revert [commit-hash]
```

---

**Importante:** Una vez pusheado, los cambios están en la historia de Git para siempre. No hay "deshacer" completamente (aunque sí revertir).

**Procede con confianza. ✅**
