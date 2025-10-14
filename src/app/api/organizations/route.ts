import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase";
import { validate as uuidValidate } from 'uuid';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  //TODO
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const id = request.nextUrl.searchParams.get("id");


    const convertToInt = Number(id)
    if(!Number.isInteger(convertToInt) && !uuidValidate(id)){
      console.error("ID is not an Integer or a UUID");
      return NextResponse.json(
        { error: "ID is not an Integer or a UUID"},
        { status: 400 }
      );
    } 

    const { data: organization, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("No row matches ID ", error.message);
      return NextResponse.json({ error: "No row matches ID" }, { status: 404 });
    }

    const { data: deletedOrganization, error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id)
      .select();

    if (deleteError) {
      console.error("Error fetching items:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: { organization: deletedOrganization[0] },
        error: null,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Unexpected error in GET handler:");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const requestData = await request.json();

    const { data: addedOrganization, error } = await supabase
      .from("organizations")
      .insert(requestData)
      .select();

    if (error) {
      console.error("Error fetching items:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: addedOrganization,
        error: null,
      },
      { status: 200 }
    );
  } catch (e) {}
}
