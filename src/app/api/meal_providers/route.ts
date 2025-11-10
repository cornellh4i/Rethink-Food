import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const cboId = searchParams.get('cbo_id');
    const restaurantId = searchParams.get('restaurant_id');

    let query = supabase
  .from('meal_providers')
  .select(`
    *,
    cbo:cbo_id (*),
    restaurant:restaurant_id (*)
  `);

    if (cboId) {
      query = query.eq('cbo_id', cboId);
    }
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: mealProviders, error } = await query;

    if (error) {
      console.error('Error fetching meal providers:', error.message);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: mealProviders?.length || 0,
      meal_providers: mealProviders || []
    }, { status: 200 });

  } catch (e) {
    console.error('Unexpected error in GET handler:', e);
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}