USE esrms;

DROP PROCEDURE IF EXISTS `Assign_Request`;
DELIMITER $$
CREATE PROCEDURE `Assign_Request`(
    IN p_request_id INT,
    IN p_agent_id INT
)
BEGIN

    INSERT INTO assignments
    (
        request_id,
        agent_id
    )
    VALUES
    (
        p_request_id,
        p_agent_id
    );

    UPDATE service_requests
    SET status='ASSIGNED'
    WHERE request_id=p_request_id;

END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS `Close_Request`;
DELIMITER $$
CREATE PROCEDURE `Close_Request`(
    IN p_request_id INT
)
BEGIN

    UPDATE service_requests
    SET status='CLOSED'
    WHERE request_id=p_request_id;

END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS `Escalate_Request`;
DELIMITER $$
CREATE PROCEDURE `Escalate_Request`(
    IN p_request_id INT,
    IN p_reason VARCHAR(255)
)
BEGIN

    INSERT INTO escalations
    (
        request_id,
        escalated_to,
        reason
    )
    VALUES
    (
        p_request_id,
        'TEAM_LEAD',
        p_reason
    );

    UPDATE service_requests
    SET status='ESCALATED'
    WHERE request_id=p_request_id;

END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS `Resolve_Request`;
DELIMITER $$
CREATE PROCEDURE `Resolve_Request`(
    IN p_request_id INT
)
BEGIN

    UPDATE service_requests
    SET status='RESOLVED'
    WHERE request_id=p_request_id;

END$$
DELIMITER ;

