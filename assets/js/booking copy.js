import { db, collection, addDoc, query, where, getDocs } from '../firebase/firebase-config.js';

document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // جمع بيانات النموذج
    const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value || '',
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
    };

    // التحقق من البيانات المطلوبة
    if (!formData.fullName || !formData.phone || !formData.service || !formData.date || !formData.time) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    try {
        // التحقق من توفر الموعد
        const q = query(collection(db, "appointments"),
            where("date", "==", formData.date),
            where("time", "==", formData.time));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("هذا الموعد محجوز مسبقاً، يرجى اختيار وقت آخر");
            return;
        }

        // إضافة الحجز الجديد
        await addDoc(collection(db, "appointments"), {
            full_name: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            service: formData.service,
            date: formData.date,
            time: formData.time,
            created_at: new Date().toISOString()
        });

        // عرض رسالة النجاح
        showSuccessMessage(formData);

    } catch (error) {
        console.error("Error adding appointment: ", error);
        showError("حدث خطأ أثناء حجز الموعد، يرجى المحاولة لاحقاً");
    }
});

// عرض رسالة النجاح
function showSuccessMessage(formData) {
    // إنشاء عنصر رسالة النجاح
    const successDiv = document.createElement('div');
    successDiv.className = 'confirmation-message';
    successDiv.innerHTML = `
        <div class="confirmation-container">
            <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>تم حجز موعدك بنجاح!</h2>
            <div class="confirmation-details">
                <p><strong>الاسم:</strong> ${escapeHtml(formData.fullName)}</p>
                <p><strong>الخدمة:</strong> ${escapeHtml(formData.service)}</p>
                <p><strong>التاريخ:</strong> ${escapeHtml(formData.date)}</p>
                <p><strong>الوقت:</strong> ${escapeHtml(formData.time)}</p>
            </div>
            <button id="backToHome" class="btn btn-primary mt-3">العودة للصفحة الرئيسية</button>
        </div>
    `;

    // إضافة الأنماط مباشرة (يمكن نقلها لملف CSS لاحقاً)
    const style = document.createElement('style');
    style.textContent = `
        .confirmation-message {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .confirmation-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            text-align: center;
        }
        .confirmation-icon {
            color: #28a745;
            font-size: 4rem;
            margin-bottom: 1rem;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(successDiv);

    // إضافة حدث للزر
    document.getElementById('backToHome')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// عرض رسالة الخطأ
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// دالة مساعدة لمنع ثغرات XSS
function escapeHtml(unsafe) {
    return unsafe?.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") || '';
}