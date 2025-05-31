import { auth, signInWithEmailAndPassword } from '../firebase/firebase-config.js';

document.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = "admin@clinic.com"; // استخدم نفس البريد الذي سجلته في الخطوة 2
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // إذا نجح التسجيل، توجيه إلى لوحة التحكم
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Login error details:", error);

        // رسائل خطأ مفصلة
        let errorMessage = "حدث خطأ غير متوقع";
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = "بريد إلكتروني غير صالح";
                break;
            case 'auth/user-disabled':
                errorMessage = "هذا الحساب معطل";
                break;
            case 'auth/user-not-found':
                errorMessage = "لا يوجد حساب مرتبط بهذا البريد";
                break;
            case 'auth/wrong-password':
                errorMessage = "كلمة المرور غير صحيحة";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "مصادقة البريد الإلكتروني غير مفعّلة. يرجى مراجعة إعدادات Firebase";
                break;
        }

        const errorDiv = document.querySelector('.alert-danger');
        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        } else {
            alert(errorMessage);
        }
    }
});