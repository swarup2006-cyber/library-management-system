import axios from "axios";

// This file acts as a mock API layer backed by localStorage so the frontend
// can be fully interactive without requiring any backend changes.
const STORAGE_KEY = "lms_mock_database_v3";
const SESSION_KEY = "lms_mock_session_v3";
const NETWORK_DELAY = 320;
const DAILY_FINE = 15;
const LOAN_WINDOW_DAYS = 14;

const http = axios.create();

const clone = (value) => JSON.parse(JSON.stringify(value));

const createId = (prefix) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

const toIso = (value) => new Date(value).toISOString();

const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysBetween = (from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
};

const apiError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

const request = (handler) =>
  http
    .request({
      method: "post",
      url: "/mock-lms",
      adapter: async (config) => {
        await new Promise((resolve) => window.setTimeout(resolve, NETWORK_DELAY));

        try {
          return {
            data: handler(config),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          };
        } catch (error) {
          return Promise.reject({
            config,
            response: {
              status: error.status || 400,
              data: { message: error.message || "Something went wrong." },
            },
          });
        }
      },
    })
    .then((response) => response.data);

const readStorage = (key) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const seedDatabase = () => {
  const categoryGeneralId = createId("category");
  const categoryFictionId = createId("category");
  const categoryScienceId = createId("category");
  const categoryHistoryId = createId("category");
  const categoryTechnologyId = createId("category");
  const categoryLiteratureId = createId("category");

  const authorHarariId = createId("author");
  const authorOrwellId = createId("author");
  const authorRowlingId = createId("author");
  const authorMayaId = createId("author");
  const authorSaganId = createId("author");
  const authorNormanId = createId("author");

  const adminId = createId("user");
  const studentAId = createId("user");
  const studentBId = createId("user");
  const studentCId = createId("user");

  const books = [
    {
      id: createId("book"),
      title: "The Design of Everyday Things",
      authorId: authorNormanId,
      categoryId: categoryTechnologyId,
      authorName: "Don Norman",
      categoryName: "Technology",
      isbn: "9780465050659",
      publisher: "Basic Books",
      year: 2013,
      shelf: "A-01",
      copiesTotal: 7,
      copiesAvailable: 4,
      pages: 368,
      language: "English",
      description:
        "A practical look at human-centered design, usability, and the tiny interface decisions that shape everyday life.",
      coverTone: "#0d6efd",
      addedAt: addDays(new Date(), -42),
    },
    {
      id: createId("book"),
      title: "Sapiens",
      authorId: authorHarariId,
      categoryId: categoryHistoryId,
      authorName: "Yuval Noah Harari",
      categoryName: "History",
      isbn: "9780062316097",
      publisher: "Harper",
      year: 2015,
      shelf: "B-13",
      copiesTotal: 6,
      copiesAvailable: 2,
      pages: 498,
      language: "English",
      description:
        "A sweeping history of humankind covering biology, culture, economics, and the modern world.",
      coverTone: "#20c997",
      addedAt: addDays(new Date(), -30),
    },
    {
      id: createId("book"),
      title: "1984",
      authorId: authorOrwellId,
      categoryId: categoryFictionId,
      authorName: "George Orwell",
      categoryName: "Fiction",
      isbn: "9780451524935",
      publisher: "Signet Classics",
      year: 1961,
      shelf: "C-02",
      copiesTotal: 9,
      copiesAvailable: 6,
      pages: 328,
      language: "English",
      description:
        "A dystopian classic about surveillance, state power, and the fragility of truth.",
      coverTone: "#dc3545",
      addedAt: addDays(new Date(), -21),
    },
    {
      id: createId("book"),
      title: "Harry Potter and the Sorcerer's Stone",
      authorId: authorRowlingId,
      categoryId: categoryLiteratureId,
      authorName: "J.K. Rowling",
      categoryName: "Literature",
      isbn: "9780590353427",
      publisher: "Scholastic",
      year: 1998,
      shelf: "D-11",
      copiesTotal: 8,
      copiesAvailable: 5,
      pages: 309,
      language: "English",
      description:
        "A widely loved fantasy entry point into a magical school and a long-running coming-of-age saga.",
      coverTone: "#6f42c1",
      addedAt: addDays(new Date(), -14),
    },
    {
      id: createId("book"),
      title: "Cosmos",
      authorId: authorSaganId,
      categoryId: categoryScienceId,
      authorName: "Carl Sagan",
      categoryName: "Science",
      isbn: "9780345539434",
      publisher: "Ballantine Books",
      year: 2013,
      shelf: "E-05",
      copiesTotal: 5,
      copiesAvailable: 1,
      pages: 432,
      language: "English",
      description:
        "An expansive, highly readable introduction to astronomy, scientific curiosity, and humanity's place in the universe.",
      coverTone: "#fd7e14",
      addedAt: addDays(new Date(), -10),
    },
    {
      id: createId("book"),
      title: "I Know Why the Caged Bird Sings",
      authorId: authorMayaId,
      categoryId: categoryLiteratureId,
      authorName: "Maya Angelou",
      categoryName: "Literature",
      isbn: "9780345514400",
      publisher: "Ballantine Books",
      year: 2009,
      shelf: "F-08",
      copiesTotal: 4,
      copiesAvailable: 4,
      pages: 304,
      language: "English",
      description:
        "Maya Angelou's memoir of resilience, voice, and self-invention.",
      coverTone: "#198754",
      addedAt: addDays(new Date(), -6),
    },
    {
      id: createId("book"),
      title: "A Brief History of Time",
      authorId: authorSaganId,
      categoryId: categoryScienceId,
      authorName: "Carl Sagan",
      categoryName: "Science",
      isbn: "9780553380163",
      publisher: "Bantam",
      year: 1998,
      shelf: "E-09",
      copiesTotal: 6,
      copiesAvailable: 3,
      pages: 212,
      language: "English",
      description:
        "A compact introduction to black holes, cosmology, and how physicists think about time.",
      coverTone: "#6610f2",
      addedAt: addDays(new Date(), -3),
    },
  ];

  const users = [
    {
      id: adminId,
      name: "Riya Sharma",
      email: "admin@library.local",
      password: "Admin@123",
      role: "admin",
      verified: true,
      blocked: false,
      phone: "+91 98765 43210",
      address: "Central Library Office",
      department: "Library Administration",
      studentId: "",
      joinedAt: addDays(new Date(), -180),
      bio: "Head librarian managing circulation, stock, and reporting.",
    },
    {
      id: studentAId,
      name: "Aman Verma",
      email: "student@library.local",
      password: "Student@123",
      role: "student",
      verified: true,
      blocked: false,
      phone: "+91 90000 11111",
      address: "Hostel Block A",
      department: "Computer Science",
      studentId: "STU-1001",
      joinedAt: addDays(new Date(), -120),
      bio: "Prefers design, fiction, and systems-thinking books.",
    },
    {
      id: studentBId,
      name: "Meera Iyer",
      email: "meera@library.local",
      password: "Student@123",
      role: "student",
      verified: true,
      blocked: false,
      phone: "+91 98888 22222",
      address: "Hostel Block B",
      department: "Physics",
      studentId: "STU-1002",
      joinedAt: addDays(new Date(), -90),
      bio: "Interested in astronomy, biographies, and long reads.",
    },
    {
      id: studentCId,
      name: "Karan Patel",
      email: "karan@library.local",
      password: "Student@123",
      role: "student",
      verified: true,
      blocked: false,
      phone: "+91 97777 33333",
      address: "City Campus",
      department: "History",
      studentId: "STU-1003",
      joinedAt: addDays(new Date(), -65),
      bio: "Mostly checks out history and policy titles.",
    },
  ];

  const loans = [
    {
      id: createId("loan"),
      bookId: books[0].id,
      studentId: studentAId,
      issuedBy: adminId,
      issuedAt: addDays(new Date(), -7),
      dueAt: addDays(new Date(), 7),
      returnedAt: "",
    },
    {
      id: createId("loan"),
      bookId: books[1].id,
      studentId: studentAId,
      issuedBy: adminId,
      issuedAt: addDays(new Date(), -18),
      dueAt: addDays(new Date(), -4),
      returnedAt: "",
    },
    {
      id: createId("loan"),
      bookId: books[4].id,
      studentId: studentBId,
      issuedBy: adminId,
      issuedAt: addDays(new Date(), -11),
      dueAt: addDays(new Date(), 3),
      returnedAt: "",
    },
    {
      id: createId("loan"),
      bookId: books[2].id,
      studentId: studentAId,
      issuedBy: adminId,
      issuedAt: addDays(new Date(), -28),
      dueAt: addDays(new Date(), -14),
      returnedAt: addDays(new Date(), -12),
    },
  ];

  const categories = [
    {
      id: categoryGeneralId,
      name: "General",
      description: "Reference and mixed collection",
    },
    {
      id: categoryFictionId,
      name: "Fiction",
      description: "Stories, novels, and narrative literature",
    },
    {
      id: categoryScienceId,
      name: "Science",
      description: "Physics, astronomy, and scientific thinking",
    },
    {
      id: categoryHistoryId,
      name: "History",
      description: "Civilizations, societies, and world history",
    },
    {
      id: categoryTechnologyId,
      name: "Technology",
      description: "Design, computing, and product thinking",
    },
    {
      id: categoryLiteratureId,
      name: "Literature",
      description: "Essays, memoirs, and classic works",
    },
  ];

  const authors = [
    {
      id: authorNormanId,
      name: "Don Norman",
      country: "United States",
      description: "Author and design thinker focused on usability.",
    },
    {
      id: authorHarariId,
      name: "Yuval Noah Harari",
      country: "Israel",
      description: "Historian and popular non-fiction writer.",
    },
    {
      id: authorOrwellId,
      name: "George Orwell",
      country: "United Kingdom",
      description: "Essayist and novelist known for political fiction.",
    },
    {
      id: authorRowlingId,
      name: "J.K. Rowling",
      country: "United Kingdom",
      description: "Author of the Harry Potter series.",
    },
    {
      id: authorSaganId,
      name: "Carl Sagan",
      country: "United States",
      description: "Astronomer and science communicator.",
    },
    {
      id: authorMayaId,
      name: "Maya Angelou",
      country: "United States",
      description: "Poet, memoirist, and civil rights activist.",
    },
  ];

  const notifications = [
    {
      id: createId("note"),
      userId: studentAId,
      title: "Book due soon",
      message: "The Design of Everyday Things is due in 7 days.",
      type: "warning",
      read: false,
      createdAt: addDays(new Date(), -1),
    },
    {
      id: createId("note"),
      userId: studentAId,
      title: "Overdue fine running",
      message: "Sapiens is overdue. Return it soon to stop the fine from increasing.",
      type: "danger",
      read: false,
      createdAt: addDays(new Date(), -1),
    },
    {
      id: createId("note"),
      userId: studentBId,
      title: "Reminder",
      message: "Cosmos is due in 3 days.",
      type: "warning",
      read: true,
      createdAt: addDays(new Date(), -2),
    },
    {
      id: createId("note"),
      userId: adminId,
      title: "Overdue attention",
      message: "One student account has overdue books and accumulating fines.",
      type: "danger",
      read: false,
      createdAt: addDays(new Date(), -1),
    },
  ];

  return { users, books, categories, authors, loans, notifications };
};

const getDatabase = () => {
  const current = readStorage(STORAGE_KEY);

  if (current) {
    return current;
  }

  const seeded = seedDatabase();
  writeStorage(STORAGE_KEY, seeded);
  return seeded;
};

const saveDatabase = (db) => {
  writeStorage(STORAGE_KEY, db);
  return db;
};

const getSession = () => readStorage(SESSION_KEY);

const setSession = (session) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  writeStorage(SESSION_KEY, session);
};

const getLoanMeta = (loan) => {
  const today = startOfToday();
  const dueDate = loan.dueAt ? new Date(loan.dueAt) : null;
  const returnedDate = loan.returnedAt ? new Date(loan.returnedAt) : null;
  const compareDate = returnedDate || today;
  const overdueDays = dueDate ? Math.max(0, daysBetween(dueDate, compareDate)) : 0;
  const fineAmount = overdueDays * DAILY_FINE;
  const daysRemaining = dueDate ? daysBetween(today, dueDate) : 0;

  let status = "Returned";

  if (!returnedDate) {
    status = overdueDays > 0 ? "Overdue" : "Issued";
  }

  return {
    status,
    overdueDays,
    fineAmount,
    daysRemaining,
  };
};

const getBookById = (db, id) => db.books.find((book) => book.id === id);
const getUserById = (db, id) => db.users.find((user) => user.id === id);

const enrichLoan = (db, loan) => {
  const book = getBookById(db, loan.bookId);
  const student = getUserById(db, loan.studentId);
  return {
    ...clone(loan),
    ...getLoanMeta(loan),
    book: book ? clone(book) : null,
    student: student ? sanitizeUser(student, db) : null,
  };
};

const sanitizeUser = (user, db = getDatabase()) => {
  const userLoans = db.loans.filter((loan) => loan.studentId === user.id);
  const activeLoans = userLoans.filter((loan) => !loan.returnedAt);
  const fineDue = userLoans.reduce(
    (sum, loan) => sum + getLoanMeta(loan).fineAmount,
    0
  );
  const unreadCount = db.notifications.filter(
    (note) => note.userId === user.id && !note.read
  ).length;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    blocked: user.blocked,
    phone: user.phone,
    address: user.address,
    department: user.department,
    studentId: user.studentId,
    joinedAt: user.joinedAt,
    bio: user.bio,
    unreadCount,
    activeLoanCount: activeLoans.length,
    fineDue,
  };
};

const ensureUser = (db, role) => {
  const session = getSession();

  if (!session?.userId) {
    apiError("Please sign in to continue.", 401);
  }

  const user = getUserById(db, session.userId);

  if (!user) {
    setSession(null);
    apiError("Session expired. Please sign in again.", 401);
  }

  if (role && user.role !== role) {
    apiError("You do not have access to this area.", 403);
  }

  return user;
};

const getCategoryUsageCount = (db, categoryId) =>
  db.books.filter((book) => book.categoryId === categoryId).length;

const getAuthorUsageCount = (db, authorId) =>
  db.books.filter((book) => book.authorId === authorId).length;

const pushNotification = (db, notification) => {
  db.notifications.unshift({
    id: createId("note"),
    read: false,
    createdAt: toIso(new Date()),
    ...notification,
  });
};

const activeLoanForBookAndStudent = (db, studentId, bookId) =>
  db.loans.find(
    (loan) => loan.studentId === studentId && loan.bookId === bookId && !loan.returnedAt
  );

const buildStudentDashboard = (db, studentId) => {
  const student = getUserById(db, studentId);
  const loans = db.loans
    .filter((loan) => loan.studentId === studentId)
    .map((loan) => enrichLoan(db, loan))
    .sort((left, right) => new Date(right.issuedAt) - new Date(left.issuedAt));

  const activeLoans = loans.filter((loan) => loan.status !== "Returned");
  const dueSoon = activeLoans.filter(
    (loan) => loan.status === "Issued" && loan.daysRemaining >= 0 && loan.daysRemaining <= 3
  );
  const overdueLoans = activeLoans.filter((loan) => loan.status === "Overdue");
  const fineDue = loans.reduce((sum, loan) => sum + loan.fineAmount, 0);
  const notifications = db.notifications
    .filter((note) => note.userId === studentId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const borrowedBookIds = new Set(activeLoans.map((loan) => loan.bookId));
  const recommendedBooks = db.books
    .filter((book) => book.copiesAvailable > 0 && !borrowedBookIds.has(book.id))
    .slice(0, 4);

  return {
    user: sanitizeUser(student, db),
    summary: {
      booksIssued: activeLoans.length,
      dueSoon: dueSoon.length,
      overdue: overdueLoans.length,
      fineDue,
      historyCount: loans.length,
    },
    activeLoans: activeLoans.slice(0, 5),
    history: loans,
    notifications: notifications.slice(0, 5),
    recommendedBooks,
  };
};

const buildAdminDashboard = (db) => {
  const students = db.users.filter((user) => user.role === "student");
  const loans = db.loans.map((loan) => enrichLoan(db, loan));
  const issuedLoans = loans.filter((loan) => loan.status === "Issued");
  const overdueLoans = loans.filter((loan) => loan.status === "Overdue");
  const returnedLoans = loans.filter((loan) => loan.status === "Returned");
  const totalFine = loans.reduce((sum, loan) => sum + loan.fineAmount, 0);

  return {
    stats: {
      totalBooks: db.books.reduce((sum, book) => sum + book.copiesTotal, 0),
      totalTitles: db.books.length,
      totalStudents: students.length,
      issuedBooks: issuedLoans.length,
      overdueBooks: overdueLoans.length,
      availableBooks: db.books.reduce((sum, book) => sum + book.copiesAvailable, 0),
      finesCollected: totalFine,
    },
    recentLoans: loans
      .sort((left, right) => new Date(right.issuedAt) - new Date(left.issuedAt))
      .slice(0, 6),
    overdueLoans: overdueLoans.slice(0, 6),
    recentStudents: students
      .sort((left, right) => new Date(right.joinedAt) - new Date(left.joinedAt))
      .slice(0, 5)
      .map((student) => sanitizeUser(student, db)),
    popularBooks: db.books
      .map((book) => ({
        ...book,
        activeBorrowCount: db.loans.filter((loan) => loan.bookId === book.id).length,
      }))
      .sort((left, right) => right.activeBorrowCount - left.activeBorrowCount)
      .slice(0, 5),
    notifications: db.notifications
      .filter((note) => note.userId === ensureUser(db, "admin").id)
      .slice(0, 4),
    reportsPreview: {
      issuedLoans,
      overdueLoans,
      returnedLoans,
      totalFine,
    },
  };
};

const libraryService = {
  getDemoCredentials() {
    return {
      admin: {
        email: "admin@library.local",
        password: "Admin@123",
      },
      student: {
        email: "student@library.local",
        password: "Student@123",
      },
    };
  },

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  getSessionUser() {
    return request(() => {
      const db = getDatabase();
      const session = getSession();

      if (!session?.userId) {
        return { user: null };
      }

      const user = getUserById(db, session.userId);

      if (!user) {
        setSession(null);
        return { user: null };
      }

      return { user: sanitizeUser(user, db) };
    });
  },

  login({ email, password, role }) {
    return request(() => {
      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = db.users.find((item) => item.email.toLowerCase() === normalizedEmail);

      if (!user || user.password !== password) {
        apiError("Invalid email or password.", 401);
      }

      if (user.role !== role) {
        apiError(
          role === "admin"
            ? "This account belongs to a student portal."
            : "This account belongs to the admin portal.",
          403
        );
      }

      if (!user.verified) {
        apiError("Please verify your account before signing in.", 403);
      }

      if (user.blocked) {
        apiError("This account has been blocked. Contact the library desk.", 403);
      }

      setSession({ userId: user.id });

      return {
        message: `Welcome back, ${user.name}.`,
        user: sanitizeUser(user, db),
      };
    });
  },

  logout() {
    return request(() => {
      setSession(null);
      return { success: true };
    });
  },

  registerStudent(payload) {
    return request(() => {
      const db = getDatabase();
      const normalizedEmail = payload.email.trim().toLowerCase();
      const existingUser = db.users.find(
        (user) => user.email.toLowerCase() === normalizedEmail
      );

      if (existingUser && existingUser.verified) {
        apiError("A verified account already exists with this email.");
      }

      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const userRecord =
        existingUser ||
        ({
          id: createId("user"),
          role: "student",
          joinedAt: toIso(new Date()),
          blocked: false,
        });

      Object.assign(userRecord, {
        name: payload.name.trim(),
        email: normalizedEmail,
        password: payload.password,
        role: "student",
        verified: false,
        phone: payload.phone?.trim() || "",
        address: payload.address?.trim() || "",
        department: payload.department?.trim() || "",
        studentId: payload.studentId?.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        bio: "New student member waiting for verification.",
        otpCode,
        otpPurpose: "register",
      });

      if (!existingUser) {
        db.users.push(userRecord);
      }

      saveDatabase(db);

      return {
        message: "Student registration saved. Verify the account to continue.",
        email: normalizedEmail,
        otpCode,
      };
    });
  },

  verifyOtp({ email, otp, mode = "register", password = "" }) {
    return request(() => {
      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = db.users.find((item) => item.email.toLowerCase() === normalizedEmail);

      if (!user) {
        apiError("No account was found for this email.", 404);
      }

      if (user.otpCode !== otp.trim() || user.otpPurpose !== mode) {
        apiError("The OTP you entered is invalid.");
      }

      if (mode === "register") {
        user.verified = true;
      }

      if (mode === "reset") {
        user.password = password;
      }

      user.otpCode = "";
      user.otpPurpose = "";

      saveDatabase(db);

      return {
        message:
          mode === "register"
            ? "Account verified successfully. You can sign in now."
            : "Password reset complete. Sign in with your new password.",
      };
    });
  },

  requestPasswordReset({ email, role }) {
    return request(() => {
      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = db.users.find((item) => item.email.toLowerCase() === normalizedEmail);

      if (!user || user.role !== role) {
        apiError("No matching account was found for this portal.", 404);
      }

      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      user.otpCode = otpCode;
      user.otpPurpose = "reset";
      saveDatabase(db);

      return {
        message: "Reset OTP generated. Use it on the verification screen.",
        email: normalizedEmail,
        otpCode,
      };
    });
  },

  updateProfile(payload) {
    return request(() => {
      const db = getDatabase();
      const user = ensureUser(db);
      const normalizedEmail = payload.email.trim().toLowerCase();
      const existingUser = db.users.find(
        (item) => item.email.toLowerCase() === normalizedEmail && item.id !== user.id
      );

      if (existingUser) {
        apiError("Another account is already using this email.");
      }

      Object.assign(user, {
        name: payload.name.trim(),
        email: normalizedEmail,
        phone: payload.phone?.trim() || "",
        address: payload.address?.trim() || "",
        department: payload.department?.trim() || "",
        bio: payload.bio?.trim() || "",
      });

      saveDatabase(db);

      return {
        message: "Profile updated successfully.",
        user: sanitizeUser(user, db),
      };
    });
  },

  changePassword({ currentPassword, newPassword }) {
    return request(() => {
      const db = getDatabase();
      const user = ensureUser(db);

      if (user.password !== currentPassword) {
        apiError("Current password is incorrect.");
      }

      user.password = newPassword;
      saveDatabase(db);

      return { message: "Password changed successfully." };
    });
  },

  getStudentDashboard() {
    return request(() => {
      const db = getDatabase();
      const student = ensureUser(db, "student");
      return buildStudentDashboard(db, student.id);
    });
  },

  getAdminDashboard() {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");
      return buildAdminDashboard(db);
    });
  },

  getBooks() {
    return request(() => {
      const db = getDatabase();
      return {
        books: clone(db.books).sort((left, right) => left.title.localeCompare(right.title)),
      };
    });
  },

  getBookDetails(bookId) {
    return request(() => {
      const db = getDatabase();
      const book = getBookById(db, bookId);

      if (!book) {
        apiError("Book not found.", 404);
      }

      const history = db.loans
        .filter((loan) => loan.bookId === bookId)
        .map((loan) => enrichLoan(db, loan))
        .sort((left, right) => new Date(right.issuedAt) - new Date(left.issuedAt));

      return {
        book: clone(book),
        history,
      };
    });
  },

  getStudentHistory() {
    return request(() => {
      const db = getDatabase();
      const student = ensureUser(db, "student");
      return {
        loans: db.loans
          .filter((loan) => loan.studentId === student.id)
          .map((loan) => enrichLoan(db, loan))
          .sort((left, right) => new Date(right.issuedAt) - new Date(left.issuedAt)),
      };
    });
  },

  getNotifications() {
    return request(() => {
      const db = getDatabase();
      const user = ensureUser(db);

      return {
        notifications: db.notifications
          .filter((note) => note.userId === user.id)
          .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
      };
    });
  },

  markNotificationRead(notificationId) {
    return request(() => {
      const db = getDatabase();
      const user = ensureUser(db);
      const notification = db.notifications.find(
        (note) => note.id === notificationId && note.userId === user.id
      );

      if (!notification) {
        apiError("Notification not found.", 404);
      }

      notification.read = true;
      saveDatabase(db);

      return {
        message: "Notification marked as read.",
        user: sanitizeUser(user, db),
      };
    });
  },

  borrowBook(bookId) {
    return request(() => {
      const db = getDatabase();
      const student = ensureUser(db, "student");
      const book = getBookById(db, bookId);

      if (!book) {
        apiError("Book not found.", 404);
      }

      if (book.copiesAvailable <= 0) {
        apiError("This title is currently unavailable.");
      }

      if (activeLoanForBookAndStudent(db, student.id, book.id)) {
        apiError("You already have this title issued.");
      }

      book.copiesAvailable -= 1;

      const loan = {
        id: createId("loan"),
        bookId: book.id,
        studentId: student.id,
        issuedBy: student.id,
        issuedAt: toIso(new Date()),
        dueAt: addDays(new Date(), LOAN_WINDOW_DAYS),
        returnedAt: "",
      };

      db.loans.unshift(loan);
      pushNotification(db, {
        userId: student.id,
        title: "Book issued",
        message: `${book.title} has been issued to your account.`,
        type: "success",
      });

      saveDatabase(db);

      return {
        message: `${book.title} issued successfully.`,
        user: sanitizeUser(student, db),
      };
    });
  },

  returnBook(loanId) {
    return request(() => {
      const db = getDatabase();
      const user = ensureUser(db);
      const loan = db.loans.find((item) => item.id === loanId);

      if (!loan) {
        apiError("Loan record not found.", 404);
      }

      if (user.role === "student" && loan.studentId !== user.id) {
        apiError("You cannot return another student's book.", 403);
      }

      if (loan.returnedAt) {
        apiError("This loan has already been returned.");
      }

      loan.returnedAt = toIso(new Date());
      const book = getBookById(db, loan.bookId);

      if (book) {
        book.copiesAvailable = Math.min(book.copiesAvailable + 1, book.copiesTotal);
      }

      const loanMeta = getLoanMeta(loan);
      pushNotification(db, {
        userId: loan.studentId,
        title: "Book returned",
        message: loanMeta.fineAmount
          ? `Book returned. Pending fine: Rs ${loanMeta.fineAmount}.`
          : "Book returned successfully.",
        type: loanMeta.fineAmount ? "warning" : "success",
      });

      saveDatabase(db);

      return {
        message: loanMeta.fineAmount
          ? `Book returned. Fine due: Rs ${loanMeta.fineAmount}.`
          : "Book returned successfully.",
        user: sanitizeUser(user, db),
      };
    });
  },

  getStudents() {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");

      return {
        students: db.users
          .filter((user) => user.role === "student")
          .map((student) => sanitizeUser(student, db))
          .sort((left, right) => left.name.localeCompare(right.name)),
      };
    });
  },

  deleteStudent(studentId) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");
      const student = getUserById(db, studentId);

      if (!student || student.role !== "student") {
        apiError("Student not found.", 404);
      }

      const hasActiveLoan = db.loans.some(
        (loan) => loan.studentId === studentId && !loan.returnedAt
      );

      if (hasActiveLoan) {
        apiError("This student still has issued books. Return them first.");
      }

      db.users = db.users.filter((user) => user.id !== studentId);
      db.notifications = db.notifications.filter((note) => note.userId !== studentId);
      saveDatabase(db);

      return { message: "Student deleted successfully." };
    });
  },

  getTaxonomy() {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");

      return {
        categories: db.categories
          .map((category) => ({
            ...category,
            bookCount: getCategoryUsageCount(db, category.id),
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        authors: db.authors
          .map((author) => ({
            ...author,
            bookCount: getAuthorUsageCount(db, author.id),
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
      };
    });
  },

  saveCategory(payload) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");
      const name = payload.name.trim();

      if (!name) {
        apiError("Category name is required.");
      }

      const duplicate = db.categories.find(
        (category) =>
          category.name.toLowerCase() === name.toLowerCase() && category.id !== payload.id
      );

      if (duplicate) {
        apiError("A category with this name already exists.");
      }

      if (payload.id) {
        const category = db.categories.find((item) => item.id === payload.id);

        if (!category) {
          apiError("Category not found.", 404);
        }

        category.name = name;
        category.description = payload.description?.trim() || "";

        db.books = db.books.map((book) =>
          book.categoryId === category.id
            ? { ...book, categoryName: category.name }
            : book
        );
      } else {
        db.categories.push({
          id: createId("category"),
          name,
          description: payload.description?.trim() || "",
        });
      }

      saveDatabase(db);

      return { message: payload.id ? "Category updated." : "Category added." };
    });
  },

  deleteCategory(categoryId) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");

      if (getCategoryUsageCount(db, categoryId) > 0) {
        apiError("Reassign or remove books in this category before deleting it.");
      }

      db.categories = db.categories.filter((category) => category.id !== categoryId);
      saveDatabase(db);

      return { message: "Category deleted." };
    });
  },

  saveAuthor(payload) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");
      const name = payload.name.trim();

      if (!name) {
        apiError("Author name is required.");
      }

      const duplicate = db.authors.find(
        (author) =>
          author.name.toLowerCase() === name.toLowerCase() && author.id !== payload.id
      );

      if (duplicate) {
        apiError("An author with this name already exists.");
      }

      if (payload.id) {
        const author = db.authors.find((item) => item.id === payload.id);

        if (!author) {
          apiError("Author not found.", 404);
        }

        author.name = name;
        author.country = payload.country?.trim() || "";
        author.description = payload.description?.trim() || "";

        db.books = db.books.map((book) =>
          book.authorId === author.id ? { ...book, authorName: author.name } : book
        );
      } else {
        db.authors.push({
          id: createId("author"),
          name,
          country: payload.country?.trim() || "",
          description: payload.description?.trim() || "",
        });
      }

      saveDatabase(db);

      return { message: payload.id ? "Author updated." : "Author added." };
    });
  },

  deleteAuthor(authorId) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");

      if (getAuthorUsageCount(db, authorId) > 0) {
        apiError("Move books away from this author before deleting it.");
      }

      db.authors = db.authors.filter((author) => author.id !== authorId);
      saveDatabase(db);

      return { message: "Author deleted." };
    });
  },

  saveBook(payload) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");
      const category = db.categories.find((item) => item.id === payload.categoryId);
      const author = db.authors.find((item) => item.id === payload.authorId);

      if (!payload.title.trim()) {
        apiError("Book title is required.");
      }

      if (!category || !author) {
        apiError("Please choose a valid category and author.");
      }

      const copiesTotal = Math.max(1, Number(payload.copiesTotal) || 1);
      const copiesAvailable = Math.min(
        copiesTotal,
        Math.max(0, Number(payload.copiesAvailable) || 0)
      );

      if (payload.id) {
        const book = db.books.find((item) => item.id === payload.id);

        if (!book) {
          apiError("Book not found.", 404);
        }

        Object.assign(book, {
          title: payload.title.trim(),
          authorId: author.id,
          authorName: author.name,
          categoryId: category.id,
          categoryName: category.name,
          isbn: payload.isbn.trim(),
          publisher: payload.publisher.trim(),
          year: Number(payload.year) || new Date().getFullYear(),
          shelf: payload.shelf.trim(),
          copiesTotal,
          copiesAvailable,
          pages: Number(payload.pages) || 0,
          language: payload.language.trim() || "English",
          description: payload.description.trim(),
          coverTone: payload.coverTone || "#0d6efd",
        });
      } else {
        db.books.unshift({
          id: createId("book"),
          title: payload.title.trim(),
          authorId: author.id,
          authorName: author.name,
          categoryId: category.id,
          categoryName: category.name,
          isbn: payload.isbn.trim(),
          publisher: payload.publisher.trim(),
          year: Number(payload.year) || new Date().getFullYear(),
          shelf: payload.shelf.trim(),
          copiesTotal,
          copiesAvailable: copiesAvailable || copiesTotal,
          pages: Number(payload.pages) || 0,
          language: payload.language.trim() || "English",
          description: payload.description.trim(),
          coverTone: payload.coverTone || "#0d6efd",
          addedAt: toIso(new Date()),
        });
      }

      saveDatabase(db);

      return {
        message: payload.id ? "Book updated successfully." : "Book added successfully.",
      };
    });
  },

  deleteBook(bookId) {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");

      const activeLoan = db.loans.find((loan) => loan.bookId === bookId && !loan.returnedAt);

      if (activeLoan) {
        apiError("This title is currently issued. Return all copies before deleting it.");
      }

      db.books = db.books.filter((book) => book.id !== bookId);
      db.loans = db.loans.filter((loan) => loan.bookId !== bookId);
      saveDatabase(db);

      return { message: "Book deleted successfully." };
    });
  },

  getCirculationData() {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");

      return {
        students: db.users
          .filter((user) => user.role === "student")
          .map((student) => sanitizeUser(student, db)),
        books: clone(db.books),
        loans: db.loans
          .map((loan) => enrichLoan(db, loan))
          .sort((left, right) => new Date(right.issuedAt) - new Date(left.issuedAt)),
      };
    });
  },

  issueBookAsAdmin({ studentId, bookId }) {
    return request(() => {
      const db = getDatabase();
      const admin = ensureUser(db, "admin");
      const student = getUserById(db, studentId);
      const book = getBookById(db, bookId);

      if (!student || student.role !== "student") {
        apiError("Student not found.", 404);
      }

      if (!book) {
        apiError("Book not found.", 404);
      }

      if (book.copiesAvailable <= 0) {
        apiError("No available copies left for this book.");
      }

      if (activeLoanForBookAndStudent(db, studentId, bookId)) {
        apiError("This student already has the selected book.");
      }

      book.copiesAvailable -= 1;

      db.loans.unshift({
        id: createId("loan"),
        bookId,
        studentId,
        issuedBy: admin.id,
        issuedAt: toIso(new Date()),
        dueAt: addDays(new Date(), LOAN_WINDOW_DAYS),
        returnedAt: "",
      });

      pushNotification(db, {
        userId: student.id,
        title: "Book issued by admin",
        message: `${book.title} has been issued to your account by the library desk.`,
        type: "info",
      });

      saveDatabase(db);

      return { message: "Book issued to student successfully." };
    });
  },

  getReports() {
    return request(() => {
      const db = getDatabase();
      ensureUser(db, "admin");
      const loans = db.loans
        .map((loan) => enrichLoan(db, loan))
        .sort((left, right) => new Date(right.issuedAt) - new Date(left.issuedAt));
      const issuedLoans = loans.filter((loan) => loan.status === "Issued");
      const overdueLoans = loans.filter((loan) => loan.status === "Overdue");
      const returnedLoans = loans.filter((loan) => loan.status === "Returned");

      return {
        summary: {
          activeIssues: issuedLoans.length,
          overdueCount: overdueLoans.length,
          returnedCount: returnedLoans.length,
          totalFine: loans.reduce((sum, loan) => sum + loan.fineAmount, 0),
        },
        issuedLoans,
        overdueLoans,
        fines: loans.filter((loan) => loan.fineAmount > 0),
      };
    });
  },
};

export default libraryService;
