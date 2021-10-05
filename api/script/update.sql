ALTER TABLE `bbs_write` ADD `isnoti` TINYINT(1) NOT NULL AFTER `deleted`;

delete from `bbs_write` where `deleted` = 1;
delete from `bbs_cmt` where `deleted` = 1;
delete from `gallery_comment` where `deleted` = 1;

update `bbs_write` set `isnoti` = 1 where `deleted` = -1;

ALTER TABLE `bbs_write` DROP `deleted`;
ALTER TABLE `bbs_cmt` DROP `deleted`;
ALTER TABLE `gallery_comment` DROP `deleted`;
