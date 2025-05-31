// assets/js/main.js
import { auth, onAuthStateChanged } from '../firebase/firebase-config.js';

// إدارة حالة المستخدم والتحقق من تسجيل الدخول
onAuthStateChanged(auth, (user) => {
    const adminBtn = document.querySelector('.admin-btn');
    if (user) {
        // المستخدم مسجل الدخول
        if (adminBtn) adminBtn.style.display = 'block';
    } else {
        // المستخدم غير مسجل الدخول
        if (adminBtn) adminBtn.style.display = 'none';
    }
});

// دوال إدارة الواجهة
function showSection(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.style.display = 'block';

        if (id === 'homeSection') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const sectionPosition = targetSection.offsetTop - navbarHeight;
            window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
        }
    }

    // تحديث حالة العنصر النشط في القائمة
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    if (id === 'homeSection') {
        const firstNavLink = document.querySelector('.nav-link');
        if (firstNavLink) firstNavLink.classList.add('active');
    }
}

// اختيار خدمة من القائمة
function selectService(service) {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.value = service;
        window.location.href = 'booking.html';
    }
}

// تأثير التمرير لشريط التنقل
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// تهيئة التقويم
document.addEventListener('DOMContentLoaded', function () {
    // تهيئة التقويم إذا كان موجودًا في الصفحة
    if (typeof $.fn.datepicker !== 'undefined' && document.getElementById('date')) {
        $("#date").datepicker({
            dateFormat: "yy-mm-dd",
            minDate: 0,
            beforeShowDay: function (date) {
                const day = date.getDay();
                return [(day !== 5 && day !== 6), ''];
            },
            onSelect: function (selectedDate) {
                // عند اختيار تاريخ، جلب الأوقات المحجوزة
                fetchBookedTimes(selectedDate);
            }
        });
    }

    // إظهار القسم الحالي عند التحميل
    const hash = window.location.hash.substr(1);
    if (hash) {
        showSection(hash);
    } else if (document.getElementById('homeSection')) {
        showSection('homeSection');
    }
});

// دالة لجلب الأوقات المحجوزة

async function fetchBookedTimes(date) {
    try {
        const { db, collection, query, where, getDocs } = await import('../firebase/firebase-config.js');
        const q = query(collection(db, "appointments"), where("date", "==", date));
        const querySnapshot = await getDocs(q);

        const timeSelect = document.getElementById('time');
        if (!timeSelect) return;

        // تمكين جميع الأوقات أولاً
        Array.from(timeSelect.options).forEach(option => {
            option.disabled = false;
        });

        // تعطيل الأوقات المحجوزة
        querySnapshot.forEach(doc => {
            const time = doc.data().time;
            const option = timeSelect.querySelector(`option[value="${time}"]`);
            if (option) option.disabled = true;
        });

        // إظهار تحذير إذا كان الوقت المختار غير متاح
        if (timeSelect.options[timeSelect.selectedIndex]?.disabled) {
            timeSelect.value = '';
            showTimeWarning('الوقت المحدد غير متاح، يرجى اختيار وقت آخر');
        }
    } catch (error) {
        console.error('Error fetching booked times:', error);
        showTimeWarning('تعذر التحقق من الأوقات المتاحة');
    }
}

// دالة لعرض تحذير الوقت
function showTimeWarning(message) {
    const timeInput = document.getElementById('time');
    if (!timeInput) return;

    let warningDiv = document.getElementById('time-warning');
    if (!warningDiv) {
        warningDiv = document.createElement('div');
        warningDiv.id = 'time-warning';
        warningDiv.className = 'text-danger small mt-1';
        timeInput.parentNode.insertBefore(warningDiv, timeInput.nextSibling);
    }
    warningDiv.textContent = message;
}

// وظيفة للتمرير إلى قسم قبل وبعد
function scrollToBeforeAfter() {
    const beforeAfterSection = document.getElementById('beforeAfterSection');
    if (beforeAfterSection) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const sectionPosition = beforeAfterSection.offsetTop - navbarHeight;
        window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
    }
}

// جعل الدوال متاحة عالميًا للاستدعاء من HTML
window.showSection = showSection;
window.selectService = selectService;
window.scrollToBeforeAfter = scrollToBeforeAfter;

// تهيئة تأثير السلايدر لصور قبل وبعد
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll(".before-after").forEach(sliderContainer => {
        const slider = sliderContainer.querySelector(".slider");
        const afterImage = sliderContainer.querySelector(".after-image");

        if (!slider || !afterImage) return;

        let isDragging = false;

        // للأجهزة التي تعمل باللمس
        slider.addEventListener("touchstart", startDrag);
        slider.addEventListener("touchmove", drag);
        document.addEventListener("touchend", endDrag);

        // للأجهزة التي تعمل بالفأرة
        slider.addEventListener("mousedown", startDrag);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            let xPos;
            if (e.type === 'touchmove') {
                xPos = e.touches[0].clientX;
            } else {
                xPos = e.clientX;
            }

            const containerRect = sliderContainer.getBoundingClientRect();
            let newPosition = ((xPos - containerRect.left) / containerRect.width) * 100;

            // تحديد الحدود (بين 0 و 100)
            newPosition = Math.max(0, Math.min(newPosition, 100));

            // تحديث عرض الصورة بعد وموقع السلايدر
            afterImage.style.clipPath = `inset(0 ${100 - newPosition}% 0 0)`;
            slider.style.left = `${newPosition}%`;
        }

        function endDrag() {
            isDragging = false;
        }
    });
});