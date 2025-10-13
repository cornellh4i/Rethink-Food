import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: items, error } = await supabase
      .from('organizations')
      .select('*')
      .in('org_type', ['restaurant', 'cbo'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      count: items?.length || 0,
      organizations: items || []
    }, { status: 200 });
    
  } catch (e) {
    console.error('Unexpected error in GET handler:');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Bad request: Missing id parameter"
      }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    if (!isUUID) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Bad request: Invalid UUID format"
      }, { status: 400 });
    }

    let updateData;
    try {
      const body = await request.json();
      if (!body || Object.keys(body).length === 0) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "Bad request: Empty JSON body"
        }, { status: 400 });
      }
      updateData = body;
    } catch (e) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Bad request: Invalid JSON body"
      }, { status: 400 });
    }

    // Perform the update
    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error.message);
      return NextResponse.json({
        success: false,
        data: null,
        error: "Internal Server Error"
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "No Row matches"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        organization: data
      },
      error: null
    }, { status: 200 });

  } catch (e) {
    console.error('Unexpected error in PATCH handler:', e);
    return NextResponse.json({
      success: false,
      data: null,
      error: "Internal Server Error"
    }, { status: 500 });
  }
}