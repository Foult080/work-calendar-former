-- Таблица для производственного календаря
CREATE TABLE logs_test.calendar (
    `id_record` smallint PRIMARY KEY AUTO_INCREMENT,
    `date_year` text,
    `date_month` text,
    `date_info` json,
    `working_days` json,
    `days` json,
    `crdate` datetime DEFAULT (now())
);