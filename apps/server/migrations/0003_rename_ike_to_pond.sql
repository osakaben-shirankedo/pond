ALTER TABLE `ikes` RENAME TO `ponds`;
ALTER TABLE `ponds` RENAME COLUMN `ike_name` TO `name`;
ALTER TABLE `users` RENAME COLUMN `belonging_ike_ids` TO `belonging_pond_ids`;
ALTER TABLE `timeline_posts` RENAME COLUMN `ike_id` TO `pond_id`;
ALTER TABLE `timeline_posts` RENAME COLUMN `ike_category` TO `pond_category`;
