import { db, collection, addDoc, query, where, getDocs } from '../firebase/firebase-config.js';

// تهيئة صفحة الحجز
document.addEventListener('DOMContentLoaded', () => {
    initDatePicker();
    setupFormSubmission();
});

function initDatePicker() {
    if (typeof $.fn.datepicker !== 'undefined' && $('#date').length) {
        $("#date").datepicker({
            dateFormat: "yy-mm-dd",
            minDate: 0,
            beforeShowDay: function (date) {
                const day = date.getDay();
                return [(day !== 5 && day !== 6), ''];
            },
            onSelect: function (selectedDate) {
                fetchBookedTimes(selectedDate);
            }
        });
    }
}

function setupFormSubmission() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = getFormData();
        if (!validateForm(formData)) return;

        try {
            await checkAvailability(formData);
            await saveAppointment(formData);
            showConfirmationPopup(formData);
            form.reset();
        } catch (error) {
            showErrorPopup(error);
        }
    });
}

function getFormData() {
    return {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim() || '',
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
    };
}

function validateForm(formData) {
    const requiredFields = ['fullName', 'phone', 'service', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
        showError('يرجى ملء جميع الحقول المطلوبة');
        return false;
    }

    if (!/^05\d{8}$/.test(formData.phone)) {
        showError('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
        return false;
    }

    return true;
}

async function checkAvailability(formData) {
    const q = query(collection(db, "appointments"),
        where("date", "==", formData.date),
        where("time", "==", formData.time));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("هذا الموعد محجوز مسبقاً، يرجى اختيار وقت آخر");
    }
}

async function saveAppointment(formData) {
    await addDoc(collection(db, "appointments"), {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        created_at: new Date().toISOString(),
        status: 'pending'
    });
}

function showConfirmationPopup(formData) {
    // إنشاء عنصر البوب اب
    const popup = document.createElement('div');
    popup.className = 'booking-confirmation-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <i class="fas fa-check-circle success-icon"></i>
                <h3>تم الحجز بنجاح!</h3>
            </div>
            <div class="popup-body">
                <div class="booking-detail">
                    <span class="detail-label">الاسم:</span>
                    <span class="detail-value">${escapeHtml(formData.fullName)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">الخدمة:</span>
                    <span class="detail-value">${escapeHtml(formData.service)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">التاريخ:</span>
                    <span class="detail-value">${formatArabicDate(formData.date)}</span>
                </div>
                <div class="booking-detail">
                    <span class="detail-label">الوقت:</span>
                    <span class="detail-value">${formData.time}</span>
                </div>
            </div>
            <div class="popup-footer">
                <button id="printBtn" class="btn btn-outline-secondary">
                    <i class="fas fa-print"></i> طباعة الإيصال
                </button>
                <button id="closeBtn" class="btn btn-primary">
                    <i class="fas fa-check"></i> تم
                </button>
            </div>
        </div>
    `;

    // إضافة البوب اب للصفحة
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden'; // منع التمرير خلف البوب اب

    // أحداث الأزرار
    document.getElementById('closeBtn').addEventListener('click', () => {
        popup.remove();
        document.body.style.overflow = '';
    });

    document.getElementById('printBtn').addEventListener('click', () => {
        printBookingDetails(formData);
    });
}

function printBookingDetails(formData) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>إيصال الحجز</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .receipt { max-width: 500px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .details { margin: 20px 0; }
                .detail-row { display: flex; margin: 10px 0; }
                .label { font-weight: bold; width: 120px; }
                .footer { text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>عيادة الابتسامة المشرقة</h2>
                    <p>إيصال حجز موعد</p>
                </div>
                <div class="details">
                    <div class="detail-row">
                        <div class="label">الاسم:</div>
                        <div>${escapeHtml(formData.fullName)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">رقم الجوال:</div>
                        <div>${escapeHtml(formData.phone)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">الخدمة:</div>
                        <div>${escapeHtml(formData.service)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">التاريخ:</div>
                        <div>${formatArabicDate(formData.date)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">الوقت:</div>
                        <div>${formData.time}</div>
                    </div>
                </div>
                <div class="footer">
                    <p>شكراً لثقتكم بنا</p>
                    <p>للاستفسار: 0123456789</p>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function formatArabicDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const form = document.getElementById('bookingForm');
    if (form) {
        form.prepend(errorDiv);
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    } else {
        alert(message);
    }
}

function showErrorPopup(error) {
    const errorMessage = error.message || 'حدث خطأ أثناء عملية الحجز';
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <i class="fas fa-exclamation-circle error-icon"></i>
                <h3>حدث خطأ</h3>
            </div>
            <div class="popup-body">
                <p>${errorMessage}</p>
            </div>
            <div class="popup-footer">
                <button id="closeErrorBtn" class="btn btn-primary">حسناً</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);
    document.getElementById('closeErrorBtn').addEventListener('click', () => {
        popup.remove();
    });
}

function escapeHtml(unsafe) {
    return unsafe?.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") || '';
}