-- Migration: Grant execute on deactivate_active_stack to authenticated users
-- Description: The function was created with REVOKE ALL FROM PUBLIC but never
--   granted to authenticated/service_role, making it uncallable via RPC.
-- Dependencies: 20260224000007_add_deactivate_stack_fn

GRANT EXECUTE ON FUNCTION deactivate_active_stack(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_active_stack(UUID) TO service_role;
