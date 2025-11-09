#!/bin/bash

# Script to switch to a different GitHub account
# Usage: ./switch-github-account.sh YOUR_NEW_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "❌ Please provide your new GitHub username"
    echo "Usage: ./switch-github-account.sh YOUR_NEW_GITHUB_USERNAME"
    exit 1
fi

NEW_USERNAME=$1
REPO_NAME="sostagey"

echo "🔄 Switching to GitHub account: $NEW_USERNAME"
echo ""

# Remove old remote
if git remote get-url origin &>/dev/null; then
    echo "Removing old remote..."
    git remote remove origin
    echo "✓ Old remote removed"
fi

# Add new remote
echo "Adding new remote for $NEW_USERNAME..."
git remote add origin "https://github.com/$NEW_USERNAME/$REPO_NAME.git"
echo "✓ New remote added: https://github.com/$NEW_USERNAME/$REPO_NAME.git"
echo ""

# Show current remotes
echo "Current remotes:"
git remote -v
echo ""

echo "✅ Remote updated!"
echo ""
echo "📝 Next steps:"
echo "   1. Create the repository on GitHub: https://github.com/new"
echo "      - Repository name: $REPO_NAME"
echo "      - Make sure you're signed in as $NEW_USERNAME"
echo ""
echo "   2. After creating the repo, run:"
echo "      git push -u origin main"
echo ""
echo "   3. When prompted for credentials:"
echo "      - Username: $NEW_USERNAME"
echo "      - Password: Use a Personal Access Token (not your password)"
echo "        Create one at: https://github.com/settings/tokens"
echo "        Give it 'repo' scope"


