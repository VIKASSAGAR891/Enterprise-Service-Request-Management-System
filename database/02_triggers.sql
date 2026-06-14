USE esrms;

DELIMITER $$

CREATE TRIGGER trg_set_resolved_time
BEFORE UPDATE
ON service_requests
FOR EACH ROW
BEGIN

    IF NEW.status = 'RESOLVED'
       AND OLD.status <> 'RESOLVED' THEN

        SET NEW.resolved_at = CURRENT_TIMESTAMP;

    END IF;

END$$

DELIMITER ;



DELIMITER $$

CREATE TRIGGER trg_request_status_history
AFTER UPDATE
ON service_requests
FOR EACH ROW
BEGIN

    IF OLD.status <> NEW.status THEN

        INSERT INTO request_history
        (
            request_id,
            old_status,
            new_status,
            changed_at
        )
        VALUES
        (
            NEW.request_id,
            OLD.status,
            NEW.status,
            CURRENT_TIMESTAMP
        );

    END IF;

END$$

DELIMITER ;



DELIMITER $$

CREATE TRIGGER trg_assignment_audit
AFTER INSERT
ON assignments
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs
    (
        action,
        action_time
    )
    VALUES
    (
        CONCAT(
            'Request ',
            NEW.request_id,
            ' assigned to Agent ',
            NEW.agent_id
        ),
        CURRENT_TIMESTAMP
    );

END$$

DELIMITER ;