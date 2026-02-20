#!/usr/bin/env bash

# Masumi Network Developer Skill Installer
# Compatible with Claude Code, Cursor, Codex, Windsurf, Cline, and other LLM dev tools

set -e

SKILL_NAME="masumi"
SKILL_DIR="skill"

echo "Installing Masumi Network Developer Skill..."
echo ""

# Detect installation target
# Priority: Environment variable > Auto-detect > Generic fallback
if [ -n "$SKILLS_DIR" ]; then
    INSTALL_TARGET="$SKILLS_DIR"
    echo "📍 Using SKILLS_DIR: $INSTALL_TARGET"
elif [ -d "$HOME/.claude/skills" ]; then
    INSTALL_TARGET="$HOME/.claude/skills"
    echo "📍 Using Claude Code skills directory: $INSTALL_TARGET"
elif [ -d "$HOME/.cursor/skills" ]; then
    INSTALL_TARGET="$HOME/.cursor/skills"
    echo "📍 Using Cursor skills directory: $INSTALL_TARGET"
elif [ -d "$HOME/.windsurf/skills" ]; then
    INSTALL_TARGET="$HOME/.windsurf/skills"
    echo "📍 Using Windsurf skills directory: $INSTALL_TARGET"
elif [ -d "$HOME/.cline/skills" ]; then
    INSTALL_TARGET="$HOME/.cline/skills"
    echo "📍 Using Cline skills directory: $INSTALL_TARGET"
else
    # Generic fallback for Codex and other AI tools
    INSTALL_TARGET="$HOME/.ai-skills"
    echo "📍 Creating skills directory: $INSTALL_TARGET"
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
    echo "  In your AI coding assistant (Claude Code, Cursor, Windsurf, Cline, etc.),"
    echo "  the skill will be automatically available. Ask questions like:"
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
