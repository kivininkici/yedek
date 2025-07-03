#!/usr/bin/env node

/**
 * OtoKiwi Admin Setup Script
 * This script sets up master password and creates admin user
 */

import http from 'http';

const MASTER_PASSWORD = 'm;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ)';
const ADMIN_DATA = {
  username: 'admin',
  password: '123456',
  email: 'akivi@example.com'
};

// Function to make HTTP request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function setupAdmin() {
  console.log('🚀 OtoKiwi Admin Setup Başlatılıyor...\n');

  try {
    // Step 1: Create admin user with master password
    console.log('📝 Admin kullanıcısı oluşturuluyor...');
    
    const adminOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/create-direct',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const adminData = {
      ...ADMIN_DATA,
      masterPassword: MASTER_PASSWORD
    };

    const adminResult = await makeRequest(adminOptions, adminData);
    
    if (adminResult.status === 200 || adminResult.status === 201) {
      console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
      console.log(`   Kullanıcı Adı: ${ADMIN_DATA.username}`);
      console.log(`   E-posta: ${ADMIN_DATA.email}`);
    } else if (adminResult.status === 409) {
      console.log('ℹ️  Admin kullanıcısı zaten mevcut!');
    } else {
      console.log('❌ Admin oluşturma hatası:', adminResult.data);
    }

    // Step 2: Test master password
    console.log('\n🔐 Master şifre test ediliyor...');
    
    const testOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/verify-master-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const testResult = await makeRequest(testOptions, { masterPassword: MASTER_PASSWORD });
    
    if (testResult.status === 200) {
      console.log('✅ Master şifre doğrulandı!');
    } else {
      console.log('❌ Master şifre test hatası:', testResult.data);
    }

    console.log('\n🎯 Kurulum Tamamlandı!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 GİRİŞ BİLGİLERİ:');
    console.log(`   Master Şifre: ${MASTER_PASSWORD}`);
    console.log(`   Admin Kullanıcı: ${ADMIN_DATA.username}`);
    console.log(`   Admin Şifre: ${ADMIN_DATA.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Admin paneline erişim: http://localhost:5000/admin');
    console.log('💡 Normal kullanıcı arayüzü: http://localhost:5000/user');

  } catch (error) {
    console.error('❌ Kurulum hatası:', error.message);
    console.log('\n💡 Sunucunun çalıştığından emin olun: npm run dev');
  }
}

// Run setup
setupAdmin();