/**
 * Reviews & Ratings UI Component
 * Coach and session review/rating interface per PRD D.4.3
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  Progress,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface Review {
  id: string;
  sessionId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  targetId: string; // Coach or session ID
  targetType: "coach" | "session";
  rating: number; // 1-5
  title?: string;
  content: string;
  categories?: {
    communication?: number;
    knowledge?: number;
    helpfulness?: number;
    patience?: number;
    valueForMoney?: number;
  };
  isVerified: boolean; // Verified purchase/session
  helpfulCount: number;
  reportCount: number;
  createdAt: Date;
  updatedAt?: Date;
  coachResponse?: {
    content: string;
    createdAt: Date;
  };
}

export interface RatingsSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categoryAverages?: {
    communication: number;
    knowledge: number;
    helpfulness: number;
    patience: number;
    valueForMoney: number;
  };
}

export interface ReviewFormData {
  rating: number;
  title?: string;
  content: string;
  categories?: {
    communication?: number;
    knowledge?: number;
    helpfulness?: number;
    patience?: number;
    valueForMoney?: number;
  };
}

export interface ReviewsListProps {
  reviews: Review[];
  summary: RatingsSummary;
  canWriteReview: boolean;
  currentUserId?: string;
  onSubmitReview: (data: ReviewFormData) => Promise<void>;
  onHelpful: (reviewId: string) => void;
  onReport: (reviewId: string, reason: string) => void;
  onCoachRespond?: (reviewId: string, content: string) => Promise<void>;
  isCoachView?: boolean;
  className?: string;
}

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication",
  knowledge: "Game Knowledge",
  helpfulness: "Helpfulness",
  patience: "Patience",
  valueForMoney: "Value for Money",
};

const REPORT_REASONS = [
  "Inappropriate content",
  "Spam or fake review",
  "Off-topic",
  "Harassment",
  "Other",
];

// ============================================================================
// Components
// ============================================================================

/**
 * Star Rating Component
 */
export function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
  showValue = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  const displayValue = hoverValue ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`
            ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
            transition-transform
          `}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(null)}
        >
          <Icon
            icon={
              star <= displayValue
                ? "solar:star-bold"
                : "solar:star-line-duotone"
            }
            className={`${sizeClass} ${
              star <= displayValue ? "text-warning" : "text-default-300"
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 font-semibold text-default-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/**
 * Ratings Summary Component
 */
export function RatingsSummaryCard({
  summary,
  className = "",
}: {
  summary: RatingsSummary;
  className?: string;
}) {
  const maxDistribution = Math.max(...Object.values(summary.distribution));

  return (
    <Card className={className}>
      <CardBody className="p-4">
        <div className="flex gap-6">
          {/* Average Score */}
          <div className="text-center">
            <p className="text-4xl font-bold text-warning">
              {summary.averageRating.toFixed(1)}
            </p>
            <StarRating value={summary.averageRating} readonly size="sm" />
            <p className="text-sm text-default-500 mt-1">
              {summary.totalReviews} reviews
            </p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count =
                summary.distribution[
                  stars as keyof typeof summary.distribution
                ];
              const percentage =
                summary.totalReviews > 0
                  ? (count / summary.totalReviews) * 100
                  : 0;

              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-8">{stars}★</span>
                  <Progress
                    value={
                      maxDistribution > 0 ? (count / maxDistribution) * 100 : 0
                    }
                    className="flex-1"
                    size="sm"
                    color="warning"
                  />
                  <span className="text-sm text-default-500 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Averages */}
        {summary.categoryAverages && (
          <>
            <Divider className="my-4" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(summary.categoryAverages).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-lg font-bold">{value.toFixed(1)}</p>
                  <p className="text-xs text-default-500">
                    {CATEGORY_LABELS[key] || key}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Reviews List Component
 */
export function ReviewsList({
  reviews,
  summary,
  canWriteReview,
  currentUserId,
  onSubmitReview,
  onHelpful,
  onReport,
  onCoachRespond,
  isCoachView = false,
  className = "",
}: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">(
    "recent"
  );
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const writeReviewModal = useDisclosure();

  const sortedReviews = useMemo(() => {
    const filtered = filterRating
      ? reviews.filter((r) => Math.floor(r.rating) === filterRating)
      : reviews;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "helpful":
          return b.helpfulCount - a.helpfulCount;
        case "rating":
          return b.rating - a.rating;
        case "recent":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [reviews, sortBy, filterRating]);

  return (
    <div className={className}>
      {/* Summary */}
      <RatingsSummaryCard summary={summary} className="mb-6" />

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Sort */}
          <span className="text-sm text-default-500">Sort by:</span>
          {(["recent", "helpful", "rating"] as const).map((option) => (
            <Chip
              key={option}
              variant={sortBy === option ? "solid" : "bordered"}
              className="cursor-pointer capitalize"
              onClick={() => setSortBy(option)}
            >
              {option}
            </Chip>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-default-500">Filter:</span>
          <Chip
            variant={filterRating === null ? "solid" : "bordered"}
            className="cursor-pointer"
            onClick={() => setFilterRating(null)}
          >
            All
          </Chip>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Chip
              key={rating}
              variant={filterRating === rating ? "solid" : "bordered"}
              className="cursor-pointer"
              onClick={() => setFilterRating(rating)}
            >
              {rating}★
            </Chip>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {canWriteReview && !isCoachView && (
        <Button
          color="primary"
          className="w-full mb-4"
          startContent={<Icon icon="solar:pen-bold" className="w-4 h-4" />}
          onClick={writeReviewModal.onOpen}
        >
          Write a Review
        </Button>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onHelpful={() => onHelpful(review.id)}
              onReport={(reason) => onReport(review.id, reason)}
              onCoachRespond={
                isCoachView && onCoachRespond
                  ? (content) => onCoachRespond(review.id, content)
                  : undefined
              }
              isCoachView={isCoachView}
            />
          ))}
        </AnimatePresence>

        {sortedReviews.length === 0 && (
          <Card>
            <CardBody className="text-center py-8">
              <Icon
                icon="solar:star-bold"
                className="w-12 h-12 mx-auto text-default-300 mb-2"
              />
              <p className="text-default-500">
                {filterRating
                  ? `No ${filterRating}-star reviews yet`
                  : "No reviews yet"}
              </p>
              {canWriteReview && !filterRating && (
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onClick={writeReviewModal.onOpen}
                >
                  Be the first to review
                </Button>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={writeReviewModal.isOpen}
        onClose={writeReviewModal.onClose}
        onSubmit={onSubmitReview}
      />
    </div>
  );
}

/**
 * Individual Review Card
 */
function ReviewCard({
  review,
  currentUserId,
  onHelpful,
  onReport,
  onCoachRespond,
  isCoachView,
}: {
  review: Review;
  currentUserId?: string;
  onHelpful: () => void;
  onReport: (reason: string) => void;
  onCoachRespond?: (content: string) => void;
  isCoachView: boolean;
}) {
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [responseContent, setResponseContent] = useState("");

  const isOwn = currentUserId === review.reviewerId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card>
        <CardBody className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={review.reviewerAvatar}
                name={review.reviewerName}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.reviewerName}</span>
                  {review.isVerified && (
                    <Chip size="sm" color="success" variant="flat">
                      <Icon
                        icon="solar:verified-check-bold"
                        className="w-3 h-3 mr-1"
                      />
                      Verified
                    </Chip>
                  )}
                </div>
                <p className="text-xs text-default-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <StarRating value={review.rating} readonly size="sm" />
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-semibold mb-2">{review.title}</h4>
          )}

          {/* Content */}
          <p className="text-default-600">{review.content}</p>

          {/* Categories */}
          {review.categories && (
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              {Object.entries(review.categories).map(
                ([key, value]) =>
                  value && (
                    <div key={key} className="flex items-center gap-1">
                      <span className="text-default-500">
                        {CATEGORY_LABELS[key]}:
                      </span>
                      <StarRating value={value} readonly size="sm" />
                    </div>
                  )
              )}
            </div>
          )}

          {/* Coach Response */}
          {review.coachResponse && (
            <div className="mt-4 p-3 bg-default-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  icon="solar:chat-round-bold"
                  className="w-4 h-4 text-primary"
                />
                <span className="font-medium text-sm">Coach Response</span>
              </div>
              <p className="text-sm text-default-600">
                {review.coachResponse.content}
              </p>
              <p className="text-xs text-default-400 mt-1">
                {new Date(review.coachResponse.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-divider">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="light"
                startContent={
                  <Icon icon="solar:like-bold" className="w-4 h-4" />
                }
                onClick={onHelpful}
              >
                Helpful ({review.helpfulCount})
              </Button>
              {!isOwn && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    startContent={
                      <Icon icon="solar:flag-bold" className="w-4 h-4" />
                    }
                    onClick={() => setShowReportMenu(!showReportMenu)}
                  >
                    Report
                  </Button>
                  {showReportMenu && (
                    <Card className="absolute top-full left-0 mt-1 z-10 w-48">
                      <CardBody className="p-2">
                        {REPORT_REASONS.map((reason) => (
                          <Button
                            key={reason}
                            size="sm"
                            variant="light"
                            className="w-full justify-start"
                            onClick={() => {
                              onReport(reason);
                              setShowReportMenu(false);
                            }}
                          >
                            {reason}
                          </Button>
                        ))}
                      </CardBody>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Coach Response Button */}
            {isCoachView && !review.coachResponse && onCoachRespond && (
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onClick={() => setShowRespondForm(!showRespondForm)}
              >
                Respond
              </Button>
            )}
          </div>

          {/* Respond Form */}
          {showRespondForm && onCoachRespond && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Write your response..."
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                maxLength={1000}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => setShowRespondForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => {
                    onCoachRespond(responseContent);
                    setResponseContent("");
                    setShowRespondForm(false);
                  }}
                  isDisabled={!responseContent.trim()}
                >
                  Submit Response
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

/**
 * Write Review Modal
 */
function WriteReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<ReviewFormData["categories"]>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        categories: showCategories ? categories : undefined,
      });
      onClose();
      // Reset form
      setRating(0);
      setTitle("");
      setContent("");
      setCategories({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Write a Review</ModalHeader>
        <ModalBody className="gap-4">
          {/* Overall Rating */}
          <div className="text-center">
            <p className="text-sm text-default-500 mb-2">
              How would you rate your experience?
            </p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-sm font-medium mt-2">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          <Divider />

          {/* Category Ratings */}
          <div>
            <Button
              size="sm"
              variant="light"
              onClick={() => setShowCategories(!showCategories)}
              endContent={
                <Icon
                  icon={
                    showCategories
                      ? "solar:alt-arrow-up-bold"
                      : "solar:alt-arrow-down-bold"
                  }
                  className="w-4 h-4"
                />
              }
            >
              Rate specific categories (optional)
            </Button>

            {showCategories && (
              <div className="space-y-3 mt-3">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <StarRating
                      value={categories?.[key as keyof typeof categories] || 0}
                      onChange={(val) =>
                        setCategories({ ...categories, [key]: val })
                      }
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Review Title (optional)
            </label>
            <input
              type="text"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 rounded-lg bg-default-100 border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Your Review
            </label>
            <Textarea
              placeholder="Share your experience in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={4}
              maxLength={2000}
            />
            <p className="text-xs text-default-400 text-right mt-1">
              {content.length}/2000
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={rating === 0 || !content.trim()}
          >
            Submit Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Compact Rating Badge
 */
export function RatingBadge({
  rating,
  reviewCount,
  size = "md",
  className = "",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon
        icon="solar:star-bold"
        className={`text-warning ${sizeClasses[size]}`}
      />
      <span className={`font-semibold ${sizeClasses[size]}`}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-default-400 text-sm">({reviewCount})</span>
      )}
    </div>
  );
}

// Default export
const ReviewsRatingsComponents = {
  StarRating,
  RatingsSummaryCard,
  ReviewsList,
  RatingBadge,
};

export default ReviewsRatingsComponents;
