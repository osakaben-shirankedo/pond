CREATE TABLE `timeline_posts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `ike_id` text NOT NULL,
  `ike_category` text NOT NULL,
  `content` text NOT NULL,
  `reply_to_id` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE TABLE `timeline_likes` (
  `id` text PRIMARY KEY NOT NULL,
  `post_id` text NOT NULL REFERENCES `timeline_posts`(`id`),
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `created_at` text NOT NULL
);
