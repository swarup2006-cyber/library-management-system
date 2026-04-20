import { useEffect, useState } from "react";
import API from "../services/api";

export default function Borrow() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyBorrowId, setBusyBorrowId] = useState("");

  const loadBorrowedBooks = async () => {
    try {
      setError("");
      const response = await API.get("/borrowed");
      setData(response.data || []);
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
          "Unable to load borrowed books. Log in first if needed."
      );
    }
  };

  useEffect(() => {
    loadBorrowedBooks();
  }, []);

  const returnBook = async (borrowId) => {
    try {
      setBusyBorrowId(borrowId);
      setMessage("");
      await API.put(`/borrow/${borrowId}`);
      setMessage("Book returned successfully.");
      await loadBorrowedBooks();
    } catch (returnError) {
      setError(
        returnError.response?.data?.message || "Unable to return this book."
      );
    } finally {
      setBusyBorrowId("");
    }
  };

  const activeLoans = data.filter((item) => item.status === "Borrowed").length;
  const returnedLoans = data.filter((item) => item.status === "Returned").length;
  const overdueLoans = data.filter((item) => item.status === "Overdue").length;
  const totalFine = data.reduce((sum, item) => sum + (item.fineAmount || 0), 0);
  const dueSoon = data.filter((item) => {
    if (item.status !== "Borrowed" || !item.dueDate) {
      return false;
    }

    const diff =
      (new Date(item.dueDate).setHours(0, 0, 0, 0) -
        new Date().setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= 3;
  }).length;

  return (
    <>
      <section className="page-hero compact">
        <div className="hero-copy">
          <span className="eyebrow">Issue, Return & History</span>
          <h1>Track active loans, due dates, returns, fines, and overdue alerts in one desk view.</h1>
          <p>
            Your transaction history now highlights overdue items, reminder windows,
            fine calculation, and the return workflow from the same member module.
          </p>
        </div>
        <div className="hero-panel">
          <div className="metric-strip three-up">
            <article className="metric-tile">
              <span>Active loans</span>
              <strong>{activeLoans}</strong>
            </article>
            <article className="metric-tile">
              <span>Overdue alerts</span>
              <strong>{overdueLoans}</strong>
            </article>
            <article className="metric-tile">
              <span>Fine total</span>
              <strong>{`Rs ${totalFine}`}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section">
        {(overdueLoans > 0 || dueSoon > 0) && (
          <div className="alert-strip">
            {overdueLoans > 0 && (
              <article className="alert-card danger">
                <strong>{overdueLoans} overdue item(s)</strong>
                <p>Return overdue titles soon to stop fines from increasing.</p>
              </article>
            )}
            {dueSoon > 0 && (
              <article className="alert-card">
                <strong>{dueSoon} due soon</strong>
                <p>These books are approaching the due date within the next 3 days.</p>
              </article>
            )}
            <article className="alert-card success">
              <strong>{returnedLoans} returned</strong>
              <p>Your full transaction history stays available below.</p>
            </article>
          </div>
        )}

        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}

        {!error && data.length === 0 ? (
          <div className="empty-state">
            <h3>Your shelf is empty.</h3>
            <p>Visit the catalog to borrow a title and it will appear here instantly.</p>
          </div>
        ) : (
          <div className="borrow-list">
            {data.map((item) => (
              <article key={item._id} className="borrow-card">
                <div className="borrow-card-main">
                  <div className="timeline-dot" />
                  <div>
                    <span className="borrow-label">Loan record</span>
                    <h3>{item.book?.title || "Unknown book"}</h3>
                    <p>{item.book?.author || "Author unavailable"}</p>
                  </div>
                </div>

                <div className="borrow-meta">
                  <div>
                    <span>Borrowed</span>
                    <strong>
                      {new Date(item.borrowDate).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span>Due date</span>
                    <strong>
                      {item.dueDate
                        ? new Date(item.dueDate).toLocaleDateString()
                        : "Not set"}
                    </strong>
                  </div>
                  <div>
                    <span>Returned</span>
                    <strong>
                      {item.returnDate
                        ? new Date(item.returnDate).toLocaleDateString()
                        : "Currently on loan"}
                    </strong>
                  </div>
                  <div>
                    <span>Fine</span>
                    <strong>{`Rs ${item.fineAmount || 0}`}</strong>
                  </div>
                </div>

                <div className="borrow-actions">
                  <span
                    className={
                      item.status === "Returned"
                        ? "status-pill warning"
                        : item.status === "Overdue"
                          ? "status-pill"
                          : "status-pill success"
                    }
                  >
                    {item.status}
                  </span>
                  {item.status === "Borrowed" ? (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={busyBorrowId === item._id}
                      onClick={() => returnBook(item._id)}
                    >
                      {busyBorrowId === item._id ? "Returning..." : "Mark Returned"}
                    </button>
                  ) : item.status === "Overdue" ? (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={busyBorrowId === item._id}
                      onClick={() => returnBook(item._id)}
                    >
                      {busyBorrowId === item._id ? "Returning..." : "Return with Fine"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ghost-button muted-action"
                      disabled
                    >
                      Complete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
