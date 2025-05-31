// assets/js/booking-lookup.js
import { db, collection, query, where, getDocs } from '../firebase/firebase-config.js';

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.querySelector('#phone').value.trim();

    if (!phone) {
        showError('يجب إدخال رقم الهاتف');
        return;
    }

    try {
        const q = query(collection(db, "appointments"),
            where("phone", "==", phone));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showError('لا يوجد حجز مسجل بهذا الرقم');
            return;
        }

        // عرض آخر حجز
        let latestBooking = null;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!latestBooking || new Date(data.date) > new Date(latestBooking.date)) {
                latestBooking = { id: doc.id, ...data };
            }
        });

        displayBooking(latestBooking);
    } catch (error) {
        console.error("Error searching for booking: ", error);
        showError('حدث خطأ أثناء البحث');
    }
});

function displayBooking(booking) {
    const detailsDiv = document.querySelector('.booking-details');
    detailsDiv.innerHTML = `
        <h5 class="text-center mb-3">تفاصيل الحجز</h5>
        <p><strong>الاسم:</strong> ${booking.full_name}</p>
        <p><strong>الخدمة:</strong> ${booking.service}</p>
        <p><strong>التاريخ:</strong> ${booking.date}</p>
        <p><strong>الوقت:</strong> ${booking.time}</p>
        <p><strong>تاريخ الحجز:</strong> ${new Date(booking.created_at).toLocaleString()}</p>
    `;
    detailsDiv.style.display = 'block';
}

function showError(message) {
    const errorDiv = document.querySelector('.alert-danger');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.querySelector('.booking-details').style.display = 'none';
}