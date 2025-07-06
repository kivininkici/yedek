<?php
// Veritabanı Bağlantı Test Aracı
// Bu dosyayı sadece kurulum sırasında kullanın, sonra silin!

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🔧 OtoKiwi Veritabanı Bağlantı Testi</h2>";

// cPanel MySQL bilgileriniz - otomatik dolduruldu
$host = 'localhost';
$dbname = 'smmkiwic_otokiwi_db';
$username = 'smmkiwic_kiwi';
$password = '6xB^U?QR_NrDohQ{';

echo "<strong>Test edilen bilgiler:</strong><br>";
echo "Host: " . $host . "<br>";
echo "Database: " . $dbname . "<br>";
echo "Username: " . $username . "<br>";
echo "Password: " . (empty($password) ? 'BOŞ' : '***gizli***') . "<br><br>";

try {
    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "✅ <strong style='color: green;'>Veritabanı bağlantısı BAŞARILI!</strong><br><br>";
    
    // Tabloları kontrol et
    $tables = $pdo->query("SHOW TABLES")->fetchAll();
    echo "<strong>Bulunan tablolar:</strong><br>";
    
    if (empty($tables)) {
        echo "❌ Hiç tablo bulunamadı. database/setup.sql dosyasını çalıştırın.<br>";
    } else {
        foreach ($tables as $table) {
            $tableName = array_values($table)[0];
            echo "✅ " . $tableName . "<br>";
        }
    }
    
    echo "<br><strong>Veritabanı bilgileri:</strong><br>";
    $version = $pdo->query("SELECT VERSION()")->fetch();
    echo "MySQL Version: " . $version['VERSION()'] . "<br>";
    
    echo "<br>🎉 <strong style='color: green;'>Test başarılı! config/database.php dosyasında bu bilgileri kullanabilirsiniz.</strong>";
    
} catch (PDOException $e) {
    echo "❌ <strong style='color: red;'>Veritabanı bağlantısı BAŞARISIZ!</strong><br><br>";
    echo "<strong>Hata detayı:</strong><br>";
    echo $e->getMessage() . "<br><br>";
    
    echo "<strong>💡 Çözüm önerileri:</strong><br>";
    echo "1. cPanel → MySQL Databases bölümünde veritabanı ve kullanıcı oluşturun<br>";
    echo "2. Kullanıcıyı veritabanına atayın ve TÜM YETKİLERİ verin<br>";
    echo "3. Veritabanı adı genelde 'cpanel_kullanici_veritabani_adi' formatındadır<br>";
    echo "4. Kullanıcı adı genelde 'cpanel_kullanici_user_adi' formatındadır<br>";
    echo "5. Şifrenizin doğru olduğundan emin olun<br><br>";
    
    echo "<strong>🔍 Geçerli hata kodları:</strong><br>";
    echo "• 1045 = Kullanıcı adı/şifre hatalı<br>";
    echo "• 1049 = Veritabanı bulunamadı<br>";
    echo "• 2002 = MySQL sunucusuna erişilemiyor<br>";
}

echo "<br><br>";
echo "⚠️ <strong style='color: orange;'>GÜVENLİK UYARISI: Bu dosyayı test ettikten sonra SİLİN!</strong>";
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background: #f5f5f5;
}
</style>