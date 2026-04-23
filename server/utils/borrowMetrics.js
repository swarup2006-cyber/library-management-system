const DAILY_FINE = 5;

const getWholeDayDiff = (startDate, endDate) => {
  const diff =
    new Date(endDate).setHours(0, 0, 0, 0) - new Date(startDate).setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

exports.serializeBorrowRecord = (record) => {
  const now = new Date();
  const dueDate = record.dueDate ? new Date(record.dueDate) : null;
  const returnRequestedAt = record.returnRequestedAt ? new Date(record.returnRequestedAt) : null;
  const returnDate = record.returnDate ? new Date(record.returnDate) : null;
  const comparisonDate = returnRequestedAt || returnDate || now;
  const overdueDays = dueDate ? getWholeDayDiff(dueDate, comparisonDate) : 0;
  const fineAmount = overdueDays * DAILY_FINE;

  let status = "Returned";

  if (returnDate) {
    status = "Returned";
  } else if (returnRequestedAt) {
    status = "Return Requested";
  } else {
    status = overdueDays > 0 ? "Overdue" : "Borrowed";
  }

  return {
    ...record.toObject(),
    status,
    overdueDays,
    fineAmount,
  };
};

exports.BORROW_WINDOW_DAYS = 14;
exports.DAILY_FINE = DAILY_FINE;
