import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../../lib/supabase";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { id } = await params;

    const convertIDToInt = Number(id);
    if (!Number.isInteger(convertIDToInt)) {
      console.error("ID is not an Integer");
      return NextResponse.json(
        { error: "ID is not an Integer" },
        { status: 400 }
      );
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select()
      .eq("id", convertIDToInt);

    if (error) {
      console.error("Error fetching restaurant by ID:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!restaurant || restaurant.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: "true", data: { restaurant: restaurant[0] }, error: null },
      { status: 200 }
    );
  } catch (e) {
    console.error("Unexpected error in GET Restaurants by ID handler:");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
