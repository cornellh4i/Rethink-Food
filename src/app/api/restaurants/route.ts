import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: restaurants, error } = await supabase
      .from("organizations")
      .select()

    if (error) {
      console.error("Error fetching restaurants:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        count: restaurants?.length || 0,
        restaurants: restaurants || [],
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Unexpected error in GET Restaurants handler:");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
