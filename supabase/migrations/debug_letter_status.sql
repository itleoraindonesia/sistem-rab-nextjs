  -- ============================================================================
  -- Debug: Check letter status and verify
  -- ============================================================================

  -- Check actual letter status
  SELECT 
    'Current Letter Status' as info,
    id,
    status,
    updated_at
  FROM outgoing_letters
  WHERE id = 'ac843669-dfe3-4a35-b951-e5b418da67ff';

  -- Check all history entries for this letter
  SELECT 
    'History Entries' as info,
    id,
    action_type,
    to_status,
    stage_type,
    assigned_to_id,
    created_at
  FROM letter_histories
  WHERE letter_id = 'ac843669-dfe3-4a35-b951-e5b418da67ff'
  ORDER BY created_at DESC;

  -- Check pending review entries (what getPendingReviews returns)
  SELECT 
    'Pending Reviews Query Check' as info,
    lh.id as history_id,
    lh.assigned_to_id,
    lh.to_status,
    lh.stage_type,
    ol.id as letter_id,
    ol.status as letter_status,
    ol.subject
  FROM letter_histories lh
  JOIN outgoing_letters ol ON lh.letter_id = ol.id
  WHERE lh.assigned_to_id = '2f05da18-d6c6-45c1-a86a-700cb51255f0'
    AND lh.to_status IS NULL
    AND lh.stage_type = 'REVIEW'
  ORDER BY lh.created_at DESC;
