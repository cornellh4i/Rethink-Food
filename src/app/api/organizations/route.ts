import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: items, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_type', 'restaurant')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      count: items ?.length || 0,
      organizations: items || []
    }, { status: 200 });
    
  } catch (e) {
    console.error('Unexpected error in GET handler:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
