#!/bin/bash

# Script to push code to GitHub after repository is created
# Run this after creating the repository at https://github.com/new

echo "🚀 Pushing SoStagey to GitHub..."
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "✓ Remote 'origin' already configured"
    git remote -v
else
    echo "Adding remote 'origin'..."
    git remote add origin https://github.com/BeingCallum2/sostagey.git
    echo "✓ Remote added"
fi

echo ""
echo "Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 View your repo at: https://github.com/BeingCallum2/sostagey"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   1. Repository exists at https://github.com/BeingCallum2/sostagey"
    echo "   2. You have push access to the repository"
    echo "   3. You're authenticated with GitHub (may need to set up credentials)"
fi


