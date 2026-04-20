const DAILY_FINE = 5;

const getWholeDayDiff = (startDate, endDate) => {
  const diff = new Date(endDate).setHours(0, 0, 0, 0) - new Date(startDate).setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

exports.serializeBorrowRecord = (record) => {
  const now = new Date();
  const dueDate = record.dueDate ? new Date(record.dueDate) : null;
  const returnDate = record.returnDate ? new Date(record.returnDate) : null;
  const isReturned = Boolean(returnDate);
  const comparisonDate = isReturned ? returnDate : now;
  const overdueDays = dueDate ? getWholeDayDiff(dueDate, comparisonDate) : 0;
  const fineAmount = overdueDays * DAILY_FINE;

  return {
    ...record.toObject(),
    status: isReturned ? "Returned" : overdueDays > 0 ? "Overdue" : "Borrowed",
    overdueDays,
    fineAmount,
  };
};

exports.BORROW_WINDOW_DAYS = 14;
exports.DAILY_FINE = DAILY_FINE;
