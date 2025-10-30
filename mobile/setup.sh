#!/bin/bash

echo "🚀 SquadRun Mobile Setup"
echo "========================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Skipping creation."
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

echo ""
echo "🔍 Detecting your IP address..."
echo ""

# Detect OS and get IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    IP=$(ipconfig | grep "IPv4" | awk '{print $NF}' | head -1)
fi

if [ -z "$IP" ]; then
    echo "❌ Could not detect IP address automatically."
    echo ""
    echo "Please find your IP manually:"
    echo "  Mac/Linux: ifconfig | grep 'inet '"
    echo "  Windows: ipconfig"
    echo ""
    echo "Then edit mobile/.env and set:"
    echo "  API_BASE_URL=http://YOUR_IP:8000/api"
else
    echo "✅ Detected IP: $IP"
    echo ""

    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (BSD sed)
        sed -i '' "s|API_BASE_URL=.*|API_BASE_URL=http://$IP:8000/api|" .env
    else
        # Linux (GNU sed)
        sed -i "s|API_BASE_URL=.*|API_BASE_URL=http://$IP:8000/api|" .env
    fi

    echo "✅ Updated .env with your IP address"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the backend: docker compose up (from root directory)"
echo "  2. Start the mobile app: npm start"
echo "  3. Scan QR code with Expo Go on your phone"
echo ""
echo "📱 Make sure your phone and computer are on the same WiFi!"
echo ""
echo "For more info, see MOBILE_TESTING.md"
