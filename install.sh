#!/usr/bin/env bash

# Masumi Network Developer Skill Installer
# Compatible with Claude Code, Cursor, and other LLM dev tools

set -e

SKILL_NAME="masumi"
SKILL_DIR="skill"
INSTALL_TARGET="${CLAUDE_CODE_SKILLS_DIR:-$HOME/.claude/skills}"

echo "🚀 Installing Masumi Network Developer Skill..."
echo ""

# Detect installation target
if [ -n "$CLAUDE_CODE_SKILLS_DIR" ]; then
    echo "📍 Detected Claude Code skills directory: $INSTALL_TARGET"
elif [ -d "$HOME/.cursor/skills" ]; then
    INSTALL_TARGET="$HOME/.cursor/skills"
    echo "📍 Detected Cursor skills directory: $INSTALL_TARGET"
elif [ -d "$HOME/.claude/skills" ]; then
    echo "📍 Using default skills directory: $INSTALL_TARGET"
else
    echo "⚠️  No skills directory detected. Creating: $INSTALL_TARGET"
    mkdir -p "$INSTALL_TARGET"
fi

# Create target directory
TARGET_DIR="$INSTALL_TARGET/$SKILL_NAME"
mkdir -p "$TARGET_DIR"

# Copy skill files
echo "📦 Copying skill files..."
cp -r "$SKILL_DIR"/* "$TARGET_DIR/"

# Verify installation
if [ -f "$TARGET_DIR/SKILL.md" ]; then
    echo "✅ Installation successful!"
    echo ""
    echo "📚 Masumi skill installed to: $TARGET_DIR"
    echo ""
    echo "Available skill files:"
    echo "  • SKILL.md - Main entry point and quick start"
    echo "  • cardano-blockchain.md - Blockchain fundamentals"
    echo "  • masumi-payments.md - Payment integration"
    echo "  • sokosumi-marketplace.md - Marketplace listing"
    echo "  • registry-identity.md - Registry and DIDs"
    echo "  • agentic-services.md - Building MIP-003 agents"
    echo "  • smart-contracts.md - Smart contract details"
    echo ""
    echo "🎯 Usage:"
    echo "  In Claude Code/Cursor, the skill will be automatically available."
    echo "  Ask questions like:"
    echo "    - 'How do I integrate Masumi payments into my agent?'"
    echo "    - 'Show me how to list my agent on Sokosumi'"
    echo "    - 'What is the MIP-003 standard?'"
    echo ""
    echo "📖 Learn more: https://docs.masumi.network"
    echo ""
    echo "Happy building in the Agentic Economy! 🚀"
else
    echo "❌ Installation failed. Please check the skill directory."
    exit 1
fi
