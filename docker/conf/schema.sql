CREATE TABLE IF NOT EXISTS role (
    roleID int primary key AUTO_INCREMENT,
    roleName varchar(255) unique
);

insert into role (roleID, roleName) values(1, 'Teacher');
insert into role (roleID, roleName) values(2, 'Student');
insert into role (roleID, roleName) values(3, 'Admin');


