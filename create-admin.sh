#!/bin/bash

# OtoKiwi Admin Creation Script
# Creates admin user with master password: 5c2z6D1UicpYVvPBQkeoPy0OMsDgxAobfke1Hv5FoV9CwLhuxh

echo "🚀 OtoKiwi Admin Setup başlatılıyor..."

# Create admin user with curl
curl -X POST http://localhost:5000/api/admin/create-direct \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin", 
    "password": "123456", 
    "email": "akivi@example.com", 
    "masterPassword": "5c2z6D1UicpYVvPBQkeoPy0OMsDgxAobfke1Hv5FoV9CwLhuxh"
  }'

echo ""
echo "✅ Kurulum tamamlandı!"
echo "📋 Giriş Bilgileri:"
echo "   Master Şifre: 5c2z6D1UicpYVvPBQkeoPy0OMsDgxAobfke1Hv5FoV9CwLhuxh"
echo "   Admin Kullanıcı: admin"
echo "   Admin Şifre: 123456"
echo "🌐 Admin Panel: http://localhost:5000/admin"