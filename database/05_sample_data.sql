USE esrms;

INSERT INTO users
(full_name,email,password_hash,role)
VALUES
('Vikas Sagar','vikas@company.com','123','EMPLOYEE'),
('Manjoth Singh','rahul@company.com','123','AGENT'),
('Shruti','priya@company.com','123','TEAM_LEAD'),
('Admin User','admin@company.com','123','ADMIN');


INSERT INTO agents
(user_id,dept_id,workload)
VALUES
(2,1,0);

INSERT INTO sla_policies
(priority_id,response_hours,resolution_hours)
VALUES
(1,24,72),
(2,8,24),
(3,4,12),
(4,1,4);


INSERT INTO assets
(asset_name,asset_type,purchase_date)
VALUES
('Dell Latitude 5420','Laptop','2024-01-15'),
('HP LaserJet Pro','Printer','2023-08-10'),
('Cisco Router','Network Device','2024-03-05');


INSERT INTO service_requests
(
user_id,
category_id,
priority_id,
sla_id,
title,
description
)
VALUES
(
1,
1,
3,
3,
'Software Installation',
'Need IntelliJ IDEA installed'
),

(
1,
3,
4,
4,
'Internet Down',
'Unable to access office network'
);



SELECT * FROM users;

SELECT * FROM agents;

SELECT * FROM sla_policies;

SELECT * FROM assets;

SELECT * FROM service_requests;




CALL Assign_Request(1,1);
SELECT * FROM assignments;



SELECT request_id,status
FROM service_requests;


SELECT * FROM audit_logs;


CALL Resolve_Request(1);


SELECT * FROM request_history;


SELECT
request_id,
status,
resolved_at
FROM service_requests
WHERE request_id = 1;