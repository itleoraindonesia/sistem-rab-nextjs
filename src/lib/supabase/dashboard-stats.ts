import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats(userId?: string) {
  const supabase = await createClient()

  // 1. Total Surat Keluar (Global)
  const { count: totalLetters } = await supabase
    .from('outgoing_letters')
    .select('*', { count: 'exact', head: true })

  // 2. Total Memos (using MoM Meetings as a proxy or if table exists)
  const { count: totalMemos } = await supabase
    .from('mom_meetings')
    .select('*', { count: 'exact', head: true })

  // 3. Menunggu Review (User specific if userId provided, otherwise global)
  let pendingReviewsQuery = supabase
    .from('outgoing_letters')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'SUBMITTED_TO_REVIEW')
  
  // If specific logic for "Assigned to me" is needed, we'd check letter_histories
  // For now, let's keep it global for the "Administration Dashboard"
  const { count: pendingReviews } = await pendingReviewsQuery

  // 4. Disetujui Bulan Ini
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: approvedThisMonth } = await supabase
    .from('outgoing_letters')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'APPROVED')
    .gte('approved_at', firstDayOfMonth)

  // 5. Recent Documents
  const { data: recentDocuments } = await supabase
    .from('outgoing_letters')
    .select(`
      id,
      subject,
      status,
      created_at,
      document_type:document_types(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // 6. Trends (dummy for now, but we could calculate last month vs this month)
  // Let's just return basic counts for now

  return {
    stats: {
      totalLetters: totalLetters || 0,
      totalMemos: totalMemos || 0,
      pendingReviews: pendingReviews || 0,
      approvedThisMonth: approvedThisMonth || 0,
    },
    recentDocuments: (recentDocuments || []).map(doc => {
      const docType = Array.isArray(doc.document_type)
        ? doc.document_type[0]
        : doc.document_type
      return {
        id: doc.id,
        title: doc.subject,
        status: doc.status,
        type: (docType as { name?: string })?.name || 'Surat',
        time: doc.created_at,
      }
    })
  }
}
