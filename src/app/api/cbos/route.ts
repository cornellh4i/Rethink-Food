import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: cbos, error } = await supabase
      .from('cbos') 
      .select('*');

    if (error) {
      console.error('Error fetching CBOs:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      count: cbos?.length || 0,
      cbos: cbos || []
    }, { status: 200 });
    
  } catch (e) {
    console.error('Unexpected error in GET CBOs handler:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}