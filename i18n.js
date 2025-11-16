import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      "appName": "Najm Althuraya",
      "loading": "Loading...",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close",
      "search": "Search",
      "filter": "Filter",
      "actions": "Actions",
      "yes": "Yes",
      "no": "No",
      "confirm": "Confirm",
      
      // Auth
      "login": "Login",
      "logout": "Logout",
      "email": "Email",
      "password": "Password",
      "loginButton": "Sign In",
      "welcome": "Welcome",
      "loginSubtitle": "Enter your credentials to access the system",
      
      // Navigation
      "dashboard": "Dashboard",
      "transactions": "Transactions",
      "users": "Users",
      "settings": "Settings",
      "handovers": "Handovers",
      
      // Dashboard
      "totalTransactions": "Total Transactions",
      "pendingTransactions": "Pending",
      "inProgress": "In Progress",
      "completedTransactions": "Completed",
      "recentTransactions": "Recent Transactions",
      "quickStats": "Quick Statistics",
      
      // Transactions
      "newTransaction": "New Transaction",
      "transactionNumber": "Transaction Number",
      "serviceType": "Service Type",
      "transactionType": "Transaction Type",
      "clientName": "Client Name",
      "passportId": "Passport/ID",
      "mobileNumber": "Mobile Number",
      "status": "Status",
      "receiveDate": "Receive Date",
      "expectedDelivery": "Expected Delivery",
      "notes": "Notes",
      "assignedTo": "Assigned To",
      "createdBy": "Created By",
      "createdAt": "Created At",
      "viewDetails": "View Details",
      "editTransaction": "Edit Transaction",
      "deleteTransaction": "Delete Transaction",
      "transactionDetails": "Transaction Details",
      "transactionHistory": "Transaction History",
      
      // Transaction Types
      "new": "New",
      "renewal": "Renewal",
      "update": "Update",
      "cancellation": "Cancellation",
      
      // Status
      "pending": "Pending",
      "in_progress": "In Progress",
      "ready": "Ready for Delivery",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      
      // Users
      "userManagement": "User Management",
      "addUser": "Add User",
      "fullName": "Full Name",
      "phone": "Phone",
      "role": "Role",
      "active": "Active",
      "inactive": "Inactive",
      "lastLogin": "Last Login",
      "resetPassword": "Reset Password",
      
      // Roles
      "admin": "Admin",
      "supervisor": "Supervisor",
      "employee": "Employee",
      
      // Handovers
      "shiftHandover": "Shift Handover",
      "createHandover": "Create Handover",
      "fromEmployee": "From Employee",
      "toEmployee": "To Employee",
      "selectTransactions": "Select Transactions",
      "handoverNotes": "Handover Notes",
      "pendingHandovers": "Pending Handovers",
      "acceptHandover": "Accept Handover",
      
      // Settings
      "systemSettings": "System Settings",
      "appSettings": "App Settings",
      "appNameLabel": "Application Name",
      "primaryColor": "Primary Color",
      "secondaryColor": "Secondary Color",
      "defaultLanguage": "Default Language",
      "updateSettings": "Update Settings",
      
      // Messages
      "loginSuccess": "Login successful",
      "loginError": "Invalid email or password",
      "createSuccess": "Created successfully",
      "updateSuccess": "Updated successfully",
      "deleteSuccess": "Deleted successfully",
      "deleteConfirm": "Are you sure you want to delete this?",
      "error": "An error occurred",
      "noData": "No data available",
      "noResults": "No results found",
      
      // Validation
      "required": "This field is required",
      "invalidEmail": "Invalid email address",
      "passwordMinLength": "Password must be at least 6 characters",
      
      // Language
      "language": "Language",
      "english": "English",
      "arabic": "العربية"
    }
  },
  ar: {
    translation: {
      // Common
      "appName": "نجم الثريا",
      "loading": "جاري التحميل...",
      "save": "حفظ",
      "cancel": "إلغاء",
      "delete": "حذف",
      "edit": "تعديل",
      "close": "إغلاق",
      "search": "بحث",
      "filter": "تصفية",
      "actions": "الإجراءات",
      "yes": "نعم",
      "no": "لا",
      "confirm": "تأكيد",
      
      // Auth
      "login": "تسجيل الدخول",
      "logout": "تسجيل الخروج",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "loginButton": "دخول",
      "welcome": "مرحباً",
      "loginSubtitle": "أدخل بيانات الدخول للوصول إلى النظام",
      
      // Navigation
      "dashboard": "لوحة التحكم",
      "transactions": "المعاملات",
      "users": "المستخدمين",
      "settings": "الإعدادات",
      "handovers": "التسليمات",
      
      // Dashboard
      "totalTransactions": "إجمالي المعاملات",
      "pendingTransactions": "معلقة",
      "inProgress": "قيد التنفيذ",
      "completedTransactions": "مكتملة",
      "recentTransactions": "المعاملات الأخيرة",
      "quickStats": "إحصائيات سريعة",
      
      // Transactions
      "newTransaction": "معاملة جديدة",
      "transactionNumber": "رقم المعاملة",
      "serviceType": "نوع الخدمة",
      "transactionType": "نوع المعاملة",
      "clientName": "اسم العميل",
      "passportId": "رقم الجواز/الهوية",
      "mobileNumber": "رقم الجوال",
      "status": "الحالة",
      "receiveDate": "تاريخ الاستلام",
      "expectedDelivery": "التسليم المتوقع",
      "notes": "ملاحظات",
      "assignedTo": "مسند إلى",
      "createdBy": "أنشئ بواسطة",
      "createdAt": "تاريخ الإنشاء",
      "viewDetails": "عرض التفاصيل",
      "editTransaction": "تعديل المعاملة",
      "deleteTransaction": "حذف المعاملة",
      "transactionDetails": "تفاصيل المعاملة",
      "transactionHistory": "سجل المعاملة",
      
      // Transaction Types
      "new": "جديد",
      "renewal": "تجديد",
      "update": "تحديث",
      "cancellation": "إلغاء",
      
      // Status
      "pending": "معلق",
      "in_progress": "قيد التنفيذ",
      "ready": "جاهز للتسليم",
      "delivered": "تم التسليم",
      "cancelled": "ملغي",
      
      // Users
      "userManagement": "إدارة المستخدمين",
      "addUser": "إضافة مستخدم",
      "fullName": "الاسم الكامل",
      "phone": "الهاتف",
      "role": "الدور",
      "active": "نشط",
      "inactive": "غير نشط",
      "lastLogin": "آخر دخول",
      "resetPassword": "إعادة تعيين كلمة المرور",
      
      // Roles
      "admin": "مسؤول",
      "supervisor": "مشرف",
      "employee": "موظف",
      
      // Handovers
      "shiftHandover": "تسليم الوردية",
      "createHandover": "إنشاء تسليم",
      "fromEmployee": "من الموظف",
      "toEmployee": "إلى الموظف",
      "selectTransactions": "اختر المعاملات",
      "handoverNotes": "ملاحظات التسليم",
      "pendingHandovers": "التسليمات المعلقة",
      "acceptHandover": "قبول التسليم",
      
      // Settings
      "systemSettings": "إعدادات النظام",
      "appSettings": "إعدادات التطبيق",
      "appNameLabel": "اسم التطبيق",
      "primaryColor": "اللون الأساسي",
      "secondaryColor": "اللون الثانوي",
      "defaultLanguage": "اللغة الافتراضية",
      "updateSettings": "تحديث الإعدادات",
      
      // Messages
      "loginSuccess": "تم تسجيل الدخول بنجاح",
      "loginError": "بريد إلكتروني أو كلمة مرور غير صحيحة",
      "createSuccess": "تم الإنشاء بنجاح",
      "updateSuccess": "تم التحديث بنجاح",
      "deleteSuccess": "تم الحذف بنجاح",
      "deleteConfirm": "هل أنت متأكد من رغبتك في الحذف؟",
      "error": "حدث خطأ",
      "noData": "لا توجد بيانات",
      "noResults": "لا توجد نتائج",
      
      // Validation
      "required": "هذا الحقل مطلوب",
      "invalidEmail": "عنوان بريد إلكتروني غير صحيح",
      "passwordMinLength": "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      
      // Language
      "language": "اللغة",
      "english": "English",
      "arabic": "العربية"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
