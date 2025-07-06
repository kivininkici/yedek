<?php
// Upload klasörüne direkt erişimi engelle
header("HTTP/1.1 403 Forbidden");
exit("Access denied");
?>