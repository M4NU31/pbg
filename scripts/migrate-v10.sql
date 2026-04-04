-- v10: Simplify role system to Admin / Project Manager / Member / Client

-- System roles on User table
UPDATE User SET systemRole = 'ADMIN'           WHERE systemRole = 'RANK1';
UPDATE User SET systemRole = 'PROJECT_MANAGER' WHERE systemRole = 'RANK2';
UPDATE User SET systemRole = 'MEMBER'          WHERE systemRole = 'RANK3' OR systemRole IS NULL;

-- Project member roles
UPDATE ProjectMember SET role = 'PROJECT_MANAGER' WHERE role = 'OWNER';
UPDATE ProjectMember SET role = 'MEMBER'          WHERE role IN ('RANK1', 'RANK2', 'VIEWER', 'ADMIN');
-- CLIENT stays CLIENT
