#!/bin/bash

# Script to switch between Supabase direct connection and connection pooler

echo "🔄 Supabase Database Connection Switcher"
echo "========================================"

if [ "$1" = "pooler" ]; then
    echo "🔄 Switching to Connection Pooler (production)..."
    sed -i 's|DATABASE_URL="postgresql://postgres:Fs09rn2q1I1xcvUM@db.hpedivtpmdjnwetftiqr.supabase.co:5432/postgres"|DATABASE_URL="postgresql://postgres.hpedivtpmdjnwetftiqr:Fs09rn2q1I1xcvUM@aws-0-us-east-2.pooler.supabase.com:6543/postgres"|' .env
    echo "✅ Switched to Connection Pooler"
    echo "🚀 Benefits: Better performance, connection pooling, reduced overhead"
elif [ "$1" = "direct" ]; then
    echo "🔄 Switching to Direct Connection (development)..."
    sed -i 's|DATABASE_URL="postgresql://postgres.hpedivtpmdjnwetftiqr:Fs09rn2q1I1xcvUM@aws-0-us-east-2.pooler.supabase.com:6543/postgres"|DATABASE_URL="postgresql://postgres:Fs09rn2q1I1xcvUM@db.hpedivtpmdjnwetftiqr.supabase.co:5432/postgres"|' .env
    echo "✅ Switched to Direct Connection"
    echo "🔧 Benefits: Simpler setup, direct database access"
else
    echo "❌ Usage: ./scripts/switch-db.sh [direct|pooler]"
    echo ""
    echo "Options:"
    echo "  direct  - Use direct connection (development)"
    echo "  pooler  - Use connection pooler (production)"
    echo ""
    echo "Current connection:"
    grep "DATABASE_URL=" .env | head -1
fi 