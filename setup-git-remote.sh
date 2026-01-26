#!/bin/bash

# Script para configurar repositorio remoto de Git
# Uso: ./setup-git-remote.sh <tipo> <usuario> <repositorio>
# Ejemplo: ./setup-git-remote.sh github hectorgalindez realestate

if [ $# -lt 3 ]; then
    echo "Uso: $0 <tipo> <usuario> <repositorio>"
    echo ""
    echo "Tipos soportados:"
    echo "  github          - GitHub (https://github.com)"
    echo "  gitea           - Gitea servidor personalizado"
    echo "  gitlab          - GitLab (https://gitlab.com)"
    echo "  bitbucket       - Bitbucket (https://bitbucket.org)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 github hectorgalindez realestate-admin"
    echo "  $0 gitlab myuser proyecto"
    echo ""
    echo "Después de ejecutar, realiza un push con:"
    echo "  git push -u origin master"
    exit 1
fi

TIPO=$1
USUARIO=$2
REPO=$3

case $TIPO in
    github)
        REMOTE_URL="https://github.com/${USUARIO}/${REPO}.git"
        echo "Configurando GitHub..."
        ;;
    gitlab)
        REMOTE_URL="https://gitlab.com/${USUARIO}/${REPO}.git"
        echo "Configurando GitLab..."
        ;;
    bitbucket)
        REMOTE_URL="https://bitbucket.org/${USUARIO}/${REPO}.git"
        echo "Configurando Bitbucket..."
        ;;
    gitea)
        # Para Gitea se requiere el servidor
        if [ $# -lt 4 ]; then
            echo "Para Gitea requiere: $0 gitea <servidor> <usuario> <repositorio>"
            exit 1
        fi
        SERVIDOR=$2
        USUARIO=$3
        REPO=$4
        REMOTE_URL="https://${SERVIDOR}/${USUARIO}/${REPO}.git"
        echo "Configurando Gitea en ${SERVIDOR}..."
        ;;
    *)
        echo "Tipo no soportado: $TIPO"
        exit 1
        ;;
esac

echo "URL del repositorio: $REMOTE_URL"
git remote add origin "$REMOTE_URL"

if [ $? -eq 0 ]; then
    echo "✅ Repositorio remoto configurado correctamente"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ve a tu plataforma ($TIPO) y crea un repositorio vacío"
    echo "2. Ejecuta: git push -u origin master"
    echo "3. Ingresa tus credenciales si es necesario"
else
    echo "❌ Error al configurar el repositorio remoto"
    exit 1
fi
