-- v10: Simplify role system to Admin / Project Manager / Member / Client
-- Run this script once against the production database.

-- ── Step 1: Expand enums to accept both old and new values ────────────────

ALTER TABLE User
  MODIFY COLUMN systemRole ENUM('RANK1','RANK2','RANK3','ADMIN','PROJECT_MANAGER','MEMBER')
  DEFAULT 'MEMBER';

-- ProjectMember.role may also be constrained; widen it first
ALTER TABLE ProjectMember
  MODIFY COLUMN role ENUM('OWNER','ADMIN','MEMBER','VIEWER','CLIENT','RANK1','RANK2','RANK3','PROJECT_MANAGER')
  DEFAULT 'MEMBER';

-- ── Step 2: Migrate existing data ────────────────────────────────────────

-- System roles on User table
UPDATE User SET systemRole = 'ADMIN'           WHERE systemRole = 'RANK1';
UPDATE User SET systemRole = 'PROJECT_MANAGER' WHERE systemRole = 'RANK2';
UPDATE User SET systemRole = 'MEMBER'          WHERE systemRole = 'RANK3' OR systemRole IS NULL OR systemRole = '';

-- Project member roles
UPDATE ProjectMember SET role = 'PROJECT_MANAGER' WHERE role IN ('OWNER', 'RANK1', 'RANK2');
UPDATE ProjectMember SET role = 'MEMBER'          WHERE role IN ('VIEWER', 'ADMIN') OR role IS NULL OR role = '';
-- CLIENT stays CLIENT

-- ── Step 3: Lock enums down to new values only ───────────────────────────

ALTER TABLE User
  MODIFY COLUMN systemRole ENUM('ADMIN','PROJECT_MANAGER','MEMBER')
  DEFAULT 'MEMBER';

ALTER TABLE ProjectMember
  MODIFY COLUMN role ENUM('ADMIN','PROJECT_MANAGER','MEMBER','CLIENT')
  DEFAULT 'MEMBER';
