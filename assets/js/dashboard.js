// assets/js/dashboard.js
import { db, collection, getDocs, deleteDoc, doc, onSnapshot, auth, signOut } from '../firebase/firebase-config.js';

// تحميل الحجوزات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();

    // إعداد تصفية الحجوزات
    document.querySelector('[name="filter"]').addEventListener('change', (e) => {
        loadAppointments(e.target.value);
    });

    // إعداد البحث
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = document.querySelector('[name="search"]').value;
        const filter = document.querySelector('[name="filter"]').value;
        loadAppointments(filter, searchTerm);
    });

    // تسجيل الخروج
    document.querySelector('.logout-btn').addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    });
});

async function loadAppointments(filter = 'all', searchTerm = '') {
    try {
        let q = collection(db, "appointments");

        // التصفية حسب التاريخ
        if (filter === 'upcoming') {
            q = query(q, where("date", ">=", new Date().toISOString().split('T')[0]));
        } else if (filter === 'past') {
            q = query(q, where("date", "<", new Date().toISOString().split('T')[0]));
        }

        const querySnapshot = await getDocs(q);
        const appointments = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            appointments.push({
                id: doc.id,
                ...data,
                status: new Date(data.date) < new Date() ? 'منتهي' : 'قادم'
            });
        });

        // البحث إذا كان هناك مصطلح بحث
        let filteredAppointments = appointments;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredAppointments = appointments.filter(app =>
                app.full_name.toLowerCase().includes(term) ||
                app.phone.includes(term)
            );
        }

        // الترتيب حسب التاريخ
        filteredAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderAppointments(filteredAppointments);
    } catch (error) {
        console.error("Error loading appointments: ", error);
        alert('حدث خطأ أثناء تحميل الحجوزات');
    }
}

function renderAppointments(appointments) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد حجوزات</td></tr>';
        return;
    }

    appointments.forEach(app => {
        const tr = document.createElement('tr');
        if (app.status === 'منتهي') {
            tr.classList.add('expired');
        }

        tr.innerHTML = `
            <td>${app.full_name}</td>
            <td>${app.phone}</td>
            <td>${app.email || '-'}</td>
            <td>${app.service}</td>
            <td>${app.date}</td>
            <td>${app.time}</td>
            <td>${app.status}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${app.id}">حذف</button>
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${app.id}">تعديل</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // إعداد أحداث الحذف
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
                try {
                    await deleteDoc(doc(db, "appointments", btn.dataset.id));
                    loadAppointments();
                } catch (error) {
                    console.error("Error deleting appointment: ", error);
                    alert('حدث خطأ أثناء حذف الموعد');
                }
            }
        });
    });

    // إعداد أحداث التعديل (يمكن تطويرها لاحقاً)
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('ميزة التعديل قيد التطوير');
        });
    });
}