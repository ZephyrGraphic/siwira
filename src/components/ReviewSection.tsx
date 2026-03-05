"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HiStar } from "react-icons/hi";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) {
        console.error("Failed to fetch reviews:", res.status);
        setReviews([]);
        setAvgRating(0);
        setTotalReviews(0);
        return;
      }
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotalReviews(data.totalReviews || 0);

      // Check if user already reviewed
      if (session) {
        const userId = (session.user as any).id;
        const myReview = (data.reviews || []).find(
          (r: Review) => r.user.id === userId,
        );
        if (myReview) {
          setMyRating(myReview.rating);
          setMyComment(myReview.comment || "");
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const submitReview = async () => {
    if (myRating === 0) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: myRating,
          comment: myComment || null,
        }),
      });
      await fetchReviews();
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && setMyRating(star)}
          disabled={!interactive}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <HiStar
            size={interactive ? 28 : 14}
            className={star <= rating ? "text-amber-400" : "text-slate-200"}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="h-px my-4" style={{ background: "var(--border)" }} />

      {/* Rating Summary */}
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Ulasan ({totalReviews})
        </h2>
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5">
            <HiStar size={16} className="text-amber-400" />
            <span className="font-bold text-sm text-slate-800">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">/ 5</span>
          </div>
        )}
      </div>

      {/* Write Review Button */}
      {session && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600 font-medium mb-4 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          ✍️ {myRating > 0 ? "Edit Ulasan" : "Tulis Ulasan"}
        </button>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3 border border-slate-200">
          <div className="text-center">{renderStars(myRating, true)}</div>
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder="Tulis komentar (opsional)..."
            rows={2}
            className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-teal-400 resize-none text-slate-700"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-500 bg-white border border-slate-200"
            >
              Batal
            </button>
            <button
              onClick={submitReview}
              disabled={myRating === 0 || submitting}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: myRating > 0 ? "var(--primary)" : "#cbd5e1",
              }}
            >
              {submitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </div>
      )}

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          Belum ada ulasan untuk produk ini.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-3 border border-slate-100"
            >
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {review.user.name}
                  </p>
                  <div className="mt-0.5">{renderStars(review.rating)}</div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600 mt-1.5">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
