-- Migration: Add CANCELLED to letter_action_type enum
-- Date: 2026-02-28
-- Must run in its own transaction before any DML that uses 'CANCELLED'.
-- PostgreSQL requires enum additions to be committed before use in the same session.

ALTER TYPE letter_action_type ADD VALUE IF NOT EXISTS 'CANCELLED';
