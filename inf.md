CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    service VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


تستخدم "clinic_db" root
مع كلمة مرور فارغة لـ 

للتسجيل الى لوحة التحكم 
كلمة المرور
doctor123
