import type {ReviewType} from "./review";

// Copyright-aware mock data - using generic placeholder names and local avatars
const reviews: ReviewType[] = [
  {
    user: {
      name: "Reviewer Alpha",
      avatar: "/avatars/reviewer-1.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 5,
    title: "Great product",
    content: "This platform has everything I need for competitive gaming analytics.",
  },
  {
    user: {
      name: "Reviewer Bravo",
      avatar: "/avatars/reviewer-2.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 4,
    title: "Fantastic product",
    content: "The replay analysis features are incredibly detailed and helpful.",
  },
  {
    user: {
      name: "Reviewer Charlie",
      avatar: "/avatars/reviewer-3.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 3,
    title: "Beautiful product",
    content: "Nice interface design, looking forward to more features.",
  },
  {
    user: {
      name: "Reviewer Delta",
      avatar: "/avatars/reviewer-4.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 2,
    title: "Average product",
    content: "Some features work well, others need improvement.",
  },
  {
    user: {
      name: "Reviewer Echo",
      avatar: "/avatars/reviewer-5.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 1,
    title: "Disappointing product",
    content: "Expected more from the matchmaking system.",
  },
  {
    user: {
      name: "Reviewer Foxtrot",
      avatar: "/avatars/reviewer-6.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 5,
    title: "Great product",
    content: "Perfect for team coordination and practice sessions.",
  },
  {
    user: {
      name: "Reviewer Golf",
      avatar: "/avatars/reviewer-7.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 4,
    title: "Good product",
    content: "The leaderboard system is well implemented.",
  },
  {
    user: {
      name: "Reviewer Hotel",
      avatar: "/avatars/reviewer-8.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 3,
    title: "Average product",
    content: "Decent platform, could use more game integrations.",
  },
  {
    user: {
      name: "Reviewer India",
      avatar: "/avatars/reviewer-9.svg",
    },
    createdAt: "2024-08-01T12:00:00.000Z",
    rating: 2,
    title: "Bad product",
    content: "Had some issues with the replay upload feature.",
  },
];

export default reviews;
